// Install required packages
// npm install uuid

const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const authMiddleware = require('../middleware/authMiddleware');
const Group = require('../models/Group');

// Create a new video session
router.post('/groups/:groupId/video-session', authMiddleware, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if the user is a member of the group
    if (!group.members.includes(req.user.userId)) {
      return res.status(403).json({ message: 'You are not a member of this group' });
    }

    // Generate a unique room name
    const roomName = `${group.name.replace(/\s+/g, '-')}-${uuidv4()}`;

    // You might want to save this session information to your database
    // For now, we'll just return the room name
    res.json({ roomName });
  } catch (error) {
    res.status(500).json({ message: 'Error creating video session', error: error.message });
  }
});

module.exports = router;