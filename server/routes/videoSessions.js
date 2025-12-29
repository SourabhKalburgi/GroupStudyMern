// Install required packages
// npm install uuid

const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const authMiddleware = require('../middleware/authMiddleware');
const Group = require('../models/Group');

// Get active video session for a group
router.get('/groups/:groupId/video-session', authMiddleware, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if the user is a member of the group
    if (!group.members.includes(req.user.userId)) {
      return res.status(403).json({ message: 'You are not a member of this group' });
    }

    // Check if there's an active session (less than 24 hours old)
    if (group.activeVideoSession && group.activeVideoSession.roomName) {
      const sessionAge = Date.now() - new Date(group.activeVideoSession.createdAt).getTime();
      const hours24 = 24 * 60 * 60 * 1000;
      
      if (sessionAge < hours24) {
        return res.json({ 
          roomName: group.activeVideoSession.roomName,
          exists: true,
          createdBy: group.activeVideoSession.createdBy
        });
      }
    }

    res.json({ exists: false });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching video session', error: error.message });
  }
});

// Create or get existing video session
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

    // Check if there's an active session (less than 24 hours old)
    if (group.activeVideoSession && group.activeVideoSession.roomName) {
      const sessionAge = Date.now() - new Date(group.activeVideoSession.createdAt).getTime();
      const hours24 = 24 * 60 * 60 * 1000;
      
      if (sessionAge < hours24) {
        return res.json({ 
          roomName: group.activeVideoSession.roomName,
          exists: true,
          createdBy: group.activeVideoSession.createdBy
        });
      }
    }

    // Generate a unique room name
    const roomName = `${group.name.replace(/\s+/g, '-')}-${uuidv4()}`;

    // Save the session to the group
    group.activeVideoSession = {
      roomName,
      createdBy: req.user.userId,
      createdAt: new Date()
    };
    
    await group.save();

    res.json({ 
      roomName,
      exists: false,
      createdBy: req.user.userId
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating video session', error: error.message });
  }
});

// End active video session
router.delete('/groups/:groupId/video-session', authMiddleware, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if the user is a member of the group
    if (!group.members.includes(req.user.userId)) {
      return res.status(403).json({ message: 'You are not a member of this group' });
    }

    // Clear the active session
    group.activeVideoSession = undefined;
    await group.save();

    res.json({ message: 'Video session ended' });
  } catch (error) {
    res.status(500).json({ message: 'Error ending video session', error: error.message });
  }
});

module.exports = router;