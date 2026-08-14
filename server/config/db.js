const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  connectTimeout: 10000,
  acquireTimeout: 10000
};

let pool = null;

/**
 * Initializes the database connection pool and ensures database/tables exist.
 */
async function initializeDatabase() {
  try {
    console.log(`Connecting to FreeDB MySQL at ${dbConfig.host}:${dbConfig.port} as user ${dbConfig.user}...`);

    // 1. Initialize the connection pool using the target database configuration
    pool = mysql.createPool(dbConfig);

    // 2. Test pool connection
    let testConnection;
    try {
      testConnection = await pool.getConnection();
      testConnection.release();
      console.log('✅ Connected to FreeDB MySQL Database');
    } catch (connErr) {
      console.error('❌ Failed to connect to FreeDB MySQL Database');
      console.error(`Connection Error: ${connErr.code} - ${connErr.message}`);
      throw connErr;
    }

    // 4. Check if we need to migrate/recreate tables (e.g. if the therapists table lacks new columns)
    let dropNeeded = false;
    try {
      const [columns] = await pool.query('SHOW COLUMNS FROM therapists LIKE "experience_years"');
      if (columns.length === 0) {
        dropNeeded = true;
      } else {
        const [appColumns] = await pool.query('SHOW COLUMNS FROM appointments LIKE "status"');
        if (appColumns.length === 0) {
          dropNeeded = true;
        }
      }
    } catch (e) {
      // Table doesn't exist yet, which is fine
    }

    if (dropNeeded) {
      console.log('Detected outdated therapists table schema. Dropping tables to recreate with specialization, description, profile_image, and created_at...');
      await pool.query('DROP TABLE IF EXISTS appointments');
      await pool.query('DROP TABLE IF EXISTS therapists');
    }

    // 5. Create tables if they do not exist with updated schema
    await pool.query(`
      CREATE TABLE IF NOT EXISTS therapists (
        therapist_id INT AUTO_INCREMENT PRIMARY KEY,
        therapist_name VARCHAR(100) NOT NULL,
        specialization VARCHAR(255) NOT NULL,
        description TEXT,
        profile_image TEXT,
        experience_years INT NOT NULL DEFAULT 5,
        location VARCHAR(100) NOT NULL DEFAULT 'Unknown',
        availability_status VARCHAR(100) NOT NULL DEFAULT 'Available Today',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        appointment_id INT AUTO_INCREMENT PRIMARY KEY,
        therapist_id INT NOT NULL,
        appointment_title VARCHAR(255) NOT NULL,
        summary TEXT NOT NULL,
        appointment_date DATE NOT NULL,
        appointment_time TIME NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'Scheduled',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (therapist_id)
          REFERENCES therapists(therapist_id)
          ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    // 6. Migrate existing appointments table to add columns if missing
    try {
      const [columns] = await pool.query('SHOW COLUMNS FROM appointments LIKE "appointment_date"');
      if (columns.length === 0) {
        console.log('Migrating appointments table: Adding appointment_date and appointment_time columns...');
        await pool.query(`
          ALTER TABLE appointments 
          ADD COLUMN appointment_date DATE NOT NULL DEFAULT '2026-08-12', 
          ADD COLUMN appointment_time TIME NOT NULL DEFAULT '10:00:00'
        `);
      }
    } catch (e) {
      console.error('Migration warning for appointments table:', e.message);
    }

    // 7. Create activity_logs table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        activity_id INT AUTO_INCREMENT PRIMARY KEY,
        activity_type VARCHAR(100) NOT NULL,
        activity_message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    console.log('Database tables verified/created successfully.');
    return pool;
  } catch (error) {
    console.error('❌ Failed to connect to FreeDB MySQL Database');
    console.error('Failed to initialize database:', error.message);
    throw error;
  }
}

/**
 * Helper to log platform activities in the database.
 */
async function logActivity(type, message) {
  try {
    if (!pool) return;
    await pool.query(
      'INSERT INTO activity_logs (activity_type, activity_message) VALUES (?, ?)',
      [type, message]
    );
    console.log(`[Activity Logged] ${type}: ${message}`);
  } catch (error) {
    console.error('Failed to log activity:', error.message);
  }
}

module.exports = {
  initializeDatabase,
  getPool: () => pool,
  query: async (sql, params) => {
    if (!pool) {
      const err = new Error('Database pool is not initialized. Call initializeDatabase() first.');
      console.error('❌ Database query failed: Pool not initialized.');
      throw err;
    }
    const startTime = Date.now();
    try {
      console.log(`[DB Query Executed] SQL: ${sql} | Params: ${JSON.stringify(params || [])}`);
      const [results] = await pool.query(sql, params);
      const duration = Date.now() - startTime;
      console.log(`[DB Query Success] Execution time: ${duration}ms`);
      return results;
    } catch (error) {
      console.error(`❌ [DB Query Error] SQL: ${sql} | Error: ${error.message}`);
      throw error;
    }
  },
  logActivity
};
