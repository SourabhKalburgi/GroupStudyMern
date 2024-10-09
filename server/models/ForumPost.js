const mongoose = require('mongoose');

const forumPostSchema = new mongoose.Schema({
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { 
    type: String, 
    required: true,
    maxlength: 150 // Limit question to 150 words
  },
  answers: [{
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { 
      type: String, 
      required: true,
      maxlength: 400 // Limit answers to 400 words
    },
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

const ForumPost = mongoose.model('ForumPost', forumPostSchema);

module.exports = ForumPost;