const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config/config');
const ChatbotController = require('./ChatbotController');

const app = express();
const chatbot = new ChatbotController();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Mierae Solar Sales Chatbot',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

/**
 * POST /api/chat/start
 * Start a new conversation
 * Body: { language: 'hindi' | 'english' }
 */
app.post('/api/chat/start', async (req, res) => {
  try {
    const { language = 'hindi' } = req.body;

    const result = await chatbot.startConversation(language);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error starting conversation:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/chat/message
 * Send a message and get response
 * Body: { sessionId: string, message: string }
 */
app.post('/api/chat/message', async (req, res) => {
  try {
    const { sessionId, message } = req.body;

    if (!sessionId || !message) {
      return res.status(400).json({
        success: false,
        error: 'sessionId and message are required'
      });
    }

    const result = await chatbot.processMessage(sessionId, message);

    if (result.error) {
      return res.status(404).json({
        success: false,
        error: result.error,
        message: result.message
      });
    }

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error processing message:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/chat/history/:sessionId
 * Get conversation history
 */
app.get('/api/chat/history/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;

    const history = chatbot.getConversationHistory(sessionId);

    if (!history) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Error getting history:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/leads
 * Get all leads
 */
app.get('/api/leads', async (req, res) => {
  try {
    const leads = await chatbot.getAllLeads();

    res.json({
      success: true,
      data: leads,
      count: leads.length
    });
  } catch (error) {
    console.error('Error getting leads:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/leads/stats
 * Get lead statistics
 */
app.get('/api/leads/stats', async (req, res) => {
  try {
    const stats = await chatbot.getLeadStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting lead stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/leads/export
 * Export leads as CSV
 */
app.get('/api/leads/export', async (req, res) => {
  try {
    const csv = await chatbot.exportLeadsCSV();

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=leads.csv');
    res.send(csv);
  } catch (error) {
    console.error('Error exporting leads:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Start server
const PORT = config.server.port;
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════╗
║   Mierae Solar Sales Chatbot - Server Running ║
╚════════════════════════════════════════════════╝

🚀 Server: http://localhost:${PORT}
🤖 API: http://localhost:${PORT}/api/health
🌐 Web UI: http://localhost:${PORT}
📊 LLM Provider: ${config.llm.provider}
🌍 Default Language: ${config.app.defaultLanguage}

Environment: ${config.server.env}
  `);
});

module.exports = app;
