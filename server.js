const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/database');
const authRoutes = require("./routes/auth");

const contactRoutes = require("./routes/contact");
const storyRoutes = require("./routes/stories"); // Updated stories route
dotenv.config();
const app = express();

app.use(express.json());
app.use(cors({
  origin: 'https://frontend-blog-uisp-o0gejeeca-pamilairene-ms-projects.vercel.app', // Adjust based on frontend
}));

connectDB();

app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.use("/api/auth", authRoutes);

app.use("/api/contact", contactRoutes);
app.use("/api/stories", storyRoutes);  // Use the updated stories route

const port = 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
