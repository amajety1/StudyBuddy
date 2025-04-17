import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Notification from './models/Notification.js';
import ChatRoom from './models/ChatRoom.js';
import Message from './models/Message.js';
import Group from './models/Group.js';
import Course from './models/Course.js';
import bcrypt from 'bcrypt';

dotenv.config();

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/StudyBuddy', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const createFakeUsers = async () => {
  const users = [
    {
      firstName: 'Alice',
      lastName: 'Smith',
      email: 'alice@example.com',
      password: await bcrypt.hash('password123', 10),
      isVerified: true,
      major: 'Computer Science',
      profilePicture: '/images/alice.jpg',
    },
    {
      firstName: 'Bob',
      lastName: 'Johnson',
      email: 'bob@example.com',
      password: await bcrypt.hash('securepass', 10),
      isVerified: true,
      major: 'Mathematics',
      profilePicture: '/images/bob.jpg',
    },
    {
      firstName: 'Charlie',
      lastName: 'Davis',
      email: 'charlie@example.com',
      password: await bcrypt.hash('testpass', 10),
      isVerified: true,
      major: 'Physics',
      profilePicture: '/images/charlie.jpg',
    },
  ];

  await User.insertMany(users);
  console.log('Fake users added');
};

const createFakeCourses = async () => {
  const courses = [
    { prefix: 'CS', number: 101, name: 'Introduction to Computer Science' },
    { prefix: 'MATH', number: 201, name: 'Linear Algebra' },
    { prefix: 'PHYS', number: 301, name: 'Quantum Mechanics' },
  ];

  await Course.insertMany(courses);
  console.log('Fake courses added');
};

const createFakeChatRooms = async () => {
  const users = await User.find();
  if (users.length < 2) {
    console.log('Not enough users to create chat rooms');
    return;
  }

  const chatRooms = [
    {
      participants: [users[0]._id, users[1]._id],
      isGroupChat: false,
      messages: [],
    },
  ];

  await ChatRoom.insertMany(chatRooms);
  console.log('Fake chat rooms added');
};

const createFakeMessages = async () => {
  const chatRoom = await ChatRoom.findOne();
  if (!chatRoom) {
    console.log('No chatrooms found');
    return;
  }

  const messages = [
    { content: 'Hey, how are you?', sender: chatRoom.participants[0], chatRoom: chatRoom._id, timestamp: new Date() },
    { content: 'I am good, thanks!', sender: chatRoom.participants[1], chatRoom: chatRoom._id, timestamp: new Date() },
  ];

  await Message.insertMany(messages);
  console.log('Fake messages added');
};

const createFakeGroups = async () => {
  const users = await User.find();
  if (users.length < 3) {
    console.log('Not enough users to create groups');
    return;
  }

  const group = new Group({
    name: 'Study Group A',
    description: 'A study group for CS students',
    owner: users[0]._id,
    members: [users[0]._id, users[1]._id, users[2]._id],
    profilePicture: '/images/group.jpg',
  });

  await group.save();
  console.log('Fake group added');
};

const createFakeNotifications = async () => {
  const users = await User.find();
  if (users.length < 2) {
    console.log('Not enough users for notifications');
    return;
  }

  const notification = new Notification({
    content: `${users[1].firstName} sent you a friend request.`,
    from_user: users[1]._id,
    to_user: users[0]._id,
    type: 'buddy_request',
  });

  await notification.save();
  console.log('Fake notifications added');
};

const seedDatabase = async () => {
  await mongoose.connection.dropDatabase();
  console.log('Database cleared');

  await createFakeUsers();
  await createFakeCourses();
  await createFakeChatRooms();
  await createFakeMessages();
  await createFakeGroups();
  await createFakeNotifications();

  console.log('Fake data inserted successfully!');
  mongoose.connection.close();
};

seedDatabase();
