const db = require('../config/db');
const { AppError } = require('../middleware/errorHandler');

/**
 * AI Service
 * 
 * Communicates with OpenRouter API to consolidate therapist session summaries.
 */

async function generateSummary(therapistId) {
  // 1. Get therapist by ID.
  const therapists = await db.query('SELECT * FROM therapists WHERE therapist_id = ?', [therapistId]);
  if (therapists.length === 0) {
    throw new AppError(`Therapist with ID ${therapistId} not found`, 404);
  }

  // 2. Retrieve all appointments.
  const appointments = await db.query(
    'SELECT summary FROM appointments WHERE therapist_id = ? ORDER BY appointment_id ASC',
    [therapistId]
  );
  if (appointments.length === 0) {
    throw new AppError('Therapist has no appointments', 400);
  }

  // 3. Merge summaries.
  const mergedSummaries = appointments.map((appt, idx) => `Summary ${idx + 1}:\n${appt.summary}`).join('\n\n');

  // 4. Create prompt.
  const generatedPrompt = `You are a professional clinical assistant.

Based on the following therapy appointment summaries, create a concise overall summary describing progress, recurring themes, observations, and outcomes.

Appointment Summaries:

${mergedSummaries}

Generate one consolidated summary.`;

  // 5. Call OpenRouter API.
  const openRouterApiKey = process.env.OPENROUTER_API_KEY;
  if (!openRouterApiKey || openRouterApiKey === 'YOUR_OPENROUTER_API_KEY') {
    console.error('OPENROUTER_API_KEY is not configured in environment variables.');
    throw new AppError('AI service is currently misconfigured. Missing OpenRouter API Key.', 500);
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: generatedPrompt
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.error(`OpenRouter API error response: Status ${response.status} - ${errorText}`);
      throw new AppError('OpenRouter API request failed', 500);
    }

    const data = await response.json();
    const generatedText = data.choices?.[0]?.message?.content;

    if (!generatedText) {
      console.error('OpenRouter returned empty choices structure:', JSON.stringify(data));
      throw new AppError('AI service returned an empty summary', 500);
    }

    return {
      success: true,
      therapistId: parseInt(therapistId),
      summary: generatedText.trim()
    };
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    console.error('Unhandled error during OpenRouter API call:', err);
    throw new AppError('Failed to communicate with OpenRouter AI service', 500);
  }
}

module.exports = {
  generateSummary
};
