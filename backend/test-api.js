#!/usr/bin/env node

const https = require('https');

const testAPI = () => {
  console.log('Testing D'VINS Backend API...');
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/',
    method: 'GET'
  };
  
  const req = https.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      const response = JSON.parse(data);
      console.log('API Status:', response.message);
      console.log('Timestamp:', response.timestamp);
      console.log('Version:', response.version);
      process.exit(0);
    });
  });
  
  req.on('error', (error) => {
    console.error('API test failed:', error.message);
    process.exit(1);
  });
  
  req.end();
};

if (require.main === module) {
  testAPI();
}
