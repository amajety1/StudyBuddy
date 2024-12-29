import express from 'express';
import mongoose from 'mongoose';
import User from './model/User.js';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 5001;

// Middleware
app.use(express.json());
app.use(cors());

// Setup Nodemailer with Gmail and App Password
const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use TLS
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD // Use App Password, not regular password
    }
});

// Verify email configuration
transporter.verify((error, success) => {
    if (error) {
        console.error('SMTP connection error:', error);
    } else {
        console.log('SMTP server is ready to send emails');
    }
});

// Generate Random 6-Digit Code
function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// MongoDB Connection with error handling
mongoose.connect('mongodb://127.0.0.1:27017/StudyBuddy')
    .then(() => console.log('MongoDB Connected Successfully'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// Store verification codes temporarily (in production, use Redis or database)
const verificationCodes = new Map();

// Signup Endpoint
app.post("/api/users/signup", async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;

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

        // Create a new user
        const newUser = new User({
            firstName,
            lastName,
            email,
            password,
            isVerified: false // Add verification status
        });

        await newUser.save();

        // Generate and store verification code
        const verificationCode = generateVerificationCode();
        verificationCodes.set(email, {
            code: verificationCode,
            timestamp: Date.now()
        });

        // Email template
        const mailOptions = {
            from: {
                name: 'StudyBuddy',
                address: process.env.GMAIL_USER
            },
            to: email,
            subject: 'Welcome to StudyBuddy - Verify Your Email',
            html: `
                <h2>Welcome to StudyBuddy!</h2>
                <p>Hello ${firstName},</p>
                <p>Thank you for signing up. Please use the following code to verify your email address:</p>
                <h3 style="font-size: 24px; color: #4A90E2;">${verificationCode}</h3>
                <p>This code will expire in 10 minutes.</p>
                <p>If you didn't create this account, please ignore this email.</p>
            `
        };

        await transporter.sendMail(mailOptions);

        res.status(201).json({
            message: "User created successfully. Please check your email for verification.",
            userId: newUser._id
        });

    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ 
            error: "Server error", 
            details: process.env.NODE_ENV === 'development' ? error.message : undefined 
        });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});