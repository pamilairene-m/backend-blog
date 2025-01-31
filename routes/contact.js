const express = require("express");
const Contact = require("../models/Contact");

const router = express.Router();

// Submit Contact Form
router.post("/", async (req, res) => {
  console.log("✅ Received contact form data:", req.body);

  const { name, email, subject, message } = req.body;

  try {
    const newContact = new Contact({ name, email, subject, message });
    await newContact.save();

    res.status(201).json({ message: "Message received successfully!" });
  } catch (err) {
    console.error("❌ Contact Form Submission Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
