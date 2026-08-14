const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD === 'YOUR_PASSWORD' ? '' : (process.env.DB_PASSWORD || ''),
  port: parseInt(process.env.DB_PORT) || 3306
};

// Enable SSL/TLS only for remote database hosts (e.g. TiDB Cloud) to prevent local MySQL connection failures
const isLocal = dbConfig.host === 'localhost' || dbConfig.host === '127.0.0.1';
const sslConfig = isLocal ? null : {
  minVersion: 'TLSv1.2',
  rejectUnauthorized: true
};

const dbName = process.env.DB_NAME || 'therapy_summary_db';

let pool = null;

/**
 * Initializes the database connection pool and ensures database/tables exist.
 */
async function initializeDatabase() {
  try {
    console.log(`Connecting to MySQL at ${dbConfig.host} as user ${dbConfig.user}...`);
    // 1. Create a connection without DB name to check/create the DB
    let tempConnection;
    try {
      tempConnection = await mysql.createConnection({
        ...dbConfig,
        ...(sslConfig && { ssl: sslConfig })
      });
    } catch (connErr) {
      if (connErr.code === 'ER_ACCESS_DENIED_ERROR' && dbConfig.password !== '') {
        console.warn('Access denied with configured password. Falling back to blank password...');
        dbConfig.password = '';
        tempConnection = await mysql.createConnection({
          ...dbConfig,
          ...(sslConfig && { ssl: sslConfig })
        });
      } else {
        throw connErr;
      }
    }
    await tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    await tempConnection.end();

    // 2. Initialize the connection pool using the target database
    pool = mysql.createPool({
      ...dbConfig,
      database: dbName,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      ...(sslConfig && { ssl: sslConfig })
    });

    // 3. Test pool connection
    const testConnection = await pool.getConnection();
    testConnection.release();
    console.log(`Successfully connected to database: ${dbName}`);

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
        email VARCHAR(255),
        description TEXT,
        profile_image TEXT,
        experience_years INT NOT NULL DEFAULT 5,
        location VARCHAR(100) NULL,
        availability_status VARCHAR(100) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    // 5b. Migrate existing therapists table to add email column if missing
    try {
      const [columns] = await pool.query('SHOW COLUMNS FROM therapists LIKE "email"');
      if (columns.length === 0) {
        console.log('Migrating therapists table: Adding email column...');
        await pool.query(`
          ALTER TABLE therapists 
          ADD COLUMN email VARCHAR(255)
        `);
      }
    } catch (e) {
      console.error('Migration warning for therapists table email:', e.message);
    }

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

    // Auto-seed if database is empty
    const [countResult] = await pool.query('SELECT COUNT(*) as count FROM therapists');
    if (countResult[0].count === 0) {
      console.log('Therapists table is empty. Auto-seeding initial sample data...');
      
      // Insert sample therapists
      const [t1] = await pool.query(
        'INSERT INTO therapists (therapist_name, specialization, email, description, profile_image, experience_years) VALUES (?, ?, ?, ?, ?, ?)',
        ['Dr. Sarah Williams', 'Clinical Psychology', 'sarah@example.com', 'Specialist in evidence-based clinical interventions, anxiety disorders, and personality assessments.', '/images/sarah_williams.png', 12]
      );
      const [t2] = await pool.query(
        'INSERT INTO therapists (therapist_name, specialization, email, description, profile_image, experience_years) VALUES (?, ?, ?, ?, ?, ?)',
        ['Dr. Michael Brown', 'Family Therapy', 'michael@example.com', 'Focuses on systemic family therapy, communication dynamics, and resolving conflict in relational systems.', '/images/michael_brown.png', 10]
      );
      const [t3] = await pool.query(
        'INSERT INTO therapists (therapist_name, specialization, email, description, profile_image, experience_years) VALUES (?, ?, ?, ?, ?, ?)',
        ['Dr. Evelyn Vance', 'Cognitive Behavioral Therapy (CBT)', 'evelyn@example.com', 'Focused on identifying and reframing cognitive distortions, exposure response prevention, and goal-oriented CBT plans.', '/images/evelyn_vance.png', 8]
      );

      const id1 = t1.insertId;
      const id2 = t2.insertId;
      const id3 = t3.insertId;

      // Insert sample appointments
      await pool.query(
        `INSERT INTO appointments (therapist_id, appointment_title, summary, appointment_date, appointment_time, status) VALUES 
        (?, 'Initial Clinical Assessment', 'Assessed client history of general anxiety and panic triggers.', '2026-08-10', '09:00:00', 'Completed'),
        (?, 'Anxiety Profiling Session', 'Completed diagnostic questionnaire and identified emotional distress triggers.', '2026-08-11', '10:00:00', 'Completed'),
        (?, 'Family Intake Consultation', 'Met with parents and child to review home dynamics and communication breakdowns.', '2026-08-08', '09:30:00', 'Completed'),
        (?, 'Conflict Resolution Session', 'Facilitated open dialogue between spouses regarding parental stress and chores.', '2026-08-09', '11:00:00', 'Completed'),
        (?, 'CBT Intake Assessment', 'Discussed core negative self-beliefs and introduced basic CBT model concepts.', '2026-08-09', '10:00:00', 'Completed')`,
        [id1, id1, id2, id2, id3]
      );

      // Insert sample activity logs
      await pool.query(
        `INSERT INTO activity_logs (activity_type, activity_message) VALUES 
        ('System Initialization', 'Database tables verified/created successfully.'),
        ('Therapist Added', 'Dr. Sarah Williams added to the platform.'),
        ('Therapist Added', 'Dr. Michael Brown added to the platform.'),
        ('Appointment Added', 'Appointment Initial Clinical Assessment created.'),
        ('Appointment Added', 'Appointment Family Intake Consultation created.')`
      );
      
      console.log('Database auto-seeding completed successfully.');
    }

    console.log('Database tables verified/created successfully.');
    return pool;
  } catch (error) {
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
  dbConfig,
  dbName,
  query: async (sql, params) => {
    if (!pool) {
      throw new Error('Database pool is not initialized. Call initializeDatabase() first.');
    }
    const [results] = await pool.query(sql, params);
    return results;
  },
  logActivity
};
