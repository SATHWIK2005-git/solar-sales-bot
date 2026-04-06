const config = require('../config/config');

/**
 * Sales Funnel Flow Controller
 * Implements the structured sales funnel: Hook -> Qualification -> Value Pitch -> Objection Handling -> Closing -> Lead Capture
 */
class SalesFunnelController {
  constructor(stateManager) {
    this.stateManager = stateManager;
    this.qualificationQuestions = [
      { key: 'monthlyBill', field: 'monthlyBill', stage: 'QUALIFICATION_BILL' },
      { key: 'houseType', field: 'houseType', stage: 'QUALIFICATION_HOUSE' },
      { key: 'roofSpace', field: 'roofSpace', stage: 'QUALIFICATION_ROOF' },
      { key: 'city', field: 'city', stage: 'QUALIFICATION_CITY' }
    ];
  }

  /**
   * Determine the next stage and action based on current state
   */
  getNextAction(session, userMessage) {
    const { stage, userData } = session;

    switch (stage) {
      case 'HOOK':
        return this.handleHookStage(session, userMessage);

      case 'QUALIFICATION_BILL':
      case 'QUALIFICATION_HOUSE':
      case 'QUALIFICATION_ROOF':
      case 'QUALIFICATION_CITY':
        return this.handleQualificationStage(session, userMessage);

      case 'VALUE_PITCH':
        return this.handleValuePitchStage(session, userMessage);

      case 'OBJECTION_HANDLING':
        return this.handleObjectionStage(session, userMessage);

      case 'CLOSING':
        return this.handleClosingStage(session, userMessage);

      case 'LEAD_CAPTURE_NAME':
      case 'LEAD_CAPTURE_PHONE':
        return this.handleLeadCaptureStage(session, userMessage);

      case 'COMPLETED':
        return { action: 'COMPLETED', message: 'Thank you!' };

      default:
        return this.handleHookStage(session, userMessage);
    }
  }

  /**
   * Handle HOOK stage - grab attention about electricity bill
   */
  handleHookStage(session, userMessage) {
    // First interaction or user responding to hook
    if (session.conversationHistory.length <= 1) {
      this.stateManager.advanceStage(session.sessionId, 'QUALIFICATION_BILL');
      return {
        action: 'HOOK',
        nextStage: 'QUALIFICATION_BILL',
        intent: 'start_qualification',
        context: {
          painPoint: 'high electricity bill',
          wasteRange: config.domain.billPainRange
        }
      };
    }

    // User responded, move to qualification
    this.stateManager.advanceStage(session.sessionId, 'QUALIFICATION_BILL');
    return {
      action: 'START_QUALIFICATION',
      nextStage: 'QUALIFICATION_BILL',
      intent: 'ask_monthly_bill'
    };
  }

  /**
   * Handle QUALIFICATION stages - ask questions one by one
   */
  handleQualificationStage(session, userMessage) {
    const { stage } = session;

    // Extract answer from user message
    const extractedData = this.extractUserData(stage, userMessage);

    if (extractedData) {
      this.stateManager.updateUserData(session.sessionId, extractedData);
    }

    // Find current question index
    const currentIndex = this.qualificationQuestions.findIndex(q => q.stage === stage);

    // Check if there's a next question
    if (currentIndex < this.qualificationQuestions.length - 1) {
      const nextQuestion = this.qualificationQuestions[currentIndex + 1];
      this.stateManager.advanceStage(session.sessionId, nextQuestion.stage);

      return {
        action: 'ASK_NEXT_QUESTION',
        nextStage: nextQuestion.stage,
        intent: `ask_${nextQuestion.key}`,
        extractedData
      };
    }

    // All qualification questions answered, move to value pitch
    this.stateManager.advanceStage(session.sessionId, 'VALUE_PITCH');
    return {
      action: 'QUALIFICATION_COMPLETE',
      nextStage: 'VALUE_PITCH',
      intent: 'present_value_pitch',
      userData: session.userData
    };
  }

  /**
   * Handle VALUE_PITCH stage - explain benefits
   */
  handleValuePitchStage(session, userMessage) {
    // Detect if user has objections
    const hasObjection = this.detectObjection(userMessage);

    if (hasObjection) {
      this.stateManager.advanceStage(session.sessionId, 'OBJECTION_HANDLING');
      return {
        action: 'HANDLE_OBJECTION',
        nextStage: 'OBJECTION_HANDLING',
        intent: 'address_objection',
        objection: this.classifyObjection(userMessage)
      };
    }

    // Move to closing
    this.stateManager.advanceStage(session.sessionId, 'CLOSING');
    return {
      action: 'MOVE_TO_CLOSING',
      nextStage: 'CLOSING',
      intent: 'attempt_close'
    };
  }

  /**
   * Handle OBJECTION_HANDLING stage
   */
  handleObjectionStage(session, userMessage) {
    session.objectionCount = (session.objectionCount || 0) + 1;

    const objectionType = this.classifyObjection(userMessage);

    // After handling objection, try to close again
    if (session.objectionCount >= 2) {
      this.stateManager.advanceStage(session.sessionId, 'CLOSING');
      return {
        action: 'FORCE_CLOSE',
        nextStage: 'CLOSING',
        intent: 'final_close_attempt',
        objectionType
      };
    }

    // Stay in objection handling
    return {
      action: 'HANDLE_OBJECTION',
      nextStage: 'OBJECTION_HANDLING',
      intent: 'address_objection',
      objectionType,
      objectionCount: session.objectionCount
    };
  }

  /**
   * Handle CLOSING stage - ask for site visit
   */
  handleClosingStage(session, userMessage) {
    const interest = this.detectInterest(userMessage);

    session.closeAttempts = (session.closeAttempts || 0) + 1;

    if (interest === 'yes' || interest === 'maybe') {
      this.stateManager.updateUserData(session.sessionId, { interested: interest });
      this.stateManager.advanceStage(session.sessionId, 'LEAD_CAPTURE_NAME');

      return {
        action: 'START_LEAD_CAPTURE',
        nextStage: 'LEAD_CAPTURE_NAME',
        intent: 'capture_name',
        interest
      };
    }

    if (interest === 'no' && session.closeAttempts >= 2) {
      // Still capture lead even if not interested
      this.stateManager.updateUserData(session.sessionId, { interested: 'no' });
      this.stateManager.advanceStage(session.sessionId, 'LEAD_CAPTURE_NAME');

      return {
        action: 'CAPTURE_LEAD_ANYWAY',
        nextStage: 'LEAD_CAPTURE_NAME',
        intent: 'capture_name_for_followup',
        interest: 'no'
      };
    }

    // Try closing again
    return {
      action: 'RETRY_CLOSE',
      nextStage: 'CLOSING',
      intent: 'attempt_close',
      closeAttempt: session.closeAttempts
    };
  }

  /**
   * Handle LEAD_CAPTURE stage - collect name and phone
   */
  handleLeadCaptureStage(session, userMessage) {
    const { stage } = session;

    if (stage === 'LEAD_CAPTURE_NAME') {
      const name = this.extractName(userMessage);
      if (name) {
        this.stateManager.updateUserData(session.sessionId, { name });
        this.stateManager.advanceStage(session.sessionId, 'LEAD_CAPTURE_PHONE');

        return {
          action: 'ASK_PHONE',
          nextStage: 'LEAD_CAPTURE_PHONE',
          intent: 'capture_phone',
          name
        };
      }
    }

    if (stage === 'LEAD_CAPTURE_PHONE') {
      const phone = this.extractPhone(userMessage);
      if (phone) {
        this.stateManager.updateUserData(session.sessionId, { phone });
        this.stateManager.advanceStage(session.sessionId, 'COMPLETED');

        return {
          action: 'LEAD_COMPLETE',
          nextStage: 'COMPLETED',
          intent: 'thank_and_confirm',
          leadData: session.userData,
          shouldSaveLead: true
        };
      }
    }

    // Re-ask for the same information
    return {
      action: 'RETRY_CAPTURE',
      nextStage: stage,
      intent: stage === 'LEAD_CAPTURE_NAME' ? 'capture_name' : 'capture_phone'
    };
  }

  /**
   * Extract user data from message based on current stage
   */
  extractUserData(stage, message) {
    const lowerMessage = message.toLowerCase();

    switch (stage) {
      case 'QUALIFICATION_BILL':
        const billMatch = message.match(/(\d+)/);
        if (billMatch) {
          return { monthlyBill: parseInt(billMatch[1]) };
        }
        break;

      case 'QUALIFICATION_HOUSE':
        if (lowerMessage.includes('own') || lowerMessage.includes('मेरा') || lowerMessage.includes('खुद का')) {
          return { houseType: 'own' };
        } else if (lowerMessage.includes('rent') || lowerMessage.includes('किराये')) {
          return { houseType: 'rent' };
        }
        break;

      case 'QUALIFICATION_ROOF':
        if (lowerMessage.includes('yes') || lowerMessage.includes('हाँ') || lowerMessage.includes('है')) {
          return { roofSpace: 'yes' };
        } else if (lowerMessage.includes('no') || lowerMessage.includes('नहीं')) {
          return { roofSpace: 'no' };
        }
        break;

      case 'QUALIFICATION_CITY':
        // Extract city name (simple extraction)
        return { city: message.trim() };
    }

    return null;
  }

  /**
   * Detect if message contains objection
   */
  detectObjection(message) {
    const lowerMessage = message.toLowerCase();
    const objectionKeywords = [
      'expensive', 'costly', 'महंगा', 'price', 'कीमत',
      'not sure', 'think', 'सोचना', 'doubt', 'संदेह',
      'no time', 'busy', 'समय नहीं', 'later', 'बाद में'
    ];

    return objectionKeywords.some(keyword => lowerMessage.includes(keyword));
  }

  /**
   * Classify type of objection
   */
  classifyObjection(message) {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('expensive') || lowerMessage.includes('costly') || lowerMessage.includes('महंगा') || lowerMessage.includes('price')) {
      return 'price';
    }
    if (lowerMessage.includes('not sure') || lowerMessage.includes('think') || lowerMessage.includes('सोचना')) {
      return 'uncertainty';
    }
    if (lowerMessage.includes('no time') || lowerMessage.includes('busy') || lowerMessage.includes('समय नहीं')) {
      return 'time';
    }

    return 'general';
  }

  /**
   * Detect interest level from message
   */
  detectInterest(message) {
    const lowerMessage = message.toLowerCase();

    const yesKeywords = ['yes', 'हाँ', 'sure', 'okay', 'ठीक', 'book', 'interested'];
    const noKeywords = ['no', 'नहीं', 'not interested', 'रुचि नहीं'];

    if (yesKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return 'yes';
    }
    if (noKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return 'no';
    }

    return 'maybe';
  }

  /**
   * Extract name from message
   */
  extractName(message) {
    // Simple name extraction (can be improved with NER)
    const trimmed = message.trim();
    if (trimmed.length > 2 && trimmed.length < 50) {
      return trimmed;
    }
    return null;
  }

  /**
   * Extract phone number from message
   */
  extractPhone(message) {
    const phoneMatch = message.match(/(\d{10})/);
    if (phoneMatch) {
      return phoneMatch[1];
    }
    return null;
  }
}

module.exports = SalesFunnelController;
