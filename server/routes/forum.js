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

const handleAnswerSubmit = async (postId) => {
  try {
    const content = newAnswers[postId]; // Extract content for the specific post ID
    
    if (!content) {
      console.error("Answer content is empty.");
      return;
    }

    const response = await fetch(`${config.apiBaseUrl}/api/forum/${postId}/answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ content }), // Send only the content
    });

    const data = await response.json();
    setForumPosts(forumPosts.map(post =>
      post._id === postId ? data : post
    ));

    setNewAnswers(prev => ({ ...prev, [postId]: '' })); // Reset the answer field
  } catch (error) {
    console.error('Error adding answer:', error);
  }
};



module.exports = router;