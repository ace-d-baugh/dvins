#!/usr/bin/env node

require('dotenv').config();
const { initDatabase } = require('./src/database/init.js');
const { seedDatabase } = require('./src/database/seed.js');

async function setup() {
  console.log('Setting up D'VINS backend...');
  
  try {
    console.log('Initializing database...');
    await initDatabase();
    
    console.log('Seeding database with parks...');
    await seedDatabase();
    
    console.log('Setup complete! The database is ready.');
    process.exit(0);
    
  } catch (error) {
    console.error('Setup failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  setup();
}
