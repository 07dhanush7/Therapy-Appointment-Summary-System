const BASE_URL = 'http://localhost:5000/api';

async function testValidation() {
  console.log('==================================================');
  console.log('STARTING BACKEND VALIDATION & ACTIVITY TESTS');
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
    // 1. Therapist duplicate name check
    console.log('Test 1: Duplicate Therapist Name Validation');
    const uName = 'Unique Therapist ' + Date.now();
    
    // Create first
    const tc1 = await apiCall('/therapists', 'POST', { therapist_name: uName, specialization: 'CBT' });
    assert(tc1.status === 201, 'Should create therapist with unique name');

    // Create duplicate
    const tc2 = await apiCall('/therapists', 'POST', { therapist_name: uName, specialization: 'Trauma Recovery' });
    assert(tc2.status === 400 && tc2.data.success === false && tc2.data.message === 'Validation error', 'Should reject duplicate therapist name with 400 Validation error');

    // 2. Therapist whitespace-only check
    console.log('\nTest 2: Whitespace Therapist Name & Specialization Validation');
    const tc3 = await apiCall('/therapists', 'POST', { therapist_name: '   ', specialization: 'CBT' });
    assert(tc3.status === 400, 'Should reject whitespace therapist name');
    
    const tc4 = await apiCall('/therapists', 'POST', { therapist_name: 'Dr. Jane Watson', specialization: '   ' });
    assert(tc4.status === 400, 'Should reject whitespace specialization');

    // 3. Appointment min length check
    console.log('\nTest 3: Appointment Title & Summary Min Length Validation');
    const tid = tc1.data.data.therapist_id;

    // Short title (< 3 chars)
    const ac1 = await apiCall('/appointments', 'POST', {
      therapist_id: tid,
      appointment_title: 'AB',
      summary: 'This summary is definitely long enough to pass validation rules.',
      appointment_date: '2026-08-12',
      appointment_time: '12:00'
    });
    assert(ac1.status === 400, 'Should reject short appointment title');

    // Short summary (< 20 chars)
    const ac2 = await apiCall('/appointments', 'POST', {
      therapist_id: tid,
      appointment_title: 'Cognitive Therapy',
      summary: 'Too short summary.',
      appointment_date: '2026-08-12',
      appointment_time: '12:00'
    });
    assert(ac2.status === 400, 'Should reject short appointment summary');

    // 4. Activity log check
    console.log('\nTest 4: Activity Log API Fetch');
    const actRes = await apiCall('/activities');
    assert(actRes.status === 200 && Array.isArray(actRes.data.data), 'Should fetch activity logs successfully');
    assert(actRes.data.data.length > 0, 'Activity log list should not be empty');
    assert(actRes.data.data[0].activity_message !== undefined, 'Activity log should contain message field');

    console.log('\n==================================================');
    console.log(`VALIDATION TESTS COMPLETED. Passed: ${passed}, Failed: ${failed}`);
    console.log('==================================================');
  } catch (error) {
    console.error('Validation test run failed due to error:', error);
  }
}

testValidation();
