const { v4: uuidv4 } = require('uuid');

/**
 * Conversation State Manager
 * Manages multi-turn conversations with state tracking for each user session
 */
class ConversationStateManager {
  constructor() {
    this.sessions = new Map(); // sessionId -> session data
    this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
  }

  /**
   * Create a new conversation session
   */
  createSession(language = 'hindi') {
    const sessionId = uuidv4();
    const session = {
      sessionId,
      language,
      stage: 'HOOK',
      startTime: Date.now(),
      lastActivity: Date.now(),
      conversationHistory: [],
      userData: {
        monthlyBill: null,
        houseType: null,
        roofSpace: null,
        city: null,
        name: null,
        phone: null,
        interested: null
      },
      qualificationAnswers: [],
      currentQuestion: null,
      objectionCount: 0,
      closeAttempts: 0
    };

    this.sessions.set(sessionId, session);
    this.scheduleCleanup(sessionId);

    return session;
  }

  /**
   * Get session by ID
   */
  getSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActivity = Date.now();
    }
    return session;
  }

  /**
   * Update session state
   */
  updateSession(sessionId, updates) {
    const session = this.getSession(sessionId);
    if (session) {
      Object.assign(session, updates);
      session.lastActivity = Date.now();
      return session;
    }
    return null;
  }

  /**
   * Add message to conversation history
   */
  addMessage(sessionId, role, content) {
    const session = this.getSession(sessionId);
    if (session) {
      session.conversationHistory.push({
        role,
        content,
        timestamp: Date.now()
      });
      session.lastActivity = Date.now();
    }
  }

  /**
   * Update user data
   */
  updateUserData(sessionId, data) {
    const session = this.getSession(sessionId);
    if (session) {
      Object.assign(session.userData, data);
      session.lastActivity = Date.now();
    }
  }

  /**
   * Move to next stage in sales funnel
   */
  advanceStage(sessionId, newStage) {
    const session = this.getSession(sessionId);
    if (session) {
      session.stage = newStage;
      session.lastActivity = Date.now();
      return true;
    }
    return false;
  }

  /**
   * Check if user is qualified
   */
  isQualified(sessionId) {
    const session = this.getSession(sessionId);
    if (!session) return false;

    const { userData } = session;
    return (
      userData.monthlyBill !== null &&
      userData.houseType !== null &&
      userData.city !== null
    );
  }

  /**
   * Check if lead data is complete
   */
  isLeadComplete(sessionId) {
    const session = this.getSession(sessionId);
    if (!session) return false;

    const { userData } = session;
    return (
      userData.name !== null &&
      userData.phone !== null &&
      userData.city !== null &&
      userData.monthlyBill !== null &&
      userData.houseType !== null &&
      userData.interested !== null
    );
  }

  /**
   * Delete session
   */
  deleteSession(sessionId) {
    this.sessions.delete(sessionId);
  }

  /**
   * Schedule session cleanup after timeout
   */
  scheduleCleanup(sessionId) {
    setTimeout(() => {
      const session = this.sessions.get(sessionId);
      if (session && Date.now() - session.lastActivity > this.sessionTimeout) {
        this.deleteSession(sessionId);
      }
    }, this.sessionTimeout);
  }

  /**
   * Get all active sessions count
   */
  getActiveSessionCount() {
    return this.sessions.size;
  }

  /**
   * Export session data for lead capture
   */
  exportLeadData(sessionId) {
    const session = this.getSession(sessionId);
    if (!session) return null;

    return {
      sessionId: session.sessionId,
      timestamp: new Date().toISOString(),
      language: session.language,
      userData: session.userData,
      conversationHistory: session.conversationHistory,
      finalStage: session.stage,
      qualified: this.isQualified(sessionId),
      complete: this.isLeadComplete(sessionId)
    };
  }
}

module.exports = ConversationStateManager;
