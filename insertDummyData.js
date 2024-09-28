const mongoose = require('mongoose');
const Group = require('./server/models/Group'); // adjust the path as needed
require('dotenv').config(); // if you're using environment variables

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const groupsData = [
  {
    name: "Math Wizards",
    description: "Join us for advanced problem solving",
    icon: "https://example.com/math_icon.png",
    likes: 120,
    members: 50,
    rating: 4.8
  },
  // ... add the other groups here
];

const insertGroups = async () => {
  try {
    await Group.insertMany(groupsData);
    console.log('Dummy data inserted successfully');
  } catch (error) {
    console.error('Error inserting dummy data:', error);
  } finally {
    mongoose.disconnect();
  }
};

insertGroups();