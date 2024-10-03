const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  tweetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tweet', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
