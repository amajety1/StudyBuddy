import dotenv from 'dotenv';
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
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Resend } from 'resend';
import Group from './models/Group.js';
import Course from './models/Course.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const SECRET_KEY = process.env.JWT_SECRET;

const app = express();
const PORT = 5001;



// Create HTTP server
const server = createServer(app);

// Create socket server


// Middleware
app.use(express.json());
app.use(cors());

// Setup Nodemailer with Gmail and App Password
const resend = new Resend(dotenv.RESEND_API_KEY);

// Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    //console.log('Authenticating request...');
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
    //console.log('Decoded token:', decoded);

    // Use id instead of userId since that's what we stored in the token
    const user = await User.findById(decoded.id);
    if (!user) {
      console.log('User not found:', decoded.id);
      return res.status(404).json({ error: 'User not found' });
    }

    // console.log('Authentication successful for user:', user._id);
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

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Allow your Vite frontend
    methods: ["GET", "POST"],       // Allowed HTTP methods
    credentials: true,              // Allow credentials (optional)
  },
});

io.on("connection", (socket) => {
  //  console.log("A user connected");

  // Join a chatroom
  socket.on("join_chat", (chatId) => {
    socket.join(chatId);
    // console.log(`User joined chat: ${chatId}`);
  });

  // Emit new message event
  socket.on("new_message", async (message) => {
    try {
      const { chatroomId, content, sender } = message;

      // Create and save the message
      const newMessage = new Message({
        content,
        sender,
        chatRoom: chatroomId,
        timestamp: new Date()
      });
      await newMessage.save();

      // Update chatroom
      const chatroom = await ChatRoom.findById(chatroomId);
      if (!chatroom) {
        throw new Error('Chatroom not found');
      }
      chatroom.messages.push(newMessage._id);
      await chatroom.save();

      // Get sender information
      const senderInfo = await User.findById(sender).select('firstName lastName profilePicture');

      // Prepare message with sender info
      const messageWithInfo = {
        _id: newMessage._id,
        chatroomId,
        content,
        sender: senderInfo,
        timestamp: newMessage.timestamp
      };

      // Emit message to the chatroom
      io.to(chatroomId).emit("message_received", messageWithInfo);

      // Emit last message update to all participants
      const updatedChatroom = await ChatRoom.findById(chatroomId)
        .populate('participants')
        .populate({
          path: 'messages',
          populate: {
            path: 'sender',
            select: 'firstName lastName profilePicture'
          }
        });

      // Emit to all participants to update their chat list
      updatedChatroom.participants.forEach(participant => {
        socket.to(participant._id.toString()).emit("update_last_message", {
          chatroomId,
          lastMessage: messageWithInfo
        });
      });

    } catch (error) {
      console.error('Error handling new message:', error);
      socket.emit('message_error', { error: 'Failed to process message' });
    }
  });

  socket.on("disconnect", () => {
    // console.log("A user disconnected");
  });
});



const verificationCodes = new Map();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});
app.get("/api/users/me", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('buddies', 'firstName lastName email profilePicture bio major degreeType') // Populate buddies
      .populate('incomingBuddyRequests', 'firstName lastName email profilePicture bio major degreeType') // Populate outgoing buddy requests
      .populate('outgoingBuddyRequests', 'firstName lastName email profilePicture bio major degreeType') // Populate incoming buddy requests
      .populate('groups.group'); // Populate group references

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});
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

    // Fetch full course information for each selected course
    const fullCourseInfo = await Promise.all(
      selectedCourses.map(async (courseId) => {
        const course = await Course.findById(courseId);
        return {
          _id: course._id,
          prefix: course.prefix,
          number: course.number,
          name: course.name
        };
      })
    );

    const user = await User.findOneAndUpdate(
      { email },
      {
        github,
        selectedCourses: fullCourseInfo,
        projects,
        ...(profilePicture && { profilePicture })
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate a session token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      SECRET_KEY,
      { expiresIn: '1h' }
    );

    res.json({ user, token });
  } catch (error) {
    console.error('Error during initial profile creation:', error);
    res.status(500).json({ error: 'Server error' });
  }
});
app.get('/api/users/fetch-recommended-matches', authenticate, async (req, res) => {
  try {
    // Get the user ID from the authenticated token
    const userId = req.user.id;

    // Fetch the current user's data
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Combine IDs to exclude (user's ID, buddies, outgoing and incoming requests)
    const excludedIds = [
      userId,
      ...user.buddies,
      ...user.outgoingBuddyRequests,
      ...user.incomingBuddyRequests,
    ];

    // Fetch recommended users excluding the specified IDs
    const recommendedUsers = await User.find({
      _id: { $nin: excludedIds },
    });

    res.json(recommendedUsers);
  } catch (error) {
    console.error('Error fetching recommended matches:', error);
    res.status(500).json({ error: 'Server error' });
  }
});
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
      .populate({
        path: 'notifications',
        populate: {
          path: 'from_user',
          select: 'firstName lastName profilePicture'
        }
      });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Sort notifications by date in descending order (newest first)
    const sortedNotifications = user.notifications.sort((a, b) => b.date - a.date);

    res.json(sortedNotifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});
// app.post("/api/users/notify-match-of-request", authenticate, async (req, res) => {
//   try {
//     console.log("Starting notification creation...");

//     const user = await User.findById(req.user._id).select("-password");
//     console.log("User creating the notification:", user);

//     const { matchId } = req.body;
//     console.log("Target matchId:", matchId);

//     const newNotification = new Notification({
//       content: `${user.firstName} ${user.lastName} has sent you a buddy request`,
//       from_user: user._id,
//       type: "buddy_request",
//       to_user: matchId,
//     });

//     const savedNotification = await newNotification.save();
//     console.log("Notification saved:", savedNotification);

//     const match = await User.findById(matchId);
//     if (!match) {
//       console.error("Match user not found for ID:", matchId);
//       return res.status(404).json({ error: "Match user not found" });
//     }

//     console.log("Match user found:", match);
//     match.notifications.push(savedNotification._id);
//     await match.save();
//     console.log("Match user updated with notification");

//     res.json({ message: "Notification sent successfully" });
//   } catch (error) {
//     console.error("Error sending notifications:", error);
//     res.status(500).json({ error: "Failed to send notifications" });
//   }
// });
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


    const newNotification = new Notification({
      content: `${user.firstName} ${user.lastName} has sent you a buddy request`,
      from_user: user._id,
      type: "buddy_request",
      to_user: matchId,
    });

    const savedNotification = await newNotification.save();
    console.log("Notification saved:", savedNotification);

    match.notifications.push(savedNotification._id);
    await match.save();

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
// Fetch all chat of a user
app.get('/api/users/get-chats', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch chatrooms where the user is a participant
    const chatrooms = await ChatRoom.find({
      participants: userId
    })
      .populate('participants', 'firstName lastName profilePicture') // Populate participants' basic info
      .populate({
        path: 'messages',
        options: { sort: { timestamp: -1 } }, // Sort messages by timestamp in descending order
        populate: {
          path: 'sender',
          select: 'firstName lastName profilePicture'
        }
      });

    // For group chats, fetch the group and populate pending requests
    const enhancedChatrooms = await Promise.all(
      chatrooms.map(async (chatroom) => {
        if (chatroom.isGroupChat && chatroom.groupId) {
          const group = await Group.findById(chatroom.groupId)
            .populate({
              path: 'pendingRequests.user',
              select: 'firstName lastName profilePicture'
            });

          if (group) {
            return {
              ...chatroom.toObject(),
              group: {
                ...group.toObject(),
                pendingRequests: group.pendingRequests
              }
            };
          }
        }

        return chatroom.toObject(); // Return the chatroom as-is if not a group chat
      })
    );

    res.json(enhancedChatrooms);
  } catch (error) {
    console.error('Error fetching chatrooms:', error);
    res.status(500).json({ error: 'Failed to fetch chatrooms' });
  }
});



// Get messages for a chatroom
app.get('/api/chatrooms/:chatroomId/messages', authenticate, async (req, res) => {
  try {
    const { chatroomId } = req.params;

    const chatroom = await ChatRoom.findById(chatroomId)
      .populate({
        path: 'messages',
        populate: {
          path: 'sender',
          select: 'firstName lastName profilePicture'
        }
      });

    if (!chatroom) {
      return res.status(404).json({ error: 'Chatroom not found' });
    }

    res.json(chatroom.messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
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
        console.log('[Server] Uploading group photo to Filen cloud...');
        profilePicture = await uploadProfilePicture(req.file.buffer, `group_${Date.now()}`);
        console.log('[Server] Upload successful, path:', profilePicture);

        // Add server URL prefix if path is relative
        profilePicture = profilePicture.startsWith('http') ? profilePicture : `http://localhost:5001${profilePicture}`;
        console.log('[Server] Full path:', profilePicture);
      } catch (fileError) {
        console.error('Error uploading to Filen:', fileError);
      }
    }

    // Create the group
    const group = new Group({
      name,
      description,
      course,
      owner: req.user._id,
      members: allParticipants,
      profilePicture,

    });
    await group.save();

    // Create a new chatroom for the group
    const chatRoom = new ChatRoom({
      participants: allParticipants,
      isGroupChat: true,
      groupName: name,
      chatTitle: name,
      groupPhoto: profilePicture,
      messages: [],
      groupId: group._id
    });
    await chatRoom.save();

    group.chatRoomId = chatRoom._id;
    await group.save();



    // Update the owner's groups and chatrooms with isOwner set to true
    await User.updateOne(
      { _id: req.user._id },
      {
        $addToSet: {
          groups: { group: group._id, isOwner: true },
          chatrooms: chatRoom._id,
        },
      }
    );

    // Update the other participants' groups and chatrooms
    await User.updateMany(
      { _id: { $in: allParticipants.filter(id => id.toString() !== req.user._id.toString()) } },
      {
        $addToSet: {
          groups: { group: group._id, isOwner: false },
          chatrooms: chatRoom._id,
        },
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

app.post('/api/users/request-join-group', authenticate, async (req, res) => {
  try {
    const { groupId } = req.body;
    const userId = req.user._id; // Get user ID from auth token

    console.log('Processing join request:', { groupId, userId });

    // Fetch the group from the database
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Fetch the user to get their name
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user is already a member
    if (group.members.includes(userId)) {
      return res.status(400).json({ error: 'Already a member of this group' });
    }

    // Check if user already has a pending request
    if (group.pendingRequests && group.pendingRequests.some(req => req.user.toString() === userId.toString())) {
      return res.status(400).json({ error: 'Already requested to join this group' });
    }

    // Add the user to the group's pending requests
    group.pendingRequests.push({ user: userId });
    await group.save();

    // Create a notification for the group owner
    const notification = new Notification({
      from_user: userId,
      to_user: group.owner,
      type: 'group_join_request',
      content: `${user.firstName} ${user.lastName} has requested to join your group.`,
      groupId: groupId  // Make sure groupId is included in notification
    });

    console.log('Creating notification:', notification);

    await notification.save();

    await User.findByIdAndUpdate(
      group.owner,
      { $push: { notifications: notification._id } }
    );

    res.status(200).json({ message: 'Request sent successfully' });
  } catch (error) {
    console.error('Error requesting to join group:', error);
    res.status(500).json({ error: 'Failed to request to join group' });
  }
});

app.post('/api/users/leave-group', authenticate, async (req, res) => {
  try {
    const groupId = req.body.groupId;
    const userId = req.user._id;

    // Fetch the group from the database
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Remove the user from the group's members
    group.members = group.members.filter(member => member.toString() !== userId.toString());
    await group.save();

    const chatRoom = await ChatRoom.findById(group.chatRoomId);
    if (!chatRoom) {
      return res.status(404).json({ error: 'Chatroom not found' });
    }

    chatRoom.participants = chatRoom.participants.filter(member => member.toString() !== userId.toString());
    await chatRoom.save();

    // Remove the group from the user's groups
    await User.updateOne(
      { _id: userId },
      { $pull: { groups: { group: groupId } } }
    );

    await User.updateOne(
      { _id: userId },
      { $pull: { chatrooms: group.chatRoomId } }
    );

    res.status(200).json({ message: 'Left the group successfully' });
  } catch (error) {
    console.error('Error leaving group:', error);
    res.status(500).json({ error: 'Failed to leave group' });
  }
});

app.delete("/api/groups/:id", async (req, res) => {
  const groupId = req.params.id;

  try {
    // Find the group to delete
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Find the corresponding chatroom
    const chatRoom = await ChatRoom.findOne({ groupId });
    if (!chatRoom) {
      return res.status(404).json({ message: "Chatroom not found for the group" });
    }

    // Update all users to remove the group and chatroom references
    await User.updateMany(
      {
        $or: [
          { "groups.group": groupId },
          { chatrooms: chatRoom._id }
        ]
      },
      {
        $pull: {
          groups: { group: groupId }, // Remove group reference
          chatrooms: chatRoom._id    // Remove chatroom reference
        }
      }
    );

    // Delete the chatroom
    await ChatRoom.deleteOne({ _id: chatRoom._id });

    // Delete the group
    await Group.deleteOne({ _id: groupId });

    res.status(200).json({ message: "Group and associated chatroom successfully deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
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

app.post('/api/groups/approve-join-group', authenticate, async (req, res) => {
  try {
    const { groupId, userId } = req.body;
    console.log('Approving group join request:', { groupId, userId });

    // Fetch the group from the database
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Verify the current user is the group owner
    if (group.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only group owner can approve requests' });
    }

    // Fetch the user to get their name
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Add the user to the group's members
    if (!group.members.includes(userId)) {
      group.members.push(userId);
    }

    // Remove the user from the group's pending requests
    group.pendingRequests = group.pendingRequests.filter(request => 
      request.user.toString() !== userId.toString()
    );
    await group.save();

    // Add the group to the user's groups list
    const groupEntry = { group: groupId, isOwner: false };
    if (!user.groups) {
      user.groups = [groupEntry];
    } else if (!user.groups.some(g => g.group.toString() === groupId)) {
      user.groups.push(groupEntry);
    }

    // Remove from outgoing requests if they exist
    if (user.outgoingGroupRequests) {
      user.outgoingGroupRequests = user.outgoingGroupRequests.filter(
        id => id.toString() !== groupId
      );
    }

    // Add user to the group's chatroom
    if (group.chatRoomId) {
      if (!user.chatrooms) {
        user.chatrooms = [group.chatRoomId];
      } else if (!user.chatrooms.includes(group.chatRoomId)) {
        user.chatrooms.push(group.chatRoomId);
      }

      // Add user to chatroom participants
      const chatRoom = await ChatRoom.findById(group.chatRoomId);
      if (chatRoom && !chatRoom.participants.includes(userId)) {
        chatRoom.participants.push(userId);
        await chatRoom.save();
      }
    }

    await user.save();

    // Create a notification for the user that their request was approved
    const notification = new Notification({
      from_user: req.user._id,
      to_user: userId,
      type: 'group_request_approved',
      content: `${user.firstName} ${user.lastName} has been approved to join your group.`,
      groupId: groupId
    });

    await notification.save();
    await User.findByIdAndUpdate(
      userId,
      { $push: { notifications: notification._id } }
    );

    res.json({ message: 'User approved to join the group and added to the chatroom' });
  } catch (error) {
    console.error('Error approving join request:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

app.post('/api/groups/reject-join-group', authenticate, async (req, res) => {
  try {
    const { groupId, userId } = req.body;
    console.log('Rejecting group join request:', { groupId, userId });

    // Fetch the group from the database
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Verify the current user is the group owner
    if (group.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only group owner can reject requests' });
    }

    // Remove the user from the group's pending requests
    group.pendingRequests = group.pendingRequests.filter(request => 
      request.user.toString() !== userId.toString()
    );
    await group.save();

    // Remove from user's outgoing requests if they exist
    const user = await User.findById(userId);
    if (user && user.outgoingGroupRequests) {
      user.outgoingGroupRequests = user.outgoingGroupRequests.filter(
        id => id.toString() !== groupId
      );
      await user.save();
    }

    // Create a notification for the user that their request was rejected
    const notification = new Notification({
      from_user: req.user._id,
      to_user: userId,
      type: 'group_request_rejected',
      content: `Your request to join the group was rejected.`,
      groupId: groupId
    });

    await notification.save();
    await User.findByIdAndUpdate(
      userId,
      { $push: { notifications: notification._id } }
    );

    res.json({ message: 'Group join request rejected' });
  } catch (error) {
    console.error('Error rejecting join request:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

app.post('/api/groups/remove-member', authenticate, async (req, res) => {
  try {
    const groupId = req.body.groupId;
    const userId = req.body.userId;

    // Fetch the group from the database
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    // make sure user is owner of group
    if (group.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You are not the owner of this group' });
    }

    // Remove the user from the group's members
    group.members = group.members.filter(member => member.toString() !== userId.toString());
    await group.save();

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.groups = user.groups.filter(group => group.group.toString() !== groupId);
    await user.save();

    const chatRoom = await ChatRoom.findById(group.chatRoomId);
    if (!chatRoom) {
      return res.status(404).json({ error: 'Chatroom not found for this group' });
    }

    // Remove the user from the chatroom's participants
    chatRoom.participants = chatRoom.participants.filter(member => member.toString() !== userId.toString());
    await chatRoom.save();

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Error removing member:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get("/api/get-all-courses", async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

app.get("/api/get-all-groups", authenticate, async (req, res) => {
  try {
    const groups = await Group.find()
      .populate('members', '_id firstName lastName profilePicture')
      .populate('owner', '_id firstName lastName profilePicture')
      .populate('pendingRequests.user', '_id firstName lastName profilePicture');

    console.log('Fetched groups with populated members:', 
      groups.map(g => ({
        id: g._id,
        name: g.name,
        memberCount: g.members.length,
        memberExample: g.members[0]
      }))
    );

    res.json(groups);
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

app.get('/api/get-all-users', authenticate, async (req, res) => {
  try {
    const users = await User.find({});
    console.log(users);
    res.json(users);
  } catch (error) {
    console.error('Error getting all users:', error);
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
// Serve profile pictures
app.get('/profile-pictures/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    const cacheDir = path.join(__dirname, 'public', 'profile-pictures');
    const cachedFilePath = path.join(cacheDir, filename);

    // Create cache directory if it doesn't exist
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    // Check if file exists in cache
    if (fs.existsSync(cachedFilePath)) {
      console.log('[Server] Serving cached profile picture:', filename);
      res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=31557600'); // Cache for 1 year
      return fs.createReadStream(cachedFilePath).pipe(res);
    }

    // If not in cache, fetch from Filen
    console.log('[Server] Fetching profile picture from Filen:', filename);
    const filePath = `/profile-pictures/${filename}`;
    const imageBuffer = await getProfilePicture(filePath);

    // Save to cache
    fs.writeFileSync(cachedFilePath, imageBuffer);

    // Set headers and serve
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=31557600'); // Cache for 1 year
    res.send(imageBuffer);
  } catch (error) {
    console.error('[Server] Error serving profile picture:', error);
    // Serve default image based on the filename pattern
    const isGroupImage = req.params.filename.startsWith('group_');
    const defaultImagePath = path.join(__dirname, 'public', 'images', isGroupImage ? 'group.jpg' : 'empty-profile-pic.png');

    if (fs.existsSync(defaultImagePath)) {
      res.setHeader('Content-Type', isGroupImage ? 'image/jpeg' : 'image/png');
      return fs.createReadStream(defaultImagePath).pipe(res);
    }
    res.status(404).send('Profile picture not found');
  }
});

// Serve static files from the public directory
app.use('/images', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
}, express.static(path.join(__dirname, 'public/images')));

app.use('/profile-pictures', express.static(path.join(__dirname, 'public/profile-pictures')));

app.put('/api/users/update-profile', authenticate, async (req, res) => {
  console.log('[Server] Update profile request received');
  try {
    console.log('[Server] Request body:', req.body);
    console.log('[Server] User from token:', req.user);

    const { selectedCourses, previousCourses, ...otherUpdates } = req.body;

    // Fetch full course information for selected courses
    const fullSelectedCourses = await Promise.all(
      (selectedCourses || []).map(async (courseId) => {
        const course = await Course.findById(courseId);
        return {
          _id: course._id,
          prefix: course.prefix,
          number: course.number,
          name: course.name
        };
      })
    );

    // Fetch full course information for previous courses
    const fullPreviousCourses = await Promise.all(
      (previousCourses || []).map(async (courseId) => {
        const course = await Course.findById(courseId);
        return {
          _id: course._id,
          prefix: course.prefix,
          number: course.number,
          name: course.name
        };
      })
    );

    // Find and update user with full course information
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { 
        $set: {
          ...otherUpdates,
          selectedCourses: fullSelectedCourses,
          previousCourses: fullPreviousCourses
        }
      },
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



// Get specific user's data
app.get('/api/users/:userId', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('-password')
      .populate('buddies', 'firstName lastName email profilePicture bio major degreeType');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'Failed to fetch user data' });
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

    const chatroom = new ChatRoom({
      participants: [fromUser, toUser],
      isGroupChat: false
    });
    await chatroom.save();

    await Promise.all([
      User.findByIdAndUpdate(fromUser, { $addToSet: { chatrooms: chatroom._id } }),
      User.findByIdAndUpdate(toUser, { $addToSet: { chatrooms: chatroom._id } })
    ]);




    res.json({ message: 'Buddy request accepted' });
  } catch (error) {
    console.error('Error accepting buddy request:', error);
    res.status(500).json({ error: 'Failed to accept buddy request' });
  }
});
app.post('/api/users/reject-buddy-request', authenticate, async (req, res) => {
  try {
    const { fromUser } = req.body;
    const toUser = req.user._id;

    // Find both users
    const [requestingUser, rejectingUser] = await Promise.all([
      User.findById(fromUser),
      User.findById(toUser)
    ]);

    if (!requestingUser || !rejectingUser) {
      return res.status(404).json({ error: 'One or both users not found' });
    }

    // Verify request exists
    if (!rejectingUser.incomingBuddyRequests.includes(fromUser)) {
      return res.status(400).json({ error: 'No buddy request found' });
    }

    // Update both users' buddy lists and remove requests
    await Promise.all([
      User.findByIdAndUpdate(fromUser, {
        $pull: { outgoingBuddyRequests: toUser }
      }),
      User.findByIdAndUpdate(toUser, {
        $pull: { incomingBuddyRequests: fromUser }
      })
    ]);
    res.json({ message: 'Buddy request rejected' });
  } catch (error) {
    console.error('Error rejecting buddy request:', error);
    res.status(500).json({ error: 'Failed to reject buddy request' });
  }
  
})

// Cancel buddy request endpoint
app.post('/api/users/cancel-buddy-request', authenticate, async (req, res) => {
  try {
    const { toUser } = req.body;
    const fromUser = req.user._id;

    // Update both users' buddy lists and remove requests
    await Promise.all([
      User.findByIdAndUpdate(fromUser, {
        $pull: { outgoingBuddyRequests: toUser }
      }),
      User.findByIdAndUpdate(toUser, {
        $pull: { incomingBuddyRequests: fromUser }
      })
    ]);
    res.json({ message: 'Buddy request cancelled' });
  } catch (error) {
    console.error('Error cancelling buddy request:', error);
    res.status(500).json({ error: 'Failed to cancel buddy request' });
  }
  
})

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

// Delete notification endpoint
app.delete('/api/notifications/:notificationId', authenticate, async (req, res) => {
  try {
    const notificationId = req.params.notificationId;
    const userId = req.user._id;

    // Find the notification
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    // Verify the notification belongs to the user
    if (notification.to_user.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Remove notification reference from user
    await User.findByIdAndUpdate(userId, {
      $pull: { notifications: notificationId }
    });

    // Delete the notification
    await Notification.findByIdAndDelete(notificationId);

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});


server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});