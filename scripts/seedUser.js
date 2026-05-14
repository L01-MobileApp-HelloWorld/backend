require('dotenv').config();

const mongoose = require('mongoose');
const User = require('../src/models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ban_hay_luoi';
const ADMIN_USER_ID = '6a0534e546e1b8dc38a8eb3b';

const ADMIN_USER = {
  _id: new mongoose.Types.ObjectId(ADMIN_USER_ID),
  username: 'admin',
  email: 'admin@admin.com',
  password: '$2a$12$rshekTYU41NYx7qe3K65b.I4h1Ok0d4imNO.2DNtHMmRhp1G7nFFm',
  displayName: 'Admin',
  preferences: {
    darkMode: true,
    language: 'vi',
    notificationsEnabled: false,
    reminderTime: '22:00',
    reminderFrequency: 'daily'
  },
  stats: {
    totalQuizzes: 10,
    currentStreak: 10,
    longestStreak: 10,
    lastQuizDate: new Date('2026-05-14T05:37:00.000Z')
  },
  createdAt: new Date('2026-05-14T02:35:17.510Z'),
  updatedAt: new Date('2026-05-14T03:28:23.859Z'),
  __v: 0
};

async function run() {
  await mongoose.connect(MONGODB_URI);

  try {
    const existingById = await User.findById(ADMIN_USER._id).select('+password');
    const existingByEmail = await User.findOne({ email: ADMIN_USER.email }).select('+password');

    if (existingById) {
      await User.collection.updateOne(
        { _id: existingById._id },
        { $set: ADMIN_USER }
      );

      console.log(`Updated admin user by fixed id: ${existingById._id.toString()}`);
    } else if (existingByEmail) {
      await User.collection.deleteOne({ _id: existingByEmail._id });
      const result = await User.collection.insertOne(ADMIN_USER);
      console.log(
        `Replaced admin user ${existingByEmail._id.toString()} with fixed id ${result.insertedId.toString()}`
      );
    } else {
      const result = await User.collection.insertOne(ADMIN_USER);
      console.log(`Inserted admin user: ${result.insertedId.toString()}`);
    }
  } finally {
    await mongoose.disconnect();
  }
}

run().catch((error) => {
  console.error('User seeding failed:', error);
  process.exit(1);
});
