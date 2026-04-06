const fs = require('fs').promises;
const path = require('path');
const config = require('../config/config');

/**
 * Lead Management System
 * Handles storing and retrieving lead data
 */
class LeadManager {
  constructor() {
    this.storagePath = config.storage.leadStoragePath;
    this.ensureStorageDirectory();
  }

  /**
   * Ensure storage directory exists
   */
  async ensureStorageDirectory() {
    const dir = path.dirname(this.storagePath);
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (error) {
      console.error('Error creating storage directory:', error);
    }
  }

  /**
   * Save a new lead
   */
  async saveLead(leadData) {
    try {
      await this.ensureStorageDirectory();

      // Read existing leads
      let leads = [];
      try {
        const data = await fs.readFile(this.storagePath, 'utf8');
        leads = JSON.parse(data);
      } catch (error) {
        // File doesn't exist yet, start with empty array
        leads = [];
      }

      // Add new lead with ID
      const lead = {
        id: this.generateLeadId(),
        ...leadData,
        savedAt: new Date().toISOString()
      };

      leads.push(lead);

      // Write back to file
      await fs.writeFile(this.storagePath, JSON.stringify(leads, null, 2));

      console.log(`✓ Lead saved: ${lead.id} - ${leadData.userData?.name || 'Unknown'}`);

      return lead;
    } catch (error) {
      console.error('Error saving lead:', error);
      throw new Error('Failed to save lead');
    }
  }

  /**
   * Get all leads
   */
  async getAllLeads() {
    try {
      const data = await fs.readFile(this.storagePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      // File doesn't exist
      return [];
    }
  }

  /**
   * Get leads by filter
   */
  async getLeadsByFilter(filter = {}) {
    const allLeads = await this.getAllLeads();

    return allLeads.filter(lead => {
      if (filter.interested !== undefined && lead.userData?.interested !== filter.interested) {
        return false;
      }
      if (filter.city && lead.userData?.city !== filter.city) {
        return false;
      }
      if (filter.qualified !== undefined && lead.qualified !== filter.qualified) {
        return false;
      }
      return true;
    });
  }

  /**
   * Get lead statistics
   */
  async getLeadStats() {
    const allLeads = await this.getAllLeads();

    const stats = {
      total: allLeads.length,
      interested: 0,
      notInterested: 0,
      qualified: 0,
      complete: 0,
      avgBill: 0,
      cities: {},
      houseTypes: { own: 0, rent: 0 }
    };

    let totalBill = 0;
    let billCount = 0;

    allLeads.forEach(lead => {
      const userData = lead.userData || {};

      // Interest
      if (userData.interested === 'yes' || userData.interested === 'maybe') {
        stats.interested++;
      } else if (userData.interested === 'no') {
        stats.notInterested++;
      }

      // Qualified
      if (lead.qualified) {
        stats.qualified++;
      }

      // Complete
      if (lead.complete) {
        stats.complete++;
      }

      // Bills
      if (userData.monthlyBill) {
        totalBill += userData.monthlyBill;
        billCount++;
      }

      // Cities
      if (userData.city) {
        stats.cities[userData.city] = (stats.cities[userData.city] || 0) + 1;
      }

      // House types
      if (userData.houseType === 'own') {
        stats.houseTypes.own++;
      } else if (userData.houseType === 'rent') {
        stats.houseTypes.rent++;
      }
    });

    if (billCount > 0) {
      stats.avgBill = Math.round(totalBill / billCount);
    }

    return stats;
  }

  /**
   * Generate unique lead ID
   */
  generateLeadId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `LEAD-${timestamp}-${random}`.toUpperCase();
  }

  /**
   * Export leads to CSV format
   */
  async exportToCSV() {
    const leads = await this.getAllLeads();

    const headers = ['ID', 'Name', 'Phone', 'City', 'Monthly Bill', 'House Type', 'Interested', 'Qualified', 'Complete', 'Timestamp'];
    const rows = leads.map(lead => {
      const userData = lead.userData || {};
      return [
        lead.id,
        userData.name || '',
        userData.phone || '',
        userData.city || '',
        userData.monthlyBill || '',
        userData.houseType || '',
        userData.interested || '',
        lead.qualified ? 'Yes' : 'No',
        lead.complete ? 'Yes' : 'No',
        lead.timestamp
      ];
    });

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    return csv;
  }
}

module.exports = LeadManager;
