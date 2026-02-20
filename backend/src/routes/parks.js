const express = require('express');
const { all } = require('../database/connection');

const router = express.Router();

// Get all parks
router.get('/', async (req, res, next) => {
  try {
    const parks = await all(
      'SELECT id, name, abbreviation, external_api_id FROM parks ORDER BY name'
    );
    
    res.json({
      success: true,
      data: parks,
      count: parks.length
    });
  } catch (error) {
    next(error);
  }
});

// Get attractions for a specific park with current wait times
router.get('/:parkId/attractions', async (req, res, next) => {
  try {
    const parkId = parseInt(req.params.parkId);
    
    const attractions = await all(
      `SELECT a.id, a.name, a.external_api_id, 
              w.wait_minutes, w.status, w.trend, w.fetched_at
       FROM attractions a 
       LEFT JOIN wait_times_cache w ON a.id = w.attraction_id 
       WHERE a.park_id = ? AND a.is_active = 1 
       ORDER BY a.name`,
      [parkId]
    );
    
    res.json({
      success: true,
      data: attractions,
      count: attractions.length
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
