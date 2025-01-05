import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import User from './models/User.js';
import Notification from './models/Notification.js';

import ChatRoom from './models/ChatRoom.js';
import Message from './models/Message.js';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from "bcrypt";
import { createServer } from "http"; // Import HTTP server
import { Server } from "socket.io"; // Import Socket.IO
import multer from 'multer';
import { uploadProfilePicture, getProfilePicture } from './utils/filenCloudServer.js';
import path from 'path';
import { Resend } from 'resend';
import fs from 'fs/promises';
import Group from './models/Group.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const SECRET_KEY = process.env.JWT_SECRET;

const app = express();
const PORT = 5001;

// Create HTTP server
const server = createServer(app);

// Middleware
app.use(express.json());
app.use(cors());

// Setup Nodemailer with Gmail and App Password
const resend = new Resend(dotenv.RESEND_API_KEY);

// Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    console.log('Authenticating request...');
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      console.log('No authorization header found');
      return res.status(401).json({ error: 'No authorization header' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      console.log('No token found in authorization header');
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, SECRET_KEY);
    console.log('Decoded token:', decoded);

    // Use id instead of userId since that's what we stored in the token
    const user = await User.findById(decoded.id);
    if (!user) {
      console.log('User not found:', decoded.id);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('Authentication successful for user:', user._id);
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Generate Random 6-Digit Code
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// MongoDB Connection with error handling
mongoose.connect('mongodb://127.0.0.1:27017/StudyBuddy')
  .then(() => console.log('MongoDB Connected Successfully'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('join room', (roomId) => {
    socket.join(roomId);
    console.log(`User joined room: ${roomId}`);
    // Reset unread count when user joins room
    if (socket.user) {
      ChatRoom.findById(roomId).then(chatroom => {
        if (chatroom) {
          chatroom.setUnreadCountForUser(socket.user._id, 0);
          chatroom.save();
        }
      });
    }
  });

  socket.on('send message', async ({ roomId, content, sender }) => {
    try {
      const message = new Message({
        content,
        sender,
        chatRoom: roomId,  // Add chatRoom reference
        timestamp: new Date()
      });
      await message.save();

      const chatroom = await ChatRoom.findById(roomId);
      if (!chatroom) return;

      chatroom.messages.push(message._id);

      // Initialize unread counts if needed
      if (!chatroom.unreadCounts) {
        chatroom.unreadCounts = {};
      }

      // Increment unread count for other participants
      chatroom.participants.forEach(participantId => {
        const participantIdStr = participantId.toString();
        if (participantIdStr !== sender.toString()) {
          chatroom.unreadCounts[participantIdStr] =
            (chatroom.unreadCounts[participantIdStr] || 0) + 1;
        }
      });

      await chatroom.save();

      // Populate the message with sender info and include chatRoom ID
      const populatedMessage = await Message.findById(message._id)
        .populate('sender', 'firstName lastName profilePicture');

      // Add chatRoom ID to the populated message
      const messageWithRoom = {
        ...populatedMessage.toObject(),
        chatRoom: roomId
      };

      io.to(roomId).emit('new message', messageWithRoom);

      // Emit updated unread counts
      chatroom.participants.forEach(participantId => {
        const participantIdStr = participantId.toString();
        io.to(participantIdStr).emit('unread count update', {
          roomId,
          count: chatroom.unreadCounts[participantIdStr] || 0
        });
      });
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  socket.on('leave room', (roomId) => {
    socket.leave(roomId);
    console.log(`User left room: ${roomId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Store verification codes temporarily (in production, use Redis or database)
const verificationCodes = new Map();

// Multer configuration for handling file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

app.get("/api/users/me", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Example backend route (Node.js/Express)
app.get("/api/users/verify", authenticate, async (req, res) => {
  try {
    res.status(200).json({ valid: true });
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
});



app.post("/api/users/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    //const isMatch = await bcrypt.compare(password, user.password);
    const isMatch = password === user.password;
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT Token with 'id'
    const token = jwt.sign(
      { id: user._id, email: user.email },
      SECRET_KEY,
      { expiresIn: "1000h" }
    );

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

app.put('/api/users/initial-profile-creation', async (req, res) => {
  try {
    const { email, github, selectedCourses, projects, profilePicture } = req.body;

    const updateData = {
      github,
      selectedCourses,
      projects
    };

    // Only include profilePicture in update if it was provided
    if (profilePicture) {
      updateData.profilePicture = profilePicture;
    }

    const updatedUser = await User.findOneAndUpdate(
      { email },
      updateData,
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate a session token (only for initial setup)
    const token = jwt.sign(
      { id: updatedUser._id, email: updatedUser.email },
      SECRET_KEY,
      { expiresIn: '1h' }
    );

    res.json({ user: updatedUser, token });
    console.log('token: ' + token);
  } catch (error) {
    console.error('Error during initial profile creation:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/users/fetch-recommended-matches', authenticate, async (req, res) => {
  try {
    // Get the user ID from the authenticated token
    const userId = req.user.id;

    // Fetch user's matches
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Fetch recommended users based on selected courses
    const recommendedUsers = await User.find({
      _id: { $ne: userId }
    });

    res.json(recommendedUsers);
  } catch (error) {
    console.error('Error fetching recommended matches:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Example backend route (Node.js/Express)
app.post("/api/users/signup", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    console.log(email);

    // Input validation
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash the password
    const saltRounds = 10; // Adjust the number of salt rounds as needed
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create a new user with the hashed password
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: password,
      isVerified: false, // Add verification status
    });

    // Generate and store verification code
    const verificationCode = generateVerificationCode();

    // Email template
    const emailHtml = `
        <div style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">
          <h1 style="color: #007BFF;">Welcome to StudyBuddy, ${firstName}!</h1>
          <p>Thank you for signing up. To complete your registration, please use the following verification code:</p>
          <h2 style="color: #007BFF;">${verificationCode}</h2>
          <p>If you did not sign up for StudyBuddy, you can safely ignore this email.</p>
          <p>Best regards,</p>
          <p>The StudyBuddy Team</p>
        </div>
      `;

    // Send email using Resend
    await resend.emails.send({
      from: "onboarding@resend.dev", // Replace with your sender email
      to: 'studdybuddy875@gmail.com', // Send to the user's email
      subject: "Your StudyBuddy Verification Code",
      html: emailHtml,
    });

    // Save user after sending email
    newUser.verificationCode = verificationCode; // Attach the verification code to the user object

    await newUser.save();

    res.status(201).json({
      message: "User created successfully. Verification email sent.",
      verificationCode,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({
      error: "Server error",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

app.get("/api/users/get-notifications", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password")
      .populate({
        path: "notifications",
        populate: { path: "user", select: "firstName lastName email profilePicture" },
        options: { limit: 10, sort: { date: -1 } }, // Limit to 10, sorted by date descending
      });

    // Check if there are any unseen notifications
    const hasUnseenNotifications = user.notifications.some(notification => !notification.seen);

    // Log notifications for debugging
    console.log("NOTIFICATIONS:", user.notifications);

    // Send response with notifications and unseen status
    res.json({ notifications: user.notifications, hasUnseen: hasUnseenNotifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});


app.post("/api/users/notify-match-of-request", authenticate, async (req, res) => {
  try {
    console.log("Starting notification creation...");

    const user = await User.findById(req.user._id).select("-password");
    console.log("User creating the notification:", user);

    const { matchId } = req.body;
    console.log("Target matchId:", matchId);

    const newNotification = new Notification({
      content: `${user.firstName} ${user.lastName} has sent you a buddy request`,
      user: user._id,
      type: "buddy_request",
    });

    const savedNotification = await newNotification.save();
    console.log("Notification saved:", savedNotification);

    const match = await User.findById(matchId);
    if (!match) {
      console.error("Match user not found for ID:", matchId);
      return res.status(404).json({ error: "Match user not found" });
    }

    console.log("Match user found:", match);
    match.notifications.push(savedNotification._id);
    await match.save();
    console.log("Match user updated with notification");

    res.json({ message: "Notification sent successfully" });
  } catch (error) {
    console.error("Error sending notifications:", error);
    res.status(500).json({ error: "Failed to send notifications" });
  }
});





app.get("/api/users/seen-notifications", authenticate, async (req, res) => {
  try {
    // Find the user by ID and populate notifications
    const user = await User.findById(req.user._id).populate("notifications");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update all notifications to be seen
    const notificationIds = user.notifications.map((notification) => notification._id);
    await Notification.updateMany(
      { _id: { $in: notificationIds } }, // Match all notifications for this user
      { $set: { seen: true } } // Set seen to true
    );

    res.json({ message: "Notifications marked as seen" });
  } catch (error) {
    console.error("Error marking notifications as seen:", error);
    res.status(500).json({ error: "Failed to mark notifications as seen" });
  }
});


// app.get("/api/users/me", authenticate, async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id).select('-password');
//     if (!user) {
//       return res.status(404).json({ error: 'User not found' });
//     }
//     res.json(user);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to fetch user' });
//   }
// });

app.post('/api/users/send-buddy-request', authenticate, async (req, res) => {
  const { matchId } = req.body;
  const userId = req.user._id;

  try {
    console.log('[BuddyRequest] Processing request:', { userId: userId.toString(), matchId });

    // Validate matchId is provided
    if (!matchId) {
      console.log('[BuddyRequest] No matchId provided');
      return res.status(400).json({
        error: 'matchId is required'
      });
    }

    // Find both users
    const [user, match] = await Promise.all([
      User.findById(userId),
      User.findById(matchId)
    ]);

    // Validate both users exist
    if (!user || !match) {
      console.log('[BuddyRequest] User or match not found:', { userFound: !!user, matchFound: !!match });
      return res.status(404).json({
        error: 'One or both users not found'
      });
    }

    // Check if buddy request already exists
    if (user.outgoingBuddyRequests.includes(matchId) || match.incomingBuddyRequests.includes(userId)) {
      console.log('[BuddyRequest] Request already exists');
      return res.status(400).json({
        error: 'Buddy request already exists'
      });
    }

    // Check if they are already buddies
    if (user.buddies.includes(matchId)) {
      console.log('[BuddyRequest] Users are already buddies');
      return res.status(400).json({
        error: 'Users are already buddies'
      });
    }

    // Add buddy request
    user.outgoingBuddyRequests.push(matchId);
    match.incomingBuddyRequests.push(userId);

    // Save both users
    await Promise.all([user.save(), match.save()]);

    console.log('[BuddyRequest] Request sent successfully');
    res.status(200).json({
      message: 'Buddy request sent successfully!',
      data: {
        fromUser: userId,
        toUser: matchId,
        status: 'pending'
      }
    });
  } catch (error) {
    console.error('[BuddyRequest] Error:', error);
    res.status(500).json({
      error: 'Failed to process buddy request',
      details: error.message
    });
  }
});

app.post("/api/users/verify", async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update `isVerified` field
    user.isVerified = true;
    await user.save();

    res.status(200).json({ message: "User verified successfully" });
  } catch (error) {
    console.error("Error verifying user:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.get('/api/users/buddies', authenticate, async (req, res) => {
  try {
    // Get the user ID from the authenticated token
    const userId = req.user.id;

    // Find the user and populate their buddies
    const user = await User.findById(userId).populate('buddies', 'firstName lastName _id');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Send back the list of buddies
    res.json(user.buddies);
  } catch (error) {
    console.error('Error fetching buddies:', error.message);
    res.status(500).json({ error: 'Failed to fetch buddies' });
  }
});

// Create chatroom endpoint
app.post('/api/chatrooms', authenticate, async (req, res) => {
  try {
    const { participantId } = req.body;

    // Check if a non-group chatroom already exists between these users
    const existingChatroom = await ChatRoom.findOne({
      participants: {
        $all: [req.user._id, participantId],
        $size: 2
      },
      isGroupChat: false
    });

    if (existingChatroom) {
      return res.json(existingChatroom);
    }

    // Create new chatroom
    const chatroom = new ChatRoom({
      participants: [req.user._id, participantId],
      messages: [],
      isGroupChat: false
    });
    await chatroom.save();

    // Add chatroom to both users' chatrooms array
    await User.updateOne(
      { _id: req.user._id },
      {
        $addToSet: {
          chatrooms: chatroom._id
        }
      });

    await User.updateOne(
      { _id: participantId },
      {
        $addToSet: {
          chatrooms: chatroom._id
        }
      });

    res.status(201).json(chatroom);
  } catch (error) {
    console.error('Error creating chatroom:', error);
    res.status(500).json({ error: 'Failed to create chatroom' });
  }
});

// Send a message in a chatroom
app.post('/api/chatrooms/:chatroomId/messages', authenticate, async (req, res) => {
  try {
    const { content } = req.body;
    const chatroom = await ChatRoom.findById(req.params.chatroomId)
      .populate('participants', 'firstName lastName profilePicture');

    if (!chatroom) {
      return res.status(404).json({ error: 'Chatroom not found' });
    }

    // Check if user is participant
    if (!chatroom.participants.some(p => p._id.equals(req.user._id))) {
      return res.status(403).json({ error: 'Not authorized to send messages in this chat' });
    }

    // Create new message
    const message = new Message({
      sender: req.user._id,
      content,
      timestamp: new Date()
    });
    await message.save();

    // Add message to chatroom
    chatroom.messages.push(message._id);
    chatroom.lastUpdated = new Date();

    // Update unread counts for all participants except sender
    chatroom.participants.forEach(participant => {
      if (!participant._id.equals(req.user._id)) {
        if (!chatroom.unreadCounts) chatroom.unreadCounts = {};
        chatroom.unreadCounts[participant._id] = (chatroom.unreadCounts[participant._id] || 0) + 1;
      }
    });

    await chatroom.save();

    // Populate sender info before sending response
    await message.populate('sender', 'firstName lastName profilePicture');

    res.json({
      message,
      isGroupChat: chatroom.isGroupChat,
      participants: chatroom.participants
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Get user's chatrooms
app.get('/api/chatrooms', authenticate, async (req, res) => {
  try {
    // Fetch chatrooms with participants and messages
    const chatrooms = await ChatRoom.find({
      participants: req.user._id
    })
      .populate('participants', 'firstName lastName profilePicture email')
      .populate({
        path: 'messages',
        options: { sort: { 'timestamp': -1 }, limit: 1 },
        populate: {
          path: 'sender',
          select: 'firstName lastName profilePicture'
        }
      })
      .lean();

    // For group chats, we need to fetch the associated groups to get their names
    const groupChatrooms = chatrooms.filter(chat => chat.isGroupChat);
    const groups = await Group.find({
      chatRoom: { $in: groupChatrooms.map(chat => chat._id) }
    }).lean();

    // Create a map of chatroom ID to group name
    const chatroomToGroupName = {};
    groups.forEach(group => {
      if (group.chatRoom) {
        chatroomToGroupName[group.chatRoom.toString()] = group.name;
      }
    });

    // Process each chatroom to add display information
    const chatroomsWithInfo = chatrooms.map(chatroom => {
      const unreadCount = chatroom.unreadCounts?.[req.user._id.toString()] || 0;
      let displayTitle, displayPhoto;

      if (chatroom.isGroupChat) {
        // Use the group name from our map
        displayTitle = chatroomToGroupName[chatroom._id.toString()] || 'Unnamed Group';
        displayPhoto = chatroom.groupPhoto || '/images/default-group.jpeg';
      } else {
        // For direct messages, show the other participant's name
        const otherParticipant = chatroom.participants.find(
          p => p._id.toString() !== req.user._id.toString()
        );
        displayTitle = otherParticipant ?
          `${otherParticipant.firstName} ${otherParticipant.lastName}` :
          'Unknown User';
        displayPhoto = otherParticipant?.profilePicture || '/images/default-profile.jpeg';
      }

      return {
        ...chatroom,
        unreadCount,
        displayTitle,
        displayPhoto,
        lastMessage: chatroom.messages?.[0] || null
      };
    });

    res.json(chatroomsWithInfo);
  } catch (error) {
    console.error('Error fetching chatrooms:', error);
    res.status(500).json({ error: 'Failed to fetch chatrooms' });
  }
});

// Create group chatroom as part of group creation
app.post('/api/users/create-group', authenticate, upload.single('photo'), async (req, res) => {
  try {
    const { name, description, course, members } = req.body;
    const memberIds = JSON.parse(members || '[]');
    const allParticipants = [req.user._id, ...memberIds];

    // Handle file upload if present
    let profilePicture = '/images/default-group.jpeg';
    if (req.file) {
      try {
        const groupsDir = path.join(__dirname, 'public/images/groups');
        await fs.mkdir(groupsDir, { recursive: true });
        const tempPath = req.file.path;
        const targetPath = path.join(groupsDir, req.file.filename);
        await fs.rename(tempPath, targetPath);
        profilePicture = `/images/groups/${req.file.filename}`;
      } catch (fileError) {
        console.error('Error handling file:', fileError);
      }
    }

    // Create a new chatroom for the group
    const chatRoom = new ChatRoom({
      participants: allParticipants,
      isGroupChat: true,
      chatTitle: name, // Set the group name as chat title
      groupPhoto: profilePicture
    });
    await chatRoom.save();

    // Create the group
    const group = new Group({
      name,
      description,
      course,
      owner: req.user._id,
      members: allParticipants,
      profilePicture,
      chatRoom: chatRoom._id
    });
    await group.save();

    // Update all participants' groups and chatrooms arrays
    await User.updateMany(
      { _id: { $in: allParticipants } },
      {
        $addToSet: {
          groups: group._id,
          chatrooms: chatRoom._id
        }
      }
    );

    res.status(201).json({
      message: 'Group created successfully',
      groupId: group._id,
      chatRoomId: chatRoom._id
    });
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Get group details
app.get('/api/groups/:groupId', authenticate, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId)
      .populate('owner', 'firstName lastName profilePicture')
      .populate('members', 'firstName lastName profilePicture')
      .populate('pendingRequests.user', 'firstName lastName profilePicture');

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    res.json(group);
  } catch (error) {
    console.error('Error fetching group:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Request to join group
app.post('/api/groups/:groupId/join', authenticate, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check if user is already a member or has a pending request
    if (group.members.includes(req.user._id)) {
      return res.status(400).json({ error: 'Already a member' });
    }

    const existingRequest = group.pendingRequests.find(
      request => request.user.toString() === req.user._id.toString()
    );
    if (existingRequest) {
      return res.status(400).json({ error: 'Request already pending' });
    }

    // Add join request
    group.pendingRequests.push({
      user: req.user._id,
      status: 'pending'
    });
    await group.save();

    res.status(200).json({ message: 'Join request sent' });
  } catch (error) {
    console.error('Error sending join request:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post("/api/users/upload-profile-picture", upload.single('profilePicture'), async (req, res) => {
  console.log('[Server] Profile picture upload request received');
  try {
    if (!req.file) {
      console.log('[Server] No file in request');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('[Server] File received:', {
      originalname: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

    let user;
    // Check if this is an authenticated request
    if (req.headers.authorization) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, SECRET_KEY);
        user = await User.findById(decoded.id);
        console.log('[Server] Authenticated user found:', user._id);
      } catch (error) {
        console.log('[Server] Token verification failed:', error.message);
      }
    }

    // If not authenticated or token invalid, try to find user by email
    if (!user && req.body.email) {
      user = await User.findOne({ email: req.body.email });
      console.log('[Server] User found by email:', user ? user._id : 'Not found');
    }

    if (!user) {
      console.log('[Server] No user found');
      return res.status(404).json({ error: 'User not found' });
    }

    // Upload new picture to Filen cloud
    console.log('[Server] Uploading to Filen cloud...');
    const filePath = await uploadProfilePicture(req.file.buffer, user._id.toString());
    console.log('[Server] Upload successful, path:', filePath);

    // Add server URL prefix if path is relative
    const fullPath = filePath.startsWith('http') ? filePath : `http://localhost:5001${filePath}`;
    console.log('[Server] Full path:', fullPath);

    // Update user's profile picture path in database
    console.log('[Server] Updating user document...');
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { profilePicture: fullPath },
      { new: true }
    );

    if (!updatedUser) {
      console.log('[Server] Failed to update user document');
      throw new Error('Failed to update user document');
    }

    console.log('[Server] User document updated successfully');
    res.json({ profilePicturePath: fullPath });
  } catch (error) {
    console.error('[Server] Error in profile picture upload:', error);
    res.status(500).json({
      error: 'Failed to upload profile picture',
      details: error.message
    });
  }
});

// Endpoint to serve profile pictures
app.get('/api/profile-picture/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user || !user.profilePicture) {
      return res.status(404).send('Profile picture not found');
    }

    // Set cache control headers to prevent caching
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    const imageBuffer = await getProfilePicture(user.profilePicture);
    res.type('image/jpeg').send(imageBuffer);
  } catch (error) {
    console.error('Error getting profile picture:', error);
    res.status(500).send('Failed to get profile picture');
  }
});

// Get messages for a specific chatroom
app.get('/api/chatrooms/:chatroomId/messages', authenticate, async (req, res) => {
  try {
    const chatroom = await ChatRoom.findById(req.params.chatroomId)
      .populate({
        path: 'messages',
        populate: {
          path: 'sender',
          select: 'name profilePicture'
        }
      });

    if (!chatroom) {
      return res.status(404).json({ error: 'Chatroom not found' });
    }

    // Check if user is participant
    if (!chatroom.participants.includes(req.user._id)) {
      return res.status(403).json({ error: 'Not authorized to view these messages' });
    }

    res.json(chatroom.messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Update user profile
app.put('/api/users/update-profile', authenticate, async (req, res) => {
  console.log('[Server] Update profile request received');
  try {
    console.log('[Server] Request body:', req.body);
    console.log('[Server] User from token:', req.user);

    // Find and update user
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: req.body },
      { new: true }
    );

    if (!updatedUser) {
      console.log('[Server] User not found for update');
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('[Server] User updated successfully:', updatedUser);
    res.json(updatedUser);
  } catch (error) {
    console.error('[Server] Error updating user profile:', error);
    res.status(500).json({ error: 'Failed to update profile', details: error.message });
  }
});

// Serve profile pictures
app.get('/profile-pictures/:filename', async (req, res) => {
  try {
    const filePath = `/profile-pictures/${req.params.filename}`;
    console.log('[Server] Fetching profile picture:', filePath);

    const imageBuffer = await getProfilePicture(filePath);

    // Set appropriate headers
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=31557600'); // Cache for 1 year

    res.send(imageBuffer);
  } catch (error) {
    console.error('[Server] Error serving profile picture:', error);
    res.status(404).send('Profile picture not found');
  }
});

// Serve static files from the public directory
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// Get specific user's profile
app.get('/api/users/:userId', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('-password -verificationCode -email'); // Exclude sensitive information

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Accept buddy request endpoint
app.post('/api/users/accept-buddy-request', authenticate, async (req, res) => {
  try {
    const { fromUser } = req.body;
    const toUser = req.user._id;

    // Find both users
    const [requestingUser, acceptingUser] = await Promise.all([
      User.findById(fromUser),
      User.findById(toUser)
    ]);

    if (!requestingUser || !acceptingUser) {
      return res.status(404).json({ error: 'One or both users not found' });
    }

    // Verify request exists
    if (!acceptingUser.incomingBuddyRequests.includes(fromUser)) {
      return res.status(400).json({ error: 'No buddy request found' });
    }

    // Update both users' buddy lists and remove requests
    await Promise.all([
      User.findByIdAndUpdate(fromUser, {
        $pull: { outgoingBuddyRequests: toUser },
        $addToSet: { buddies: toUser }
      }),
      User.findByIdAndUpdate(toUser, {
        $pull: { incomingBuddyRequests: fromUser },
        $addToSet: { buddies: fromUser }
      })
    ]);

    res.json({ message: 'Buddy request accepted' });
  } catch (error) {
    console.error('Error accepting buddy request:', error);
    res.status(500).json({ error: 'Failed to accept buddy request' });
  }
});

// Get user profile endpoint
app.get('/api/users/profile/:matchId', authenticate, async (req, res) => {
  const { matchId } = req.params;
  const requestingUserId = req.user._id;
  console.log('[UserProfile] Received request:', {
    matchId,
    requestingUserId: requestingUserId.toString(),
    path: req.path,
    method: req.method
  });

  try {
    console.log('[UserProfile] Fetching user from database...');
    const user = await User.findById(matchId)
      .select('-password -verificationCode -email')
      .lean();

    if (!user) {
      console.log('[UserProfile] User not found:', matchId);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('[UserProfile] Successfully found user:', {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      hasProfilePic: !!user.profilePicture,
      hasCourses: user.selectedCourses?.length > 0,
      hasProjects: user.projects?.length > 0
    });

    // Check if the requesting user is buddies with this user
    const requestingUser = await User.findById(requestingUserId);
    const buddyStatus = {
      isBuddy: requestingUser.buddies?.includes(matchId),
      hasOutgoingRequest: requestingUser.outgoingBuddyRequests?.includes(matchId),
      hasIncomingRequest: requestingUser.incomingBuddyRequests?.includes(matchId)
    };
    console.log('[UserProfile] Buddy status:', buddyStatus);

    res.json(user);
  } catch (error) {
    console.error('[UserProfile] Error:', {
      message: error.message,
      stack: error.stack,
      matchId,
      requestingUserId: requestingUserId.toString()
    });
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});