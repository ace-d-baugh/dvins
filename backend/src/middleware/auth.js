const jwt = require('jsonwebtoken');
const { get } = require('../database/connection');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    
    req.user = user;
    next();
  });
};

const requireEmailVerification = async (req, res, next) => {
  const user = await get(
    'SELECT email_verified FROM users WHERE id = ?',
    [req.user.id]
  );

  if (!user || !user.email_verified) {
    return res.status(403).json({ 
      error: 'Email verification required', 
      email: user ? user.email : null 
    });
  }

  next();
};

module.exports = {
  authenticateToken,
  requireEmailVerification
};
