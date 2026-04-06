'use strict';

/**
 * Unit tests for solar-sales-bot.
 * Uses Node.js built-in test runner (node --test).
 * Tests chatbot helpers and lead storage without making real API calls.
 */

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

// ─── extractLeadData ─────────────────────────────────────────────────────────
describe('extractLeadData', () => {
  const { extractLeadData } = require('../src/chatbot');

  it('returns cleanReply and null leadData when no marker present', () => {
    const reply = 'नमस्ते! आपका नाम क्या है?';
    const result = extractLeadData(reply);
    assert.equal(result.cleanReply, reply);
    assert.equal(result.leadData, null);
  });

  it('extracts valid JSON lead block and strips it from reply', () => {
    const leadJson = { name: 'Arjun', phone: '9876543210', city: 'Hyderabad', monthlyBill: '3000', ownsHouse: true, interest: 'hot', siteVisitBooked: true };
    const marker = `<!--LEAD_DATA:${JSON.stringify(leadJson)}-->`;
    const reply = `बहुत अच्छा! हम जल्द ही संपर्क करेंगे। ${marker}`;

    const result = extractLeadData(reply);
    assert.equal(result.cleanReply, 'बहुत अच्छा! हम जल्द ही संपर्क करेंगे।');
    assert.deepEqual(result.leadData, leadJson);
  });

  it('returns cleanReply unchanged when JSON in marker is malformed', () => {
    const reply = 'कोई समस्या नहीं। <!--LEAD_DATA:{bad json}-->';
    const result = extractLeadData(reply);
    assert.equal(result.cleanReply, reply);
    assert.equal(result.leadData, null);
  });
});

// ─── leads ────────────────────────────────────────────────────────────────────
describe('leads', () => {
  let tmpDir;

  before(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'solar-test-'));
  });

  after(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('saveLead and getAllLeads round-trip', () => {
    const leadsPath = path.resolve(__dirname, '../src/leads.js');
    delete require.cache[leadsPath];
    const { saveLead, getAllLeads } = require('../src/leads.js');

    const sid = `test-session-${Date.now()}`;
    const lead = { name: 'Test User', phone: '9000000001', city: 'Delhi', monthlyBill: '2500', ownsHouse: true, interest: 'warm', siteVisitBooked: false };

    saveLead(sid, lead);
    const all = getAllLeads();
    const found = all.find((l) => l.sessionId === sid);
    assert.ok(found, 'lead should be saved');
    assert.equal(found.name, 'Test User');
    assert.equal(found.city, 'Delhi');
  });

  it('saveLead updates an existing lead with same sessionId', () => {
    const { saveLead, getAllLeads } = require('../src/leads.js');
    const sid = `test-update-${Date.now()}`;

    saveLead(sid, { name: 'First', phone: '9000000002', city: 'Mumbai', monthlyBill: '1500', ownsHouse: false, interest: 'cold', siteVisitBooked: false });
    saveLead(sid, { interest: 'hot', siteVisitBooked: true });

    const all = getAllLeads();
    const found = all.filter((l) => l.sessionId === sid);
    assert.equal(found.length, 1, 'should not duplicate');
    assert.equal(found[0].interest, 'hot');
    assert.equal(found[0].siteVisitBooked, true);
    assert.equal(found[0].name, 'First'); // original fields preserved
  });
});

// ─── system prompt ────────────────────────────────────────────────────────────
describe('SYSTEM_PROMPT', () => {
  const { SYSTEM_PROMPT } = require('../src/prompt');

  it('contains required sales funnel keywords', () => {
    assert.ok(SYSTEM_PROMPT.includes('Hindi'), 'should mention Hindi language');
    assert.ok(SYSTEM_PROMPT.includes('subsidy') || SYSTEM_PROMPT.includes('Subsidy'), 'should mention subsidy');
    assert.ok(SYSTEM_PROMPT.includes('EMI'), 'should mention EMI option');
    assert.ok(SYSTEM_PROMPT.includes('site visit') || SYSTEM_PROMPT.includes('Site Visit'), 'should mention site visit');
    assert.ok(SYSTEM_PROMPT.includes('LEAD_DATA'), 'should include LEAD_DATA extraction marker');
  });

  it('mentions all required lead fields', () => {
    assert.ok(SYSTEM_PROMPT.includes('"name"'), 'should include name field');
    assert.ok(SYSTEM_PROMPT.includes('"phone"'), 'should include phone field');
    assert.ok(SYSTEM_PROMPT.includes('"city"'), 'should include city field');
    assert.ok(SYSTEM_PROMPT.includes('"monthlyBill"'), 'should include monthlyBill field');
  });
});

// ─── server routes ────────────────────────────────────────────────────────────
describe('server', () => {
  it('rejects /chat POST with missing message', async () => {
    // We import app and use node's built-in http to test without starting server
    process.env.OPENAI_API_KEY = 'test-key-placeholder';

    // Dynamically require app but override openai to prevent real calls
    const openaiPath = require.resolve('openai');
    const origOpenAI = require.cache[openaiPath];
    // Provide a stub so server.js can load without error
    require.cache[openaiPath] = {
      id: openaiPath,
      filename: openaiPath,
      loaded: true,
      exports: class OpenAI {
        constructor() { this.chat = { completions: { create: async () => ({ choices: [{ message: { content: 'test' } }] }) } }; }
      },
    };

    // Clear server cache to reload with stub
    const serverPath = path.resolve(__dirname, '../server.js');
    delete require.cache[serverPath];
    const app = require('../server.js');

    const http = require('node:http');
    const server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const { port } = server.address();

    const result = await new Promise((resolve, reject) => {
      const body = JSON.stringify({});
      const req = http.request({ host: '127.0.0.1', port, path: '/chat', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } }, (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(data) }));
      });
      req.on('error', reject);
      req.write(body);
      req.end();
    });

    server.close();
    // Restore openai cache entry
    if (origOpenAI) require.cache[openaiPath] = origOpenAI;
    else delete require.cache[openaiPath];

    assert.equal(result.status, 400);
    assert.ok(result.body.error);
  });
});
