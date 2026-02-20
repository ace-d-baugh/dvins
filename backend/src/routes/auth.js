const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validation');
const { authenticateToken, requireEmailVerification } = require('../middleware/auth');
const {
  hashPassword,
  comparePassword,
  generateJwtToken,
  generateVerificationToken,
  verifyEmail,
  getUserByEmail,
  createUser
} = require('../utils/auth');
const { sendVerificationEmail } = require('../services/email');

const router = express.Router();

// Registration
router.post(
  '/register',
  validate([
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('password_confirmation').exists()
  ]),
  async (req, res, next) => {
    try {
      const { email, password, password_confirmation } = req.body;
      
      // Check if user already exists
      const existingUser = await getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: 'Email already registered' });
      }
      
      // Validate password confirmation
      if (password !== password_confirmation) {
        return res.status(400).json({ error: 'Passwords do not match' });
      }
      
      // Hash password and create verification token
      const passwordHash = await hashPassword(password);
      const { token: verificationToken, expiresAt: verificationTokenExpiresAt } = await generateVerificationToken();
      
      // Create user
      const userId = await createUser(
        email,
        passwordHash,
        verificationToken,
        verificationTokenExpiresAt
      );
      
      // Send verification email
      await sendVerificationEmail(email, verificationToken);
      
      // Generate JWT (user will need to verify email first)
      const token = generateJwtToken(userId, email);
      
      res.status(201).json({
        message: 'Registration successful. Please check your email for verification link.',
        user: { id: userId, email },
        token
      });
      
    } catch (error) {
      next(error);
    }
  }
);

// Login
router.post(
  '/login',
  validate([
    body('email').isEmail().normalizeEmail(),
    body('password').exists()
  ]),
  async (req, res, next) => {
    try {
      const { email, password } = req.body;
      
      const user = await getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      
      const passwordValid = await comparePassword(password, user.password_hash);
      if (!passwordValid) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      
      if (!user.email_verified) {
        return res.status(403).json({ 
          error: 'Email not verified', 
          email: user.email 
        });
      }
      
      const token = generateJwtToken(user.id, user.email);
      
      res.json({
        message: 'Login successful',
        user: { 
          id: user.id, 
          email: user.email, 
          email_verified: user.email_verified 
        },
        token
      });
      
    } catch (error) {
      next(error);
    }
  }
);

// Email verification
router.post(
  '/verify-email',
  validate([
    body('token').exists()
  ]),
  async (req, res, next) => {
    try {
      const { token } = req.body;
      
      const user = await get(
        'SELECT id, verification_token, verification_token_expires_at FROM users WHERE verification_token = ?',
        [token]
      );
      
      if (!user) {
        return res.status(400).json({ error: 'Invalid or expired verification token' });
      }
      
      const expiresAt = new Date(user.verification_token_expires_at);
      if (expiresAt < new Date()) {
        return res.status(400).json({ error: 'Verification token has expired' });
      }
      
      await verifyEmail(user.id);
      
      res.json({
        message: 'Email verified successfully',
        user: { id: user.id, email_verified: 1 }
      });
      
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
