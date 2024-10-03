const express = require('express');
const { registerUser, loginUser, followUser, getUsers, getMe } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/signup', registerUser);
router.post('/signin', loginUser);

// Route to get the current user's profile
router.get('/me', authMiddleware, getMe); // Add this line

// Route to fetch all users with follow status
router.get('/users', authMiddleware, getUsers);

// Route to follow/unfollow a user
router.post('/follow/:id', authMiddleware, followUser);

module.exports = router;
