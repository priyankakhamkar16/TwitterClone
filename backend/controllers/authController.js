const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');

// Function to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc Register new user
const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const user = await User.create({
    username,
    email,
    password,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
};

// @desc Auth user & get token
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
};

// @desc Follow or Unfollow user
const followUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const targetUserId = req.params.id;

    const user = await User.findById(userId);
    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.following.includes(targetUserId)) {
      // Unfollow the user
      user.following = user.following.filter((id) => id.toString() !== targetUserId.toString());
      targetUser.followers = targetUser.followers.filter((id) => id.toString() !== userId.toString());
    } else {
      // Follow the user
      user.following.push(targetUserId);
      targetUser.followers.push(userId);
    }

    await user.save();
    await targetUser.save();

    res.status(200).json({ message: 'Follow status updated' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating follow status' });
  }
};

// @desc Get all users with their follow status
const getUsers = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    // Fetch all users except the current user
    const users = await User.find({ _id: { $ne: currentUserId } }, 'username following followers');
    const currentUser = await User.findById(currentUserId);

    const updatedUsers = users.map((user) => ({
      ...user.toJSON(),
      isFollowing: currentUser.following.includes(user._id),
    }));

    res.json(updatedUsers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
};

// @desc Get the current user's profile
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password'); // Exclude password from response
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        followers: user.followers,
        following: user.following,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user data' });
  }
};

module.exports = { registerUser, loginUser, followUser, getUsers, getMe };
