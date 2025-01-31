const express = require('express');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const Story = require('../models/Story');
const router = express.Router();

// Set up multer storage to save images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Middleware to authenticate the user and extract the userId from the token
const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Bearer token
  if (!token) {
    return res.status(401).json({ message: "Access Denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id; // Extract userId from token and attach to the request
    next();
  } catch (err) {
    console.error('Error verifying token:', err);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Get all stories of the logged-in user
router.get("/", authenticateUser, async (req, res) => {
  try {
    const stories = await Story.find({ userId: req.userId });  // Fetch stories by userId
    res.json(stories);
  } catch (err) {
    console.error('Error fetching stories:', err);
    res.status(500).json({ message: 'Failed to fetch stories' });
  }
});

// Create a new story
router.post("/", authenticateUser, upload.single('image'), async (req, res) => {
  const { title, content, date } = req.body;
  const image = req.file ? req.file.path : null;
  const userId = req.userId;

  if (!title || !content || !image || !date) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const story = new Story({ title, content, image, date, userId });

  try {
    const newStory = await story.save();
    res.status(201).json({
      message: 'Story added successfully',
      story: newStory,
    });
  } catch (err) {
    console.error('Error saving new story:', err);
    res.status(400).json({ message: 'Failed to create new story' });
  }
});

// Update a story
router.put("/:id", authenticateUser, upload.single('image'), async (req, res) => {
  const { title, content } = req.body;
  const image = req.file ? req.file.path : req.body.image;  // Get the new image path if uploaded, or keep the old image if not

  if (!title || !content) {
    return res.status(400).json({ message: "All fields are required to update the story" });
  }

  try {
    const updatedStory = await Story.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },  // Ensure the user can only update their own stories
      { title, content, image },
      { new: true }
    );

    if (!updatedStory) {
      return res.status(404).json({ message: 'Story not found or not authorized to update' });
    }

    res.json(updatedStory);
  } catch (err) {
    console.error('Error updating story:', err);
    res.status(400).json({ message: 'Failed to update story' });
  }
});

// Delete a story
router.delete("/:id", authenticateUser, async (req, res) => {
  try {
    const deletedStory = await Story.findOneAndDelete({ _id: req.params.id, userId: req.userId });

    if (!deletedStory) {
      return res.status(404).json({ message: 'Story not found or not authorized to delete' });
    }

    // Remove the associated image file if exists
    if (deletedStory.image) {
      fs.unlink(deletedStory.image, (err) => {
        if (err) console.error('Error deleting image:', err);
      });
    }

    res.json({ message: 'Story deleted' });
  } catch (err) {
    console.error('Error deleting story:', err);
    res.status(400).json({ message: 'Failed to delete story' });
  }
});

module.exports = router;
