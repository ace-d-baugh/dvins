const express = require('express');
const { authenticateToken, requireEmailVerification } = require('../middleware/auth');
const { get, all } = require('../database/connection');

const router = express.Router();

// Get single attraction details with latest wait time
router.get('/:attractionId', async (req, res, next) => {
  try {
    const attractionId = parseInt(req.params.attractionId);
    
    const attraction = await get(
      `SELECT a.id, a.name, a.external_api_id, 
              p.name as park_name, p.abbreviation as park_abbreviation,
              w.wait_minutes, w.status, w.trend, w.fetched_at
       FROM attractions a 
       LEFT JOIN parks p ON a.park_id = p.id
       LEFT JOIN wait_times_cache w ON a.id = w.attraction_id 
       WHERE a.id = ? AND a.is_active = 1`,
      [attractionId]
    );
    
    if (!attraction) {
      return res.status(404).json({
        success: false,
        error: 'Attraction not found'
      });
    }
    
    res.json({
      success: true,
      data: attraction
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
