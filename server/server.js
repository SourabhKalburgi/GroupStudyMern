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
const corsOptions = {
  origin: ['https://groupstudymernui.onrender.com', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));



// Import and use routes
app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes); // Make sure this is used
app.use('/api/forum', forumRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});