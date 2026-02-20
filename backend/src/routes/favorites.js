const express = require('express');
const { authenticateToken, requireEmailVerification } = require('../middleware/auth');
const { body, validate } = require('../middleware/validation');
const { get, all, run } = require('../database/connection');

const router = express.Router();

// Add to favorites
router.post(
  '/',
  authenticateToken,
  requireEmailVerification,
  validate([
    body('attraction_id').isInt().withMessage('Attraction ID is required')
  ]),
  async (req, res, next) => {
    try {
      const { attraction_id } = req.body;
      
      // Check if attraction exists
      const attraction = await get(
        'SELECT id FROM attractions WHERE id = ? AND is_active = 1',
        [attraction_id]
      );
      
      if (!attraction) {
        return res.status(404).json({
          success: false,
          error: 'Attraction not found'
        });
      }
      
      // Add to favorites
      await run(
        'INSERT INTO favorites (user_id, attraction_id) VALUES (?, ?)',
        [req.user.id, attraction_id]
      );
      
      res.status(201).json({
        success: true,
        message: 'Attraction added to favorites',
        data: { 
          user_id: req.user.id, 
          attraction_id 
        }
      });
      
    } catch (error) {
      if (error.message.includes('UNIQUE constraint failed')) {
        return res.status(409).json({
          success: false,
          error: 'Attraction already in favorites'
        });
      }
      next(error);
    }
  }
);

// Remove from favorites
router.delete('/:id', authenticateToken, requireEmailVerification, async (req, res, next) => {
  try {
    const favoriteId = parseInt(req.params.id);
    
    // Check if favorite exists and belongs to user
    const favorite = await get(
      'SELECT id FROM favorites WHERE id = ? AND user_id = ?',
      [favoriteId, req.user.id]
    );
    
    if (!favorite) {
      return res.status(404).json({
        success: false,
        error: 'Favorite not found'
      });
    }
    
    // Delete favorite
    await run(
      'DELETE FROM favorites WHERE id = ?',
      [favoriteId]
    );
    
    res.json({
      success: true,
      message: 'Attraction removed from favorites'
    });
    
  } catch (error) {
    next(error);
  }
});

// Get user's favorites
router.get('/', authenticateToken, requireEmailVerification, async (req, res, next) => {
  try {
    const favorites = await all(
      `SELECT f.id, f.attraction_id, a.name as attraction_name, 
              p.name as park_name, p.abbreviation as park_abbreviation,
              w.wait_minutes, w.status, w.trend, w.fetched_at
       FROM favorites f
       JOIN attractions a ON f.attraction_id = a.id
       JOIN parks p ON a.park_id = p.id
       LEFT JOIN wait_times_cache w ON a.id = w.attraction_id
       WHERE f.user_id = ? AND a.is_active = 1
       ORDER BY a.name`,
      [req.user.id]
    );
    
    res.json({
      success: true,
      data: favorites,
      count: favorites.length
    });
    
  } catch (error) {
    next(error);
  }
});

module.exports = router;
