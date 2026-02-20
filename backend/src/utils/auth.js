const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { get, run } = require('../database/connection');

const SALT_ROUNDS = 12;
const VERIFICATION_TOKEN_EXPIRES_HOURS = 24;

const hashPassword = async (password) => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

const generateJwtToken = (userId, email) => {
  return jwt.sign(
    { id: userId, email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

const generateVerificationToken = async () => {
  const token = Math.random().toString(36).substring(2, 25) + 
                Math.random().toString(36).substring(2, 25);
  
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + VERIFICATION_TOKEN_EXPIRES_HOURS);
  
  return { token, expiresAt };
};

const verifyEmail = async (userId) => {
  await run(
    'UPDATE users SET email_verified = 1 WHERE id = ?',
    [userId]
  );
};

const getUserByEmail = async (email) => {
  return await get(
    'SELECT id, email, password_hash, email_verified FROM users WHERE email = ?',
    [email]
  );
};

const createUser = async (email, passwordHash, verificationToken, verificationTokenExpiresAt) => {
  const result = await run(
    'INSERT INTO users (email, password_hash, verification_token, verification_token_expires_at) VALUES (?, ?, ?, ?)',
    [email, passwordHash, verificationToken, verificationTokenExpiresAt]
  );
  return result.lastID;
};

module.exports = {
  hashPassword,
  comparePassword,
  generateJwtToken,
  generateVerificationToken,
  verifyEmail,
  getUserByEmail,
  createUser
};
