const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const groupRoutes = require('./routes/groups');
const authRoutes = require('./routes/auth');
const forumRoutes = require('./routes/forum');

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000', // Allow requests from the React app in production or localhost
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true // Allows cookies and other credentials to be passed
}));
const corsOptions = {
  origin: ['https://groupstudymernui.onrender.com', 'https://groupstudymern.onrender.com', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
};
app.use(cors(corsOptions));

// Import and use routes
app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes); // Make sure this is used
app.use('/api/forum', forumRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});