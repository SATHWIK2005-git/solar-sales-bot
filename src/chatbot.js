'use strict';

const OpenAI = require('openai');
const { SYSTEM_PROMPT } = require('./prompt');

/** Lazily-initialised OpenAI client (avoids throwing at require-time when key is absent). */
let _openai = null;
function getOpenAI() {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

/**
 * Send a user message within an existing conversation and get the assistant reply.
 *
 * @param {Array<{role: string, content: string}>} history - Prior messages (not including new one)
 * @param {string} userMessage - The latest user message
 * @returns {Promise<string>} - Raw assistant reply text
 */
async function chat(history, userMessage) {
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history,
    { role: 'user', content: userMessage },
  ];

  const completion = await getOpenAI().chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    messages,
    temperature: 0.7,
    max_tokens: 512,
  });

  return completion.choices[0].message.content || '';
}

/**
 * Extract lead data embedded in the assistant reply (if present).
 * The system prompt instructs the model to embed data as:
 *   <!--LEAD_DATA:{...}-->
 *
 * @param {string} reply
 * @returns {{ cleanReply: string, leadData: object|null }}
 */
function extractLeadData(reply) {
  const match = reply.match(/<!--LEAD_DATA:([\s\S]*?)-->/);
  if (!match) {
    return { cleanReply: reply, leadData: null };
  }
  try {
    const leadData = JSON.parse(match[1]);
    const cleanReply = reply.replace(/<!--LEAD_DATA:[\s\S]*?-->/, '').trim();
    return { cleanReply, leadData };
  } catch {
    return { cleanReply: reply, leadData: null };
  }
}

module.exports = { chat, extractLeadData };
