'use strict';

require('dotenv').config();

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { chat, extractLeadData } = require('./src/chatbot');
const { saveLead, getAllLeads } = require('./src/leads');

const app = express();
app.use(express.json());
app.use(express.static('public'));

/**
 * In-memory conversation store: sessionId → message history array.
 * For production, replace with Redis or a database.
 */
const sessions = new Map();

function getSession(sessionId) {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, []);
  }
  return sessions.get(sessionId);
}

/**
 * POST /chat
 * Body: { sessionId?: string, message: string }
 * Returns: { sessionId, reply }
 */
app.post('/chat', async (req, res) => {
  const { message } = req.body;
  if (!message || typeof message !== 'string' || message.trim() === '') {
    return res.status(400).json({ error: 'message is required' });
  }

  const sessionId = req.body.sessionId || uuidv4();
  const history = getSession(sessionId);

  let rawReply;
  try {
    rawReply = await chat(history, message.trim());
  } catch (err) {
    console.error('OpenAI error:', err.message);
    return res.status(502).json({ error: 'AI service unavailable. Please try again.' });
  }

  const { cleanReply, leadData } = extractLeadData(rawReply);

  // Persist conversation turn
  history.push({ role: 'user', content: message.trim() });
  history.push({ role: 'assistant', content: cleanReply });

  // Persist lead if extracted
  if (leadData && Object.keys(leadData).length > 0) {
    saveLead(sessionId, leadData);
  }

  return res.json({ sessionId, reply: cleanReply });
});

/**
 * DELETE /chat/:sessionId
 * Clears the conversation history for the given session.
 */
app.delete('/chat/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  sessions.delete(sessionId);
  return res.json({ success: true });
});

/**
 * GET /leads
 * Returns all captured leads (admin endpoint).
 * Protect with an API key in production.
 */
app.get('/leads', (req, res) => {
  const apiKey = req.headers['x-api-key'];
  if (process.env.ADMIN_API_KEY && apiKey !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  return res.json(getAllLeads());
});

/* Start the HTTP server only when run directly (not when required by tests). */
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Solar Sales Bot running on http://localhost:${PORT}`);
  });
}

module.exports = app; // exported for testing
