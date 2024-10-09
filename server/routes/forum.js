const express = require('express');
const router = express.Router();
const ForumPost = require('../models/ForumPost');
const authMiddleware = require('../middleware/authMiddleware');

// Create a new forum post
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { groupId, content } = req.body;
    const newPost = new ForumPost({
      groupId,
      author: req.user.userId,
      content
    });
    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ message: 'Error creating forum post', error: error.message });
  }
});

// Get forum posts for a group
router.get('/group/:groupId', async (req, res) => {
  try {
    const posts = await ForumPost.find({ groupId: req.params.groupId })
      .populate('author', 'username')
      .populate('answers.author', 'username')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching forum posts', error: error.message });
  }
});

// Add an answer to a forum post
router.post('/:postId/answer', authMiddleware, async (req, res) => {
    try {
      const { content } = req.body;
      const post = await ForumPost.findById(req.params.postId);
      if (!post) {
        return res.status(404).json({ message: 'Forum post not found' });
      }
      post.answers.push({
        author: req.user.userId,
        content
      });
      await post.save();
      
      // Populate the author field of the new answer
      const populatedPost = await ForumPost.findById(post._id)
        .populate('author', 'username')
        .populate('answers.author', 'username');
      
      res.status(201).json(populatedPost);
    } catch (error) {
      console.error('Error adding answer:', error);
      res.status(500).json({ message: 'Error adding answer', error: error.message });
    }
  });

module.exports = router;