const mongoose = require('mongoose');

const tweetSchema = new mongoose.Schema({
  content: { type: String, required: true },
  userId: { type: String, required: true },
  image: { type: String }, // Optional field for image
  video: { type: String }, // Optional field for video
  createdAt: { type: Date, default: Date.now },
  likes: { type: [String], default: [] }, // Array of user IDs who liked the tweet
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }], // Reference to comments
});

module.exports = mongoose.model('Tweet', tweetSchema);
