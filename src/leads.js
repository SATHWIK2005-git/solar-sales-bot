'use strict';

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data', 'leads.json');

/** Ensure data directory and file exist. */
function ensureDataFile() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf8');
  }
}

/**
 * Load all leads from disk.
 * @returns {Array<object>}
 */
function loadLeads() {
  ensureDataFile();
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return [];
  }
}

/**
 * Save a new lead (or update an existing one by sessionId).
 * @param {string} sessionId
 * @param {object} leadData
 */
function saveLead(sessionId, leadData) {
  const leads = loadLeads();
  const existing = leads.findIndex((l) => l.sessionId === sessionId);
  const record = {
    sessionId,
    ...leadData,
    updatedAt: new Date().toISOString(),
  };
  if (existing >= 0) {
    leads[existing] = { ...leads[existing], ...record };
  } else {
    record.createdAt = record.updatedAt;
    leads.push(record);
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(leads, null, 2), 'utf8');
  return record;
}

/**
 * Return all captured leads.
 * @returns {Array<object>}
 */
function getAllLeads() {
  return loadLeads();
}

module.exports = { saveLead, getAllLeads };
