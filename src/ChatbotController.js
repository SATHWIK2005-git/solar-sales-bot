const ConversationStateManager = require('./services/ConversationStateManager');
const SalesFunnelController = require('./services/SalesFunnelController');
const LLMService = require('./services/LLMService');
const LeadManager = require('./services/LeadManager');

/**
 * Chatbot Controller
 * Orchestrates the conversation flow, LLM integration, and lead management
 */
class ChatbotController {
  constructor() {
    this.stateManager = new ConversationStateManager();
    this.funnelController = new SalesFunnelController(this.stateManager);
    this.llmService = new LLMService();
    this.leadManager = new LeadManager();
  }

  /**
   * Start a new conversation
   */
  async startConversation(language = 'hindi') {
    const session = this.stateManager.createSession(language);

    // Generate initial hook message
    const systemPrompt = this.llmService.buildSystemPrompt(
      language,
      'HOOK',
      { action: 'HOOK', intent: 'start_qualification' }
    );

    const initialMessage = await this.llmService.generateResponse(
      systemPrompt,
      [],
      { action: 'HOOK', intent: 'start_qualification' }
    );

    this.stateManager.addMessage(session.sessionId, 'bot', initialMessage);

    return {
      sessionId: session.sessionId,
      message: initialMessage,
      stage: session.stage
    };
  }

  /**
   * Process user message and generate response
   */
  async processMessage(sessionId, userMessage) {
    const session = this.stateManager.getSession(sessionId);

    if (!session) {
      return {
        error: 'Session not found or expired',
        message: 'Please start a new conversation'
      };
    }

    // Add user message to history
    this.stateManager.addMessage(sessionId, 'user', userMessage);

    // Get next action from sales funnel controller
    const action = this.funnelController.getNextAction(session, userMessage);

    // Generate bot response using LLM
    const systemPrompt = this.llmService.buildSystemPrompt(
      session.language,
      action.nextStage || session.stage,
      action,
      session.userData
    );

    const botResponse = await this.llmService.generateResponse(
      systemPrompt,
      session.conversationHistory,
      action
    );

    // Add bot response to history
    this.stateManager.addMessage(sessionId, 'bot', botResponse);

    // Save lead if conversation is complete
    let leadSaved = false;
    if (action.shouldSaveLead && this.stateManager.isLeadComplete(sessionId)) {
      const leadData = this.stateManager.exportLeadData(sessionId);
      await this.leadManager.saveLead(leadData);
      leadSaved = true;
    }

    return {
      sessionId,
      message: botResponse,
      stage: session.stage,
      action: action.action,
      userData: session.userData,
      leadSaved,
      conversationComplete: session.stage === 'COMPLETED'
    };
  }

  /**
   * Get conversation history
   */
  getConversationHistory(sessionId) {
    const session = this.stateManager.getSession(sessionId);
    if (!session) {
      return null;
    }

    return {
      sessionId,
      stage: session.stage,
      conversationHistory: session.conversationHistory,
      userData: session.userData
    };
  }

  /**
   * Get lead statistics
   */
  async getLeadStats() {
    return await this.leadManager.getLeadStats();
  }

  /**
   * Get all leads
   */
  async getAllLeads() {
    return await this.leadManager.getAllLeads();
  }

  /**
   * Export leads to CSV
   */
  async exportLeadsCSV() {
    return await this.leadManager.exportToCSV();
  }
}

module.exports = ChatbotController;
