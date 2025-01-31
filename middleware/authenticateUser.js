const jwt = require('jsonwebtoken'); // For JWT authentication

const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];  // Bearer token
  if (!token) {
    return res.status(401).json({ message: "Access Denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);  // Verifying token
    req.userId = decoded.id;  // Attach userId to the request
    next();
  } catch (err) {
    console.error('Error verifying token:', err);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};
