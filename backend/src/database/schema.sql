-- D'VINS Database Schema
-- SQLite database for Disney wait times tracking

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  email_verified INTEGER DEFAULT 0,
  verification_token TEXT,
  verification_token_expires_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Parks table
CREATE TABLE IF NOT EXISTS parks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  abbreviation TEXT UNIQUE NOT NULL,
  external_api_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Attractions table
CREATE TABLE IF NOT EXISTS attractions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  park_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  external_api_id INTEGER,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (park_id) REFERENCES parks(id) ON DELETE CASCADE
);

-- Wait times cache table
CREATE TABLE IF NOT EXISTS wait_times_cache (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  attraction_id INTEGER NOT NULL,
  wait_minutes INTEGER,
  status TEXT,
  trend TEXT CHECK(trend IN ('up', 'down', 'same', 'new')),
  fetched_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (attraction_id) REFERENCES attractions(id) ON DELETE CASCADE
);

-- Favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  attraction_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (attraction_id) REFERENCES attractions(id) ON DELETE CASCADE,
  UNIQUE(user_id, attraction_id)
);

-- Notification preferences table
CREATE TABLE IF NOT EXISTS notification_prefs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  attraction_id INTEGER NOT NULL,
  threshold_minutes INTEGER,
  reopening_alert INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (attraction_id) REFERENCES attractions(id) ON DELETE CASCADE,
  UNIQUE(user_id, attraction_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_wait_times_attraction_id ON wait_times_cache(attraction_id);
CREATE INDEX IF NOT EXISTS idx_wait_times_fetched_at ON wait_times_cache(fetched_at);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_attraction_id ON favorites(attraction_id);
CREATE INDEX IF NOT EXISTS idx_notification_prefs_user_id ON notification_prefs(user_id);
CREATE INDEX IF NOT EXISTS idx_attractions_park_id ON attractions(park_id);
