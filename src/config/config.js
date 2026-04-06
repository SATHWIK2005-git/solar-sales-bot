const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development'
  },

  llm: {
    provider: process.env.LLM_PROVIDER || 'openai',
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || 'gpt-4'
    },
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY,
      model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022'
    }
  },

  app: {
    defaultLanguage: process.env.DEFAULT_LANGUAGE || 'hindi',
    maxConversationTurns: parseInt(process.env.MAX_CONVERSATION_TURNS) || 20,
    enableLogging: process.env.ENABLE_CONVERSATION_LOGGING === 'true'
  },

  storage: {
    leadStoragePath: process.env.LEAD_STORAGE_PATH || './data/leads.json'
  },

  // Solar company domain knowledge
  domain: {
    companyName: 'Mierae Solar',
    subsidyPercentage: 40,
    maxSubsidy: 78000,
    freeUnitsPerMonth: 300,
    loanInterestRate: 6.75,
    systemLifeYears: 25,
    system3kWBenefit: 'near zero electricity bill',
    emiRange: '₹2000-₹3000',
    billPainRange: '₹2000-₹5000'
  }
};
