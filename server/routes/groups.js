const express = require('express');
const mongoose = require('mongoose');
const Group = require('../models/Group');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Helper function to validate ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Combine the routes into a single GET handler for groups
router.get('/', async (req, res) => {
  try {
    let query = {};
    if (req.query.creator && isValidObjectId(req.query.creator)) {
      query.creator = req.query.creator;
    }
    if (req.query.member && isValidObjectId(req.query.member)) {
      query.members = req.query.member;
    }
    const groups = await Group.find(query).populate('creator', 'username');
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching groups', error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid group ID' });
    }
    const group = await Group.findById(req.params.id).populate('creator', 'username');
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    res.json(group);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, description, icon } = req.body;
    const newGroup = new Group({
      name,
      description,
      icon,
      creator: req.user.userId
    });
    
    const savedGroup = await newGroup.save();
    await User.findByIdAndUpdate(req.user.userId, { $push: { createdGroups: savedGroup._id } });
    
    res.status(201).json(savedGroup);
  } catch (error) {
    res.status(500).json({ message: 'Error creating group', error: error.message });
  }
});

router.post('/:id/like', authMiddleware, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid group ID' });
    }
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    if (group.likes.includes(req.user.userId)) {
      group.likes.pull(req.user.userId);
    } else {
      group.likes.push(req.user.userId);
    }
    await group.save();
    res.json(group);
  } catch (error) {
    res.status(500).json({ message: 'Error liking group', error: error.message });
  }
});

router.post('/:id/rate', authMiddleware, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid group ID' });
    }
    const { rating } = req.body;
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    const existingRatingIndex = group.ratings.findIndex(r => r.user.toString() === req.user.userId);
    if (existingRatingIndex > -1) {
      group.ratings[existingRatingIndex].rating = rating;
    } else {
      group.ratings.push({ user: req.user.userId, rating });
    }
    group.averageRating = group.calculateAverageRating();
    await group.save();
    res.json(group);
  } catch (error) {
    res.status(500).json({ message: 'Error rating group', error: error.message });
  }
});

router.post('/:id/join', authMiddleware, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid group ID' });
    }
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Prevent duplicate entries
    if (!group.members.includes(req.user.userId)) {
      group.members.push(req.user.userId);
      await group.save();
      await User.findByIdAndUpdate(req.user.userId, { $addToSet: { savedGroups: group._id } });
    }

    res.json(group);
  } catch (error) {
    res.status(500).json({ message: 'Error joining group', error: error.message });
  }
});

router.post('/:id/leave', authMiddleware, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid group ID' });
    }
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    group.members.pull(req.user.userId);
    await group.save();
    await User.findByIdAndUpdate(req.user.userId, { $pull: { savedGroups: group._id } });
    res.json(group);
  } catch (error) {
    res.status(500).json({ message: 'Error leaving group', error: error.message });
  }
});

module.exports = router;