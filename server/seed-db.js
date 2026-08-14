const db = require('./config/db');

const sampleData = [
  {
    name: 'Dr. Sarah Williams',
    specialization: 'Clinical Psychology',
    description: 'Specialist in evidence-based clinical interventions, anxiety disorders, and personality assessments.',
    profile_image: '/images/sarah_williams.png',
    experience_years: 12,
    location: 'Bangalore',
    availability_status: 'Available Today',
    appointments: [
      { title: 'Initial Clinical Assessment', summary: 'Assessed client\'s history of general anxiety and panic triggers.', date: '2026-08-10', time: '09:00:00', status: 'Completed' },
      { title: 'Anxiety Profiling Session', summary: 'Completed diagnostic questionnaire and identified emotional distress triggers.', date: '2026-08-11', time: '10:00:00', status: 'Completed' }
    ]
  },
  {
    name: 'Dr. Michael Brown',
    specialization: 'Family Therapy',
    description: 'Focuses on systemic family therapy, communication dynamics, and resolving conflict in relational systems.',
    profile_image: '/images/michael_brown.png',
    experience_years: 10,
    location: 'Chennai',
    availability_status: 'Available Tomorrow',
    appointments: [
      { title: 'Family Intake Consultation', summary: 'Met with parents and child to review home dynamics and communication breakdowns.', date: '2026-08-08', time: '09:30:00', status: 'Completed' },
      { title: 'Conflict Resolution Session', summary: 'Facilitated open dialogue between spouses regarding parental stress and chores.', date: '2026-08-09', time: '11:00:00', status: 'Completed' }
    ]
  },
  {
    name: 'Dr. Evelyn Vance',
    specialization: 'Cognitive Behavioral Therapy (CBT)',
    description: 'Focused on identifying and reframing cognitive distortions, exposure response prevention, and goal-oriented CBT plans.',
    profile_image: '/images/evelyn_vance.png',
    experience_years: 8,
    location: 'Hyderabad',
    availability_status: 'Available Today',
    appointments: [
      { title: 'CBT Intake Assessment', summary: 'Discussed core negative self-beliefs and introduced basic CBT model concepts.', date: '2026-08-09', time: '10:00:00', status: 'Completed' }
    ]
  }
];

const activityLogs = [
  { type: 'System Initialization', message: 'Database tables verified/created successfully.' },
  { type: 'Therapist Added', message: 'Dr. Sarah Williams added to the platform.' },
  { type: 'Therapist Added', message: 'Dr. Michael Brown added to the platform.' },
  { type: 'Appointment Added', message: 'Appointment Initial Clinical Assessment created.' },
  { type: 'Appointment Added', message: 'Appointment Family Intake Consultation created.' }
];

async function seed() {
  try {
    console.log('Starting Database Seeding...');
    await db.initializeDatabase();

    // Clear old data to ensure exact sample data match
    console.log('Clearing old data...');
    await db.query('SET FOREIGN_KEY_CHECKS = 0');
    await db.query('TRUNCATE TABLE appointments');
    await db.query('TRUNCATE TABLE therapists');
    await db.query('TRUNCATE TABLE activity_logs');
    await db.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('Old tables cleared successfully.');

    // Insert sample data
    for (const item of sampleData) {
      const result = await db.query(
        'INSERT INTO therapists (therapist_name, specialization, description, profile_image, experience_years, location, availability_status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [item.name, item.specialization, item.description, item.profile_image, item.experience_years, item.location, item.availability_status]
      );
      const therapistId = result.insertId;
      console.log(`Inserted Therapist: ${item.name} with ID: ${therapistId}`);

      for (const appt of item.appointments) {
        await db.query(
          'INSERT INTO appointments (therapist_id, appointment_title, summary, appointment_date, appointment_time, status) VALUES (?, ?, ?, ?, ?, ?)',
          [therapistId, appt.title, appt.summary, appt.date, appt.time, appt.status]
        );
        console.log(`  - Inserted Appointment: "${appt.title}" (${appt.status})`);
      }
    }

    // Insert activity logs
    for (const log of activityLogs) {
      await db.query(
        'INSERT INTO activity_logs (activity_type, activity_message) VALUES (?, ?)',
        [log.type, log.message]
      );
      console.log(`Inserted Activity Log: [${log.type}] ${log.message}`);
    }

    console.log('\n==================================================');
    console.log('DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('==================================================');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error.message);
    process.exit(1);
  }
}

seed();
