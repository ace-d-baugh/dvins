const https = require('https');
const cron = require('node-cron');
const { run, get, all } = require('../database/connection');

const QUEUE_TIMES_API_URL = 'https://queue-times.com/parks';

// Walt Disney World park IDs on Queue-Times API
const WDW_PARK_IDS = [1, 2, 3, 4]; // MK, EPCOT, DHS, DAK

// Fetch data from Queue-Times API
const fetchQueueTimes = async (parkId) => {
  return new Promise((resolve, reject) => {
    const url = `${QUEUE_TIMES_API_URL}/${parkId}/queue_times.json`;
    
    const request = https.get(url, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (error) {
          reject(new Error(`Failed to parse JSON: ${error.message}`));
        }
      });
    });
    
    request.on('error', (error) => {
      reject(new Error(`HTTP Error: ${error.message}`));
    });
    
    request.setTimeout(30000, () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
};

// Get previous wait time for trend calculation
const getPreviousWaitTime = async (attractionId) => {
  const result = await get(
    `SELECT wait_minutes FROM wait_times_cache 
     WHERE attraction_id = ? 
     ORDER BY fetched_at DESC LIMIT 1`,
    [attractionId]
  );
  return result ? result.wait_minutes : null;
};

// Calculate trend based on previous wait time
const calculateTrend = (currentWait, previousWait) => {
  if (previousWait === null) return 'new';
  if (currentWait === null || currentWait === undefined) return 'same';
  
  const diff = currentWait - previousWait;
  if (diff > 0) return 'up';
  if (diff < 0) return 'down';
  return 'same';
};

// Check if attraction exists, create if not
const ensureAttraction = async (parkId, name, externalApiId) => {
  let attraction = await get(
    'SELECT id FROM attractions WHERE external_api_id = ? AND park_id = ?',
    [externalApiId, parkId]
  );
  
  if (!attraction) {
    const result = await run(
      'INSERT INTO attractions (park_id, name, external_api_id) VALUES (?, ?, ?)',
      [parkId, name, externalApiId]
    );
    return result.lastID;
  }
  
  return attraction.id;
};

// Store wait time data
const storeWaitTime = async (attractionId, waitMinutes, status, trend) => {
  await run(
    `INSERT INTO wait_times_cache (attraction_id, wait_minutes, status, trend, fetched_at) 
     VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    [attractionId, waitMinutes, status, trend]
  );
};

// Get internal park ID from external API ID
const getInternalParkId = async (externalParkId) => {
  const park = await get(
    'SELECT id FROM parks WHERE external_api_id = ?',
    [externalParkId]
  );
  return park ? park.id : null;
};

// Process a single park's data
const processParkData = async (parkData, externalParkId) => {
  const parkId = await getInternalParkId(externalParkId);
  if (!parkId) {
    console.warn(`Park with external ID ${externalParkId} not found in database`);
    return 0;
  }
  
  let attractionsProcessed = 0;
  
  // Process both rides and shows
  const allAttractions = [
    ...(parkData.rides || []),
    ...(parkData.shows || [])
  ];
  
  for (const attraction of allAttractions) {
    try {
      const attractionId = await ensureAttraction(
        parkId,
        attraction.name,
        attraction.id
      );
      
      const waitMinutes = attraction.wait_time;
      const status = attraction.status || 'unknown';
      
      const previousWait = await getPreviousWaitTime(attractionId);
      const trend = calculateTrend(waitMinutes, previousWait);
      
      await storeWaitTime(attractionId, waitMinutes, status, trend);
      attractionsProcessed++;
    } catch (error) {
      console.error(`Error processing attraction ${attraction.name}:`, error.message);
    }
  }
  
  return attractionsProcessed;
};

// Main polling function
const pollQueueTimes = async () => {
  console.log(`[${new Date().toISOString()}] Starting queue times poll...`);
  const startTime = Date.now();
  
  let totalAttractions = 0;
  let errors = [];
  
  for (const parkId of WDW_PARK_IDS) {
    try {
      const parkData = await fetchQueueTimes(parkId);
      const count = await processParkData(parkData, parkId);
      totalAttractions += count;
      console.log(`  Park ${parkId}: Processed ${count} attractions`);
    } catch (error) {
      console.error(`  Park ${parkId}: Error - ${error.message}`);
      errors.push({ parkId, error: error.message });
    }
  }
  
  const duration = Date.now() - startTime;
  console.log(`[${new Date().toISOString()}] Poll complete: ${totalAttractions} attractions in ${duration}ms`);
  
  if (errors.length > 0) {
    console.warn(`  ${errors.length} parks had errors`);
  }
};

// Run polling immediately and then schedule
const startPoller = () => {
  console.log('Starting Queue-Times API Poller...');
  console.log('Polling interval: every 60 seconds');
  
  // Run immediately on startup
  pollQueueTimes().catch(console.error);
  
  // Schedule to run every 60 seconds
  cron.schedule('*/1 * * * *', () => {
    pollQueueTimes().catch(console.error);
  });
};

// Run if called directly
if (require.main === module) {
  startPoller();
}

module.exports = {
  startPoller,
  pollQueueTimes,
  fetchQueueTimes,
  calculateTrend
};
