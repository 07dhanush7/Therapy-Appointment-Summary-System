const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
};

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
      { title: 'Anxiety Profiling Session', summary: 'Completed diagnostic questionnaire and identified emotional distress triggers.', date: '2026-08-11', time: '10:00:00', status: 'Completed' },
      { title: 'Cognitive Mapping Review', summary: 'Mapped client\'s maladaptive thinking patterns and established therapeutic goals.', date: '2026-08-12', time: '11:30:00', status: 'Completed' },
      { title: 'Weekly Progress Session', summary: 'Reviewed homework worksheets on cognitive reframing. Reported moderate success.', date: '2026-08-13', time: '14:00:00', status: 'Scheduled' },
      { title: 'Follow-Up Consultation', summary: 'Standard follow-up to monitor stability and coping mechanism practices.', date: '2026-08-14', time: '15:30:00', status: 'Pending' }
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
      { title: 'Conflict Resolution Session', summary: 'Facilitated open dialogue between spouses regarding parental stress and chores.', date: '2026-08-09', time: '11:00:00', status: 'Completed' },
      { title: 'Relational Dynamics Review', summary: 'Evaluated boundaries and conflict resolution worksheets with the family.', date: '2026-08-11', time: '13:00:00', status: 'Completed' },
      { title: 'Follow-Up Family Session', summary: 'Checking in on progress regarding sibling conflicts and communication goals.', date: '2026-08-13', time: '16:00:00', status: 'Scheduled' },
      { title: 'Routine Family Check', summary: 'Standard touchpoint to maintain relational balance and check goals.', date: '2026-08-15', time: '10:30:00', status: 'Pending' }
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
      { title: 'CBT Intake Assessment', summary: 'Discussed core negative self-beliefs and introduced basic CBT model concepts.', date: '2026-08-09', time: '10:00:00', status: 'Completed' },
      { title: 'Thoughts Recording Analysis', summary: 'Reviewed client\'s thought records from the past week. Challenged automatic thoughts.', date: '2026-08-10', time: '14:30:00', status: 'Completed' },
      { title: 'Behavioral Experiment Planning', summary: 'Designed a structured experiment to test anxiety assumptions in social settings.', date: '2026-08-11', time: '16:00:00', status: 'Completed' },
      { title: 'Core Belief Restructuring', summary: 'Continued work on modifying deeply rooted self-limiting rules and schemas.', date: '2026-08-13', time: '11:00:00', status: 'Scheduled' },
      { title: 'CBT Progress Review', summary: 'Assessing overall symptoms and discussing term goals.', date: '2026-08-16', time: '09:00:00', status: 'Pending' }
    ]
  },
  {
    name: 'Dr. David Miller',
    specialization: 'Trauma Recovery',
    description: 'Certified EMDR specialist dedicated to helping clients navigate complex PTSD, developmental trauma, and resilience building.',
    profile_image: '/images/david_miller.png',
    experience_years: 15,
    location: 'Mumbai',
    availability_status: 'Available Today',
    appointments: [
      { title: 'Trauma Intake Evaluation', summary: 'Gathered trauma timeline details and discussed grounding exercises for safety.', date: '2026-08-07', time: '11:00:00', status: 'Completed' },
      { title: 'EMDR Preparation Session', summary: 'Established bilateral stimulation preferences and identified target memories.', date: '2026-08-09', time: '13:30:00', status: 'Completed' },
      { title: 'Active Desensitization Session', summary: 'Performed initial EMDR processing phase targeting early school memory.', date: '2026-08-11', time: '15:00:00', status: 'Completed' },
      { title: 'EMDR Integration Review', summary: 'Reviewed distress levels after desensitization. Client felt significant release.', date: '2026-08-13', time: '10:00:00', status: 'Scheduled' },
      { title: 'Post-Trauma Follow-Up', summary: 'Scheduled follow-up session to ensure integration and emotional stability.', date: '2026-08-17', time: '12:00:00', status: 'Pending' }
    ]
  },
  {
    name: 'Dr. Priya Nair',
    specialization: 'Child Psychology',
    description: 'Specialized in pediatric development, play therapy, and helping children and adolescents manage behavioral challenges.',
    profile_image: '/images/priya_nair.png',
    experience_years: 9,
    location: 'Pune',
    availability_status: 'Available Tomorrow',
    appointments: [
      { title: 'Play Therapy Assessment', summary: 'Observed child\'s behavior and expression during creative play activities.', date: '2026-08-08', time: '14:00:00', status: 'Completed' },
      { title: 'Parent Consult Session', summary: 'Shared developmental findings and behavioral guidance strategies with parents.', date: '2026-08-10', time: '16:30:00', status: 'Completed' },
      { title: 'Emotion Recognition Session', summary: 'Worked on labeling feelings using interactive board games and card exercises.', date: '2026-08-12', time: '09:30:00', status: 'Completed' },
      { title: 'Social Skills Exercise', summary: 'Practiced sharing, active listening, and conflict resolution scenarios.', date: '2026-08-14', time: '11:00:00', status: 'Scheduled' },
      { title: 'Child Progress Check', summary: 'Bi-weekly progress update and check-in session for behavioral improvements.', date: '2026-08-15', time: '13:00:00', status: 'Pending' }
    ]
  },
  {
    name: 'Dr. Robert Wilson',
    specialization: 'Addiction Counseling',
    description: 'Dedicated to substance abuse treatment, relapse prevention, and using motivational interviewing to support recovery journeys.',
    profile_image: '/images/robert_wilson.png',
    experience_years: 14,
    location: 'Delhi',
    availability_status: 'Available Today',
    appointments: [
      { title: 'Motivational Intake Interview', summary: 'Explored readiness to change and identified primary substance use triggers.', date: '2026-08-06', time: '15:00:00', status: 'Completed' },
      { title: 'Relapse Prevention Planning', summary: 'Created a comprehensive emergency coping card and identified safe contacts.', date: '2026-08-08', time: '10:30:00', status: 'Completed' },
      { title: 'Harm Reduction Strategies', summary: 'Discussed gradual step-down goals and built craving management techniques.', date: '2026-08-10', time: '11:00:00', status: 'Completed' },
      { title: 'Weekly Accountability Check', summary: 'Checked urinalysis and discussed weekly sobriety challenges and triumphs.', date: '2026-08-13', time: '13:30:00', status: 'Scheduled' },
      { title: 'Support Network Review', summary: 'Planning group meeting attendance and community integration efforts.', date: '2026-08-15', time: '14:30:00', status: 'Pending' }
    ]
  },
  {
    name: 'Dr. Maya Patel',
    specialization: 'Mindfulness Therapy',
    description: 'Promotes psychological flexibility and stress reduction through Mindfulness-Based Cognitive Therapy (MBCT) and acceptance practices.',
    profile_image: '/images/maya_patel.png',
    experience_years: 11,
    location: 'Ahmedabad',
    availability_status: 'Available Today',
    appointments: [
      { title: 'MBSR Intake Session', summary: 'Evaluated somatic stress symptoms and introduced core mindfulness postures.', date: '2026-08-09', time: '08:30:00', status: 'Completed' },
      { title: 'Guided Body Scan Session', summary: 'Practiced deep somatic focus meditation to reduce physical tension.', date: '2026-08-10', time: '12:00:00', status: 'Completed' },
      { title: 'Mindful Communication Session', summary: 'Practiced active listening and speaking with presence and intention.', date: '2026-08-12', time: '15:30:00', status: 'Completed' },
      { title: 'Stress Reduction Progress', summary: 'Checked practice journal and refined home meditation schedule.', date: '2026-08-13', time: '16:30:00', status: 'Scheduled' },
      { title: 'Acceptance Practice', summary: 'Session focused on radically accepting and coexisting with uncomfortable feelings.', date: '2026-08-16', time: '11:30:00', status: 'Cancelled' }
    ]
  },
  {
    name: 'Dr. James Taylor',
    specialization: 'Couples Counseling',
    description: 'Expert in Gottman Method couples therapy, helping partners build intimacy, resolve conflict, and improve communication patterns.',
    profile_image: '/images/james_taylor.png',
    experience_years: 18,
    location: 'Kolkata',
    availability_status: 'Available Tomorrow',
    appointments: [
      { title: 'Couples Intake Assessment', summary: 'Met partners to assess shared history, conflicts, and relationship goals.', date: '2026-08-05', time: '16:00:00', status: 'Completed' },
      { title: 'Speaker Listener Drill', summary: 'Coached partners in active listening during intense dispute discussions.', date: '2026-08-07', time: '14:00:00', status: 'Completed' },
      { title: 'Shared Meaning Workshop', summary: 'Discussed life values, career expectations, and building a shared vision.', date: '2026-08-10', time: '11:00:00', status: 'Completed' },
      { title: 'Conflict Management Review', summary: 'Reviewed homework worksheets focusing on softening family disagreements.', date: '2026-08-14', time: '13:00:00', status: 'Scheduled' },
      { title: 'Relationship Check-Up', summary: 'Check-in on intimacy targets and joint goal achievements.', date: '2026-08-16', time: '10:00:00', status: 'Pending' }
    ]
  },
  {
    name: 'Dr. Ananya Rao',
    specialization: 'Depression Therapy',
    description: 'Specializes in mood disorders, behavioral activation, and helping clients build distress tolerance and emotional wellness.',
    profile_image: '/images/ananya_rao.png',
    experience_years: 7,
    location: 'Kochi',
    availability_status: 'Available Today',
    appointments: [
      { title: 'Depression Intake Assessment', summary: 'Assessed severity of depressive symptoms and established safe behavioral targets.', date: '2026-08-09', time: '09:30:00', status: 'Completed' },
      { title: 'Behavioral Activation Setup', summary: 'Selected two daily positive activities to disrupt withdrawal cycle patterns.', date: '2026-08-10', time: '11:00:00', status: 'Completed' },
      { title: 'Activity Tracking Review', summary: 'Reviewed activity logs. Noted minor improvements in energy and motivation levels.', date: '2026-08-11', time: '15:30:00', status: 'Completed' },
      { title: 'Core Believing Reframing', summary: 'Worked on replacing persistent thoughts of hopelessness with functional alternatives.', date: '2026-08-13', time: '12:30:00', status: 'Scheduled' },
      { title: 'Mood Monitoring Check', summary: 'Follow-up session to ensure medication adherence and assess mental safety.', date: '2026-08-17', time: '14:00:00', status: 'Cancelled' }
    ]
  },
  {
    name: 'Dr. Charles King',
    specialization: 'Career Counseling',
    description: 'Helps professionals navigate work stress, burn-out, career transitions, and align their vocational path with core life values.',
    profile_image: '/images/charles_king.png',
    experience_years: 13,
    location: 'Bangalore',
    availability_status: 'Available Today',
    appointments: [
      { title: 'Career Values Mapping', summary: 'Identified core values, interests, and sources of chronic burnout in current job.', date: '2026-08-08', time: '13:00:00', status: 'Completed' },
      { title: 'Vocational Skill Audit', summary: 'Listed transferable skills and brainstormed viable transition paths.', date: '2026-08-09', time: '15:00:00', status: 'Completed' },
      { title: 'Resume Re-Branding Workshop', summary: 'Re-wrote professional summaries to align with target industry roles.', date: '2026-08-11', time: '10:30:00', status: 'Completed' },
      { title: 'Interview Prep Simulation', summary: 'Conducted simulated behavioral interview and refined confidence messaging.', date: '2026-08-13', time: '15:00:00', status: 'Scheduled' },
      { title: 'Negotiation Strategy Prep', summary: 'Preparing compensation package responses and finalizing transition goals.', date: '2026-08-15', time: '11:00:00', status: 'Pending' }
    ]
  }
];

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getSingleConnection(retries = 5, delayMs = 2000) {
  for (let i = 1; i <= retries; i++) {
    try {
      const conn = await mysql.createConnection(dbConfig);
      return conn;
    } catch (err) {
      if (err.code === 'ER_TOO_MANY_USER_CONNECTIONS') {
        console.warn(`[Retry ${i}/${retries}] Connection limit reached. Waiting ${delayMs}ms...`);
        if (i === retries) {
          throw new Error('FreeDB database has reached its max user connections limit. Please temporarily close MySQL Workbench or stop the running server to proceed.');
        }
        await delay(delayMs);
      } else {
        throw err;
      }
    }
  }
}

async function seed() {
  let conn;
  try {
    console.log('Starting Resilient Database Seeding...');
    conn = await getSingleConnection();
    console.log('Connected to FreeDB database successfully.');

    // Clear old data safely
    await conn.query('SET FOREIGN_KEY_CHECKS = 0');
    await conn.query('TRUNCATE TABLE appointments');
    await conn.query('TRUNCATE TABLE therapists');
    await conn.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('Old tables cleared successfully.');

    // Insert sample data
    for (const item of sampleData) {
      const [result] = await conn.execute(
        'INSERT INTO therapists (therapist_name, specialization, description, profile_image, experience_years, location, availability_status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [item.name, item.specialization, item.description, item.profile_image, item.experience_years, item.location, item.availability_status]
      );
      const therapistId = result.insertId;
      console.log(`Inserted Therapist: ${item.name} with ID: ${therapistId}`);

      for (const appt of item.appointments) {
        await conn.execute(
          'INSERT INTO appointments (therapist_id, appointment_title, summary, appointment_date, appointment_time, status) VALUES (?, ?, ?, ?, ?, ?)',
          [therapistId, appt.title, appt.summary, appt.date, appt.time, appt.status]
        );
        console.log(`  - Inserted Appointment: "${appt.title}" (${appt.status})`);
      }
    }

    console.log('\n==================================================');
    console.log('DATABASE SEEDING COMPLETED SUCCESSFULY!');
    console.log('==================================================');
    await conn.end();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error.message);
    if (conn) {
      try { await conn.end(); } catch (e) {}
    }
    process.exit(1);
  }
}

seed();
