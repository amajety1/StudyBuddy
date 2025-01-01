import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import User from './models/User.js';
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
    });

    socket.on('leave room', (roomId) => {
        socket.leave(roomId);
        console.log(`User left room: ${roomId}`);
    });

    socket.on('send message', async (data) => {
        try {
            const { roomId, content, sender } = data;
            
            // Create and save the new message
            const message = new Message({
                chatRoom: roomId,
                content,
                sender,
                timestamp: new Date()
            });
            await message.save();
            
            // Add message to the chatroom's messages array
            await ChatRoom.findByIdAndUpdate(
                roomId,
                { 
                    $push: { messages: message._id },
                    $set: { lastUpdated: new Date() }
                }
            );

            // Populate sender info before sending
            const populatedMessage = await Message.findById(message._id)
                .populate('sender', 'firstName lastName profilePicture');
            
            // Emit to all users in the room
            io.to(roomId).emit('new message', populatedMessage);
        } catch (error) {
            console.error('Error sending message:', error);
            socket.emit('error', { message: 'Failed to send message' });
        }
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
        console.log('Fetching current user:', req.user._id);
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            console.log('User not found');
            return res.status(404).json({ error: 'User not found' });
        }
        console.log('User found:', user);
        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
  });

app.post("/api/users/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
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
      console.log('token: '+ token);
    } catch (error) {
      console.error('Error during initial profile creation:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  
  app.put('/api/users/update-profile', async (req, res) => {
    try {
      const { email, github, selectedCourses, projects, profilePicture } = req.body;
  
      const updatedUser = await User.findOneAndUpdate(
        { email },
        { 
          github, 
          selectedCourses, 
          projects,
          profilePicture // Store the Filen cloud path
        },
        { new: true }
      );
  
      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      res.json({ user: updatedUser });
    } catch (error) {
      console.error('Error updating profile:', error);
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
        password: hashedPassword,
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



  


app.post('/api/users/upload-profile-picture', upload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const userId = req.body.userId;
    const fileBuffer = req.file.buffer;

    // Upload new picture to Filen cloud
    const filePath = await uploadProfilePicture(fileBuffer, userId);

    // Update user's profile picture path in database
    await User.findByIdAndUpdate(userId, { profilePicture: filePath });

    // If successful, return the new path
    res.json({ profilePicturePath: filePath });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    res.status(500).json({ error: 'Failed to upload profile picture' });
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

// Get user's chatrooms
app.get('/api/chatrooms', authenticate, async (req, res) => {
    try {
        console.log('Fetching chatrooms for user:', req.user._id);
        const chatrooms = await ChatRoom.find({
            participants: req.user._id
        })
        .populate('participants', 'firstName lastName profilePicture email')
        .populate({
            path: 'messages',
            options: { sort: { 'timestamp': -1 } },
            populate: {
                path: 'sender',
                select: 'firstName lastName profilePicture'
            }
        })
        .lean()
        .exec();

        // Add lastMessage field for each chatroom
        const chatroomsWithLastMessage = chatrooms.map(chatroom => ({
            ...chatroom,
            lastMessage: chatroom.messages && chatroom.messages.length > 0 
                ? chatroom.messages[0] // First message is the latest due to sort
                : null
        }));
        
        console.log('Found chatrooms:', chatroomsWithLastMessage);
        res.json(chatroomsWithLastMessage);
    } catch (error) {
        console.error('Error fetching chatrooms:', error);
        res.status(500).json({ error: 'Failed to fetch chatrooms' });
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

// Send a message in a chatroom
app.post('/api/chatrooms/:chatroomId/messages', authenticate, async (req, res) => {
    try {
        const { content } = req.body;
        const chatroom = await ChatRoom.findById(req.params.chatroomId);

        if (!chatroom) {
            return res.status(404).json({ error: 'Chatroom not found' });
        }

        // Check if user is participant
        if (!chatroom.participants.includes(req.user._id)) {
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
        await chatroom.save();

        // Populate sender info before sending response
        await message.populate('sender', 'name profilePicture');
        
        res.json(message);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });