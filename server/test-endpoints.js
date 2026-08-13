/**
 * Automated test script to verify all 14 specified test cases.
 * Run this while the server is active on PORT 5000.
 */

const BASE_URL = 'http://localhost:5000/api';

async function testRunner() {
  console.log('==================================================');
  console.log('STARTING BACKEND API INTEGRATION TESTS');
  console.log('==================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${message}`);
      failed++;
    }
  }

  async function apiCall(endpoint, method = 'GET', body = null) {
    const url = `${BASE_URL}${endpoint}`;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    if (body) {
      options.body = JSON.stringify(body);
    }
    const res = await fetch(url, options);
    const data = await res.json().catch(() => ({}));
    return { status: res.status, data };
  }

  try {
    let therapistId1 = null;
    let therapistId2 = null;
    let appointmentId = null;

    // Test Case 11: Invalid therapist creation (validation error)
    console.log('Test 1: Invalid therapist creation (empty name)');
    const t1 = await apiCall('/therapists', 'POST', { therapist_name: '' });
    assert(t1.status === 400 && t1.data.success === false, 'Should reject empty therapist_name with 400 Bad Request');

    // Test Case 1: Create therapist (Valid)
    console.log('\nTest 2: Create therapist (Valid)');
    const t2 = await apiCall('/therapists', 'POST', { therapist_name: 'Dr. John Watson', specialization: 'Family Therapy' });
    assert(t2.status === 201 && t2.data.success === true && t2.data.message === 'Therapist created successfully', 'Should create therapist with 201 Created');
    if (t2.data.data && t2.data.data.therapist_id) {
      therapistId1 = t2.data.data.therapist_id;
    }

    // Create a second therapist for further testing
    const t2_temp = await apiCall('/therapists', 'POST', { therapist_name: 'Dr. Sarah Smith', specialization: 'CBT' });
    if (t2_temp.data.data && t2_temp.data.data.therapist_id) {
      therapistId2 = t2_temp.data.data.therapist_id;
    }

    if (!therapistId1) {
      throw new Error('Could not obtain therapist ID from creation response. Aborting test suite.');
    }

    // Test Case 2: Get therapist list
    console.log('\nTest 3: Get therapist list');
    const t3 = await apiCall('/therapists');
    assert(t3.status === 200 && t3.data.success === true && Array.isArray(t3.data.data) && t3.data.data.length > 0, 'Should return lists of therapists with 200 OK');

    // Test Case 3: Get therapist by ID
    console.log('\nTest 4: Get therapist by ID');
    const t4 = await apiCall(`/therapists/${therapistId1}`);
    assert(t4.status === 200 && t4.data.success === true && t4.data.data.therapist_name === 'Dr. John Watson', 'Should return therapist details with 200 OK');

    // Test Case 13: Non-existing therapist lookup
    console.log('\nTest 5: Non-existing therapist lookup');
    const t5 = await apiCall('/therapists/999999');
    assert(t5.status === 404 && t5.data.success === false, 'Should return 404 for non-existing therapist lookup');

    // Test Case 4: Update therapist name
    console.log('\nTest 6: Update therapist');
    const t6 = await apiCall(`/therapists/${therapistId1}`, 'PUT', { therapist_name: 'Dr. John H. Watson', specialization: 'Family Therapy' });
    assert(t6.status === 200 && t6.data.success === true && t6.data.data.therapist_name === 'Dr. John H. Watson', 'Should update therapist name with 200 OK');

    // Test Case 12: Invalid appointment creation (missing fields)
    console.log('\nTest 7: Invalid appointment creation (missing fields)');
    const a1 = await apiCall('/appointments', 'POST', { therapist_id: therapistId1, appointment_title: '' });
    assert(a1.status === 400 && a1.data.success === false, 'Should reject empty fields with 400 Bad Request');

    // Test Case 12b: Invalid appointment creation (non-existing therapist)
    console.log('\nTest 8: Invalid appointment creation (non-existing therapist)');
    const a2 = await apiCall('/appointments', 'POST', {
      therapist_id: 999999,
      appointment_title: 'Session 1: Introduction',
      summary: 'Client showed improvement in communication and active listening.',
      appointment_date: '2026-08-12',
      appointment_time: '10:30'
    });
    assert(a2.status === 404 && a2.data.success === false, 'Should reject invalid therapist link with 404 Not Found');

    // Test Case 6: Create appointment (Valid)
    console.log('\nTest 9: Create appointment (Valid)');
    const a3 = await apiCall('/appointments', 'POST', {
      therapist_id: therapistId1,
      appointment_title: 'Session 1: Introduction',
      summary: 'Client showed improvement in communication and active listening.',
      appointment_date: '2026-08-12',
      appointment_time: '10:30'
    });
    assert(a3.status === 201 && a3.data.success === true && a3.data.data.appointment_title === 'Session 1: Introduction', 'Should create appointment with 201 Created');
    if (a3.data.data && a3.data.data.appointment_id) {
      appointmentId = a3.data.data.appointment_id;
    }

    if (!appointmentId) {
      throw new Error('Could not obtain appointment ID. Aborting.');
    }

    // Test Case 7: Get appointment list by therapist
    console.log('\nTest 10: Get appointment list by therapist');
    const a4 = await apiCall(`/appointments/therapist/${therapistId1}`);
    assert(a4.status === 200 && a4.data.success === true && Array.isArray(a4.data.data) && a4.data.data.length > 0, 'Should retrieve list of appointments for therapist');

    // Test Case 8: Get appointment by ID
    console.log('\nTest 11: Get appointment by ID');
    const a5 = await apiCall(`/appointments/${appointmentId}`);
    assert(a5.status === 200 && a5.data.success === true && a5.data.data.appointment_title === 'Session 1: Introduction', 'Should return appointment details');

    // Test Case 14: Non-existing appointment lookup
    console.log('\nTest 12: Non-existing appointment lookup');
    const a6 = await apiCall('/appointments/999999');
    assert(a6.status === 404 && a6.data.success === false, 'Should return 404 for invalid appointment lookup');

    // Test Case 9: Update appointment
    console.log('\nTest 13: Update appointment');
    const a7 = await apiCall(`/appointments/${appointmentId}`, 'PUT', {
      appointment_title: 'Session 1: Updated Introduction',
      summary: 'Revised: client shows excellent response to cognitive restructuring.',
      appointment_date: '2026-08-12',
      appointment_time: '10:30'
    });
    assert(a7.status === 200 && a7.data.success === true && a7.data.data.appointment_title === 'Session 1: Updated Introduction', 'Should update appointment details');

    // Test: AI summary route check (Valid therapist)
    console.log('\nTest 14: AI Summary generation placeholder (valid)');
    const ai1 = await apiCall(`/generate-summary/${therapistId1}`, 'POST');
    // Note: since OpenRouter API call actually runs, it will return the status object from aiService.
    assert(ai1.status === 200 && ai1.data.success === true, 'Should generate summary with 200 OK');

    // Test: AI summary route check (Invalid therapist)
    console.log('\nTest 15: AI Summary generation placeholder (invalid therapist)');
    const ai2 = await apiCall('/generate-summary/999999', 'POST');
    assert(ai2.status === 404 && ai2.data.success === false, 'Should return 404 for AI summary request with non-existent therapist');

    // Test Case 10: Delete appointment
    console.log('\nTest 16: Delete appointment');
    const a8 = await apiCall(`/appointments/${appointmentId}`, 'DELETE');
    assert(a8.status === 200 && a8.data.success === true, 'Should delete appointment successfully');

    // Verify appointment is deleted
    const a9 = await apiCall(`/appointments/${appointmentId}`);
    assert(a9.status === 404, 'Deleted appointment should return 404 lookup');

    // Test Case 5: Delete therapist (cascades appointments)
    console.log('\nTest 17: Delete therapist (Cascading tests)');
    // 1. Create a dummy appointment under therapistId2
    const dummyApp = await apiCall('/appointments', 'POST', {
      therapist_id: therapistId2,
      appointment_title: 'Cascade Check Session',
      summary: 'Testing cascading delete rules and validation features.',
      appointment_date: '2026-08-12',
      appointment_time: '11:00'
    });
    const dummyId = dummyApp.data.data.appointment_id;

    // 2. Delete therapistId2
    const t7 = await apiCall(`/therapists/${therapistId2}`, 'DELETE');
    assert(t7.status === 200 && t7.data.success === true, 'Should delete therapist successfully');

    // 3. Verify therapistId2 no longer exists
    const t8 = await apiCall(`/therapists/${therapistId2}`);
    assert(t8.status === 404, 'Deleted therapist should return 404 lookup');

    // 4. Verify dummy appointment was cascade-deleted by foreign key constraint
    const a10 = await apiCall(`/appointments/${dummyId}`);
    assert(a10.status === 404, 'Associated appointment should be automatically deleted (cascade)');

    console.log('\n==================================================');
    console.log(`TEST RUN COMPLETED. Passed: ${passed}, Failed: ${failed}`);
    console.log('==================================================');
  } catch (error) {
    console.error('Test run failed due to uncaught error:', error);
  }
}

testRunner();
