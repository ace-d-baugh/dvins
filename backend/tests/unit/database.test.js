const { expect } = require('chai');
const { initDatabase, seedDatabase } = require('../src/database/init.js');
const { db } = require('../src/database/connection.js');

describe('Database', () => {
  before(async () => {
    await initDatabase();
  });

  after(async () => {
    await db.close();
  });

  describe('Initialization', () => {
    it('should create tables', async () => {
      const tables = await db.all(
        `SELECT name FROM sqlite_master 
         WHERE type='table' AND name NOT LIKE 'sqlite_%'`
      );
      
      const tableNames = tables.map(t => t.name);
      expect(tableNames).to.include.members([
        'users',
        'parks',
        'attractions',
        'wait_times_cache',
        'favorites',
        'notification_prefs'
      ]);
    });
  });

  describe('Seeding', () => {
    before(async () => {
      await seedDatabase();
    });

    it('should seed parks', async () => {
      const parks = await db.all(
        'SELECT * FROM parks WHERE external_api_id IS NOT NULL'
      );
      expect(parks).to.have.lengthOf(4);
      expect(parks[0]).to.have.property('name');
      expect(parks[0]).to.have.property('abbreviation');
      expect(parks[0]).to.have.property('external_api_id');
    });
  });
});
