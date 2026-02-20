const { run } = require('./connection');

// Walt Disney World Resort parks
const parks = [
  { name: 'Magic Kingdom Park', abbreviation: 'MK', external_api_id: 1 },
  { name: "EPCOT", abbreviation: 'EPCOT', external_api_id: 2 },
  { name: "Disney's Hollywood Studios", abbreviation: 'DHS', external_api_id: 3 },
  { name: "Disney's Animal Kingdom Theme Park", abbreviation: 'DAK', external_api_id: 4 }
];

const seedParks = async () => {
  try {
    for (const park of parks) {
      await run(
        'INSERT OR IGNORE INTO parks (name, abbreviation, external_api_id) VALUES (?, ?, ?)',
        [park.name, park.abbreviation, park.external_api_id]
      );
    }
    console.log('Parks seeded successfully!');
  } catch (error) {
    console.error('Error seeding parks:', error);
    throw error;
  }
};

const seedDatabase = async () => {
  try {
    console.log('Seeding database...');
    await seedParks();
    console.log('Database seeding complete!');
  } catch (error) {
    console.error('Database seeding failed:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  seedDatabase().then(() => {
    process.exit(0);
  });
}

module.exports = { seedDatabase, seedParks };
