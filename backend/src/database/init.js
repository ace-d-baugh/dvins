const fs = require('fs');
const path = require('path');
const { db } = require('./connection');

const schemaPath = path.join(__dirname, 'schema.sql');

const initDatabase = async () => {
  try {
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split schema into individual statements
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    for (const statement of statements) {
      await new Promise((resolve, reject) => {
        db.exec(statement + ';', (err) => {
          if (err) {
            console.error('Error executing statement:', err.message);
            reject(err);
          } else {
            resolve();
          }
        });
      });
    }
    
    console.log('Database initialized successfully!');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  initDatabase().then(() => {
    db.close();
    process.exit(0);
  });
}

module.exports = { initDatabase };
