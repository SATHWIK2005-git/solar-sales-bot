# 🌞 Mierae Solar - AI Sales Chatbot

A production-ready, multilingual AI sales chatbot designed specifically for converting solar leads. Built with Node.js, Express, and LLM integration (OpenAI/Claude).

## 🎯 Features

- **Sales Funnel Architecture**: Hook → Qualification → Value Pitch → Objection Handling → Closing → Lead Capture
- **Multilingual Support**: Primary Hindi, with English fallback
- **Intelligent Conversation Flow**: State-based conversation management
- **Lead Management**: Automatic lead capture and storage with analytics
- **LLM Integration**: Supports both OpenAI (GPT-4) and Anthropic (Claude)
- **Real-time Web Interface**: Beautiful, responsive chat UI
- **REST API**: Full API for integration with other systems

## 🏗️ Architecture

```
src/
├── server.js                    # Express server with REST API endpoints
├── ChatbotController.js         # Main orchestration controller
├── config/
│   └── config.js                # Configuration management
├── services/
│   ├── ConversationStateManager.js  # Multi-turn conversation state
│   ├── SalesFunnelController.js     # Sales funnel logic
│   ├── LLMService.js                # OpenAI/Claude integration
│   └── LeadManager.js               # Lead storage & analytics
public/
└── index.html                   # Web chat interface
data/
└── leads.json                   # Lead database (auto-created)
```

## 📋 Prerequisites

- Node.js 16+ and npm
- OpenAI API key OR Anthropic API key
- Internet connection

## 🚀 Quick Start

### 1. Clone and Install

```bash
cd solar-sales-bot
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and add your API key:

**Option A: Using OpenAI (Recommended)**
```env
OPENAI_API_KEY=sk-your-key-here
LLM_PROVIDER=openai
OPENAI_MODEL=gpt-4
```

**Option B: Using Anthropic Claude**
```env
ANTHROPIC_API_KEY=sk-ant-your-key-here
LLM_PROVIDER=anthropic
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
```

### 3. Run the Server

```bash
npm start
```

Server will start at: **http://localhost:3000**

### 4. Open Web Interface

Open your browser and go to: **http://localhost:3000**

## 🧪 Testing

Run the automated test conversation:

```bash
npm test
```

This will simulate a complete conversation flow and show how the chatbot handles each stage.

## 📡 API Endpoints

### Start Conversation
```bash
POST /api/chat/start
Body: { "language": "hindi" }

Response: {
  "success": true,
  "data": {
    "sessionId": "uuid",
    "message": "Bot's opening message",
    "stage": "HOOK"
  }
}
```

### Send Message
```bash
POST /api/chat/message
Body: {
  "sessionId": "uuid",
  "message": "User's message"
}

Response: {
  "success": true,
  "data": {
    "message": "Bot's response",
    "stage": "QUALIFICATION_BILL",
    "userData": {},
    "leadSaved": false
  }
}
```

### Get All Leads
```bash
GET /api/leads

Response: {
  "success": true,
  "data": [...],
  "count": 10
}
```

### Get Lead Statistics
```bash
GET /api/leads/stats

Response: {
  "success": true,
  "data": {
    "total": 10,
    "interested": 8,
    "avgBill": 3500,
    "cities": {...}
  }
}
```

### Export Leads (CSV)
```bash
GET /api/leads/export
```

## 🎭 Sales Funnel Stages

1. **HOOK** - Grab attention about electricity bills
2. **QUALIFICATION** - Ask qualifying questions one by one:
   - Monthly electricity bill
   - Own house or rented
   - Roof space available
   - City
3. **VALUE_PITCH** - Present benefits (40% subsidy, savings, etc.)
4. **OBJECTION_HANDLING** - Handle common objections:
   - Too expensive → EMI ₹2000-₹3000/month
   - Not sure → Free site visit
   - No time → Full service handled
5. **CLOSING** - Push for FREE site visit booking
6. **LEAD_CAPTURE** - Collect name and phone number

## 💡 Domain Knowledge (Built-in)

- **Government subsidy**: Up to 40% (max ₹78,000)
- **Free electricity**: 300 units/month
- **Loan available**: ~6.75% interest rate
- **System life**: ~25 years
- **3kW system**: Reduces bill to near zero
- **EMI range**: ₹2000-₹3000/month

## 🌐 Language Support

### Hindi (Primary)
The chatbot speaks naturally in Hindi using persuasive sales language:
```
"आपका मासिक बिजली का बिल कितना आता है?"
"40% सब्सिडी + EMI पर उपलब्ध!"
"क्या मैं आपके लिए एक FREE साइट विज़िट बुक कर दूं?"
```

### English (Fallback)
Full English support available by changing language parameter.

## 📊 Lead Data Structure

Each lead captures:
```json
{
  "id": "LEAD-xxxxx",
  "sessionId": "uuid",
  "timestamp": "ISO date",
  "language": "hindi",
  "userData": {
    "name": "राज कुमार",
    "phone": "9876543210",
    "city": "दिल्ली",
    "monthlyBill": 4000,
    "houseType": "own",
    "roofSpace": "yes",
    "interested": "yes"
  },
  "qualified": true,
  "complete": true
}
```

## 🎨 Conversation Design Principles

1. **Human-like**: Speaks like a real salesperson, not a robot
2. **Short Messages**: 1-3 lines per response
3. **One Question at a Time**: Never overwhelms the user
4. **Persuasive Tone**: Creates urgency and highlights benefits
5. **Objection Handling**: Prepared for common doubts
6. **Persistent Closing**: Always pushes toward conversion

## 🔧 Configuration Options

Edit `src/config/config.js` to customize:

- **LLM Provider**: OpenAI or Anthropic
- **Model Selection**: GPT-4, Claude 3.5 Sonnet, etc.
- **Session Timeout**: Default 30 minutes
- **Max Conversation Turns**: Default 20
- **Lead Storage Path**: Where to save leads
- **Default Language**: Hindi or English

## 📱 Integration Examples

### Integrate with Your Website

```javascript
// Start conversation
const response = await fetch('http://localhost:3000/api/chat/start', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ language: 'hindi' })
});

const { data } = await response.json();
const sessionId = data.sessionId;

// Send messages
await fetch('http://localhost:3000/api/chat/message', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sessionId: sessionId,
    message: 'User message here'
  })
});
```

### Integrate with WhatsApp/Telegram

The REST API can be easily integrated with messaging platforms:

1. Receive user message from platform
2. Call `/api/chat/message` endpoint
3. Send bot response back to user
4. Leads are automatically captured

## 🎯 Example Conversation Flow

```
Bot: नमस्ते! क्या आपका बिजली का बिल बहुत ज्यादा आता है?
     हर महीने ₹2000-₹5000 बर्बाद हो रहे हैं?

User: हाँ, बहुत ज्यादा आता है

Bot: आपका मासिक बिजली का बिल कितना आता है? (लगभग बताएं)

User: लगभग 4000 रुपये

Bot: क्या आपका खुद का घर है या किराये का?

User: खुद का घर है

Bot: क्या आपके पास छत पर जगह है?

User: हाँ है

Bot: आप किस शहर में रहते हैं?

User: दिल्ली

Bot: बढ़िया! सुनिए, सरकार 40% सब्सिडी दे रही है (₹78,000 तक)।
     आपका ₹4000 का बिल लगभग ₹0 हो जाएगा।
     25 साल तक फ्री बिजली! EMI पर भी मिलता है।

User: ये तो अच्छा लग रहा है

Bot: क्या मैं आपके लिए एक FREE साइट विज़िट बुक कर दूं?
     हमारे एक्सपर्ट आकर सब समझा देंगे।

User: हाँ ठीक है

Bot: बहुत बढ़िया! मुझे आपका नाम बताएं?

User: राज कुमार

Bot: और आपका मोबाइल नंबर?

User: 9876543210

Bot: बहुत बढ़िया राज कुमार जी! हमारी टीम जल्द ही आपसे संपर्क करेगी।
     सोलर में आपका स्वागत है! 🌞

[Lead captured: Name, Phone, City, Bill, Interest = YES]
```

## 🛠️ Troubleshooting

### "API key not configured"
- Make sure you've copied `.env.example` to `.env`
- Add your OpenAI or Anthropic API key
- Restart the server

### "Failed to generate response"
- Check your API key is valid
- Ensure you have internet connection
- Verify you have API credits available

### "Session not found"
- Sessions expire after 30 minutes of inactivity
- Start a new conversation

## 📈 Production Deployment

### Option 1: Heroku

```bash
heroku create your-solar-bot
heroku config:set OPENAI_API_KEY=your-key
heroku config:set NODE_ENV=production
git push heroku main
```

### Option 2: Digital Ocean / AWS / GCP

1. Deploy as a Node.js application
2. Set environment variables
3. Ensure port 3000 is accessible
4. Use PM2 for process management:

```bash
npm install -g pm2
pm2 start src/server.js --name solar-bot
pm2 save
pm2 startup
```

### Option 3: Docker

```bash
docker build -t solar-bot .
docker run -p 3000:3000 --env-file .env solar-bot
```

## 🔐 Security Recommendations

1. **Never commit .env file** - Already in .gitignore
2. **Use HTTPS in production** - Add SSL certificate
3. **Rate limiting** - Add rate limiting for API endpoints
4. **API authentication** - Add authentication for production
5. **Input validation** - Validate all user inputs
6. **Secure lead data** - Encrypt sensitive data at rest

## 📊 Analytics & Monitoring

Access lead statistics via API:

```bash
curl http://localhost:3000/api/leads/stats
```

Returns:
- Total leads captured
- Interested vs not interested
- Average electricity bill
- City distribution
- House type breakdown

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section
2. Review API documentation
3. Test with the automated test script

## 📜 License

MIT License - Feel free to use for commercial purposes

## 🌟 Key Highlights

✅ **Production-Ready**: State management, error handling, logging
✅ **Sales-Focused**: Built for conversion, not just Q&A
✅ **Multilingual**: Hindi primary with English support
✅ **Easy to Deploy**: Simple setup, works on any Node.js host
✅ **Full Analytics**: Track leads, conversion rates, demographics
✅ **Beautiful UI**: Professional web interface included
✅ **API-First**: Easy integration with any platform
✅ **Industry-Grade**: Structured like a professional system

---

Built with ❤️ for Mierae Solar
