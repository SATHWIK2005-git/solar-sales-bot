# 📡 API Documentation - Mierae Solar Sales Chatbot

Complete REST API reference for integration and development.

## Base URL

**Local Development:**
```
http://localhost:3000
```

**Production:**
```
https://your-domain.com
```

---

## Authentication

Currently no authentication required. For production, add API key authentication.

---

## Endpoints

### 1. Health Check

Check if the API is running.

**Endpoint:** `GET /api/health`

**Response:**
```json
{
  "status": "healthy",
  "service": "Mierae Solar Sales Chatbot",
  "version": "1.0.0",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**cURL Example:**
```bash
curl http://localhost:3000/api/health
```

---

### 2. Start Conversation

Start a new chat session.

**Endpoint:** `POST /api/chat/start`

**Request Body:**
```json
{
  "language": "hindi"  // or "english"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "message": "नमस्ते! क्या आपका बिजली का बिल बहुत ज्यादा आता है?",
    "stage": "HOOK"
  }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/chat/start \
  -H "Content-Type: application/json" \
  -d '{"language": "hindi"}'
```

**JavaScript Example:**
```javascript
const response = await fetch('http://localhost:3000/api/chat/start', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ language: 'hindi' })
});

const { data } = await response.json();
console.log('Session ID:', data.sessionId);
console.log('Bot Message:', data.message);
```

---

### 3. Send Message

Send user message and get bot response.

**Endpoint:** `POST /api/chat/message`

**Request Body:**
```json
{
  "sessionId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "message": "हाँ, बहुत ज्यादा आता है"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "message": "आपका मासिक बिजली का बिल कितना आता है?",
    "stage": "QUALIFICATION_BILL",
    "action": "ASK_NEXT_QUESTION",
    "userData": {
      "monthlyBill": null,
      "houseType": null,
      "roofSpace": null,
      "city": null,
      "name": null,
      "phone": null,
      "interested": null
    },
    "leadSaved": false,
    "conversationComplete": false
  }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "message": "4000 रुपये"
  }'
```

**JavaScript Example:**
```javascript
const response = await fetch('http://localhost:3000/api/chat/message', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sessionId: sessionId,
    message: '4000 रुपये'
  })
});

const { data } = await response.json();
console.log('Bot:', data.message);
console.log('Stage:', data.stage);
console.log('User Data:', data.userData);
```

---

### 4. Get Conversation History

Retrieve complete conversation history for a session.

**Endpoint:** `GET /api/chat/history/:sessionId`

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "stage": "QUALIFICATION_BILL",
    "conversationHistory": [
      {
        "role": "bot",
        "content": "नमस्ते! क्या आपका बिजली का बिल बहुत ज्यादा आता है?",
        "timestamp": 1705315800000
      },
      {
        "role": "user",
        "content": "हाँ, बहुत ज्यादा आता है",
        "timestamp": 1705315810000
      }
    ],
    "userData": {
      "monthlyBill": null,
      "houseType": null,
      "city": null
    }
  }
}
```

**cURL Example:**
```bash
curl http://localhost:3000/api/chat/history/a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

---

### 5. Get All Leads

Retrieve all captured leads.

**Endpoint:** `GET /api/leads`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "LEAD-M9N8K7L6-5X4Y3",
      "sessionId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "timestamp": "2024-01-15T10:30:00.000Z",
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
      "complete": true,
      "savedAt": "2024-01-15T10:35:00.000Z"
    }
  ],
  "count": 1
}
```

**cURL Example:**
```bash
curl http://localhost:3000/api/leads
```

---

### 6. Get Lead Statistics

Get analytics and statistics for all leads.

**Endpoint:** `GET /api/leads/stats`

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 15,
    "interested": 12,
    "notInterested": 3,
    "qualified": 14,
    "complete": 13,
    "avgBill": 3850,
    "cities": {
      "दिल्ली": 5,
      "मुंबई": 4,
      "बैंगलोर": 3,
      "पुणे": 3
    },
    "houseTypes": {
      "own": 12,
      "rent": 3
    }
  }
}
```

**cURL Example:**
```bash
curl http://localhost:3000/api/leads/stats
```

**JavaScript Example:**
```javascript
const response = await fetch('http://localhost:3000/api/leads/stats');
const { data } = await response.json();

console.log(`Total Leads: ${data.total}`);
console.log(`Conversion Rate: ${(data.interested / data.total * 100).toFixed(1)}%`);
console.log(`Average Bill: ₹${data.avgBill}`);
```

---

### 7. Export Leads (CSV)

Export all leads as CSV file.

**Endpoint:** `GET /api/leads/export`

**Response:** CSV file download

```csv
ID,Name,Phone,City,Monthly Bill,House Type,Interested,Qualified,Complete,Timestamp
LEAD-M9N8K7L6-5X4Y3,राज कुमार,9876543210,दिल्ली,4000,own,yes,Yes,Yes,2024-01-15T10:30:00.000Z
```

**cURL Example:**
```bash
curl http://localhost:3000/api/leads/export -o leads.csv
```

**JavaScript Example:**
```javascript
// Download CSV
window.location.href = 'http://localhost:3000/api/leads/export';
```

---

## Error Responses

### Session Not Found
```json
{
  "success": false,
  "error": "Session not found or expired",
  "message": "Please start a new conversation"
}
```

### Missing Parameters
```json
{
  "success": false,
  "error": "sessionId and message are required"
}
```

### Server Error
```json
{
  "success": false,
  "error": "Failed to generate response from LLM"
}
```

---

## Conversation Stages

The chatbot progresses through these stages:

| Stage | Description |
|-------|-------------|
| `HOOK` | Initial attention-grabbing message |
| `QUALIFICATION_BILL` | Ask for monthly electricity bill |
| `QUALIFICATION_HOUSE` | Ask if own or rented house |
| `QUALIFICATION_ROOF` | Ask about roof space availability |
| `QUALIFICATION_CITY` | Ask for city |
| `VALUE_PITCH` | Present benefits and value proposition |
| `OBJECTION_HANDLING` | Handle user objections |
| `CLOSING` | Attempt to close and book site visit |
| `LEAD_CAPTURE_NAME` | Capture user name |
| `LEAD_CAPTURE_PHONE` | Capture phone number |
| `COMPLETED` | Conversation completed |

---

## Integration Examples

### React Integration

```javascript
import { useState, useEffect } from 'react';

function ChatComponent() {
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);

  const startChat = async () => {
    const res = await fetch('http://localhost:3000/api/chat/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language: 'hindi' })
    });

    const { data } = await res.json();
    setSessionId(data.sessionId);
    setMessages([{ role: 'bot', content: data.message }]);
  };

  const sendMessage = async (message) => {
    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: message }]);

    // Send to API
    const res = await fetch('http://localhost:3000/api/chat/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, message })
    });

    const { data } = await res.json();

    // Add bot response
    setMessages(prev => [...prev, { role: 'bot', content: data.message }]);
  };

  return (
    <div>
      <button onClick={startChat}>Start Chat</button>
      {/* Render messages */}
    </div>
  );
}
```

### Vue.js Integration

```javascript
export default {
  data() {
    return {
      sessionId: null,
      messages: []
    };
  },
  methods: {
    async startChat() {
      const res = await fetch('http://localhost:3000/api/chat/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: 'hindi' })
      });

      const { data } = await res.json();
      this.sessionId = data.sessionId;
      this.messages.push({ role: 'bot', content: data.message });
    },

    async sendMessage(message) {
      this.messages.push({ role: 'user', content: message });

      const res = await fetch('http://localhost:3000/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: this.sessionId,
          message
        })
      });

      const { data } = await res.json();
      this.messages.push({ role: 'bot', content: data.message });
    }
  }
};
```

### WhatsApp Integration (Pseudo-code)

```javascript
// Using Twilio or similar
const whatsappBot = {
  sessionMap: new Map(), // userId -> sessionId

  async handleIncomingMessage(userId, message) {
    // Get or create session
    let sessionId = this.sessionMap.get(userId);

    if (!sessionId) {
      // Start new conversation
      const res = await fetch('http://localhost:3000/api/chat/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: 'hindi' })
      });

      const { data } = await res.json();
      sessionId = data.sessionId;
      this.sessionMap.set(userId, sessionId);

      return data.message; // Send to WhatsApp user
    }

    // Send message to chatbot
    const res = await fetch('http://localhost:3000/api/chat/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, message })
    });

    const { data } = await res.json();
    return data.message; // Send to WhatsApp user
  }
};
```

---

## Rate Limiting (Recommended for Production)

Add rate limiting to prevent abuse:

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

---

## CORS Configuration

For cross-origin requests:

```javascript
const cors = require('cors');

// Allow specific origin
app.use(cors({
  origin: 'https://your-frontend.com',
  credentials: true
}));

// Or allow all (development only)
app.use(cors());
```

---

## Webhooks (Future Enhancement)

To notify external systems when a lead is captured:

```javascript
// Add to LeadManager.saveLead()
async notifyWebhook(leadData) {
  const webhookUrl = process.env.WEBHOOK_URL;
  if (webhookUrl) {
    await axios.post(webhookUrl, {
      event: 'lead.created',
      data: leadData,
      timestamp: new Date().toISOString()
    });
  }
}
```

---

## Testing the API

### Using Postman

1. **Start Conversation:**
   - Method: POST
   - URL: `http://localhost:3000/api/chat/start`
   - Body (JSON): `{ "language": "hindi" }`
   - Save the `sessionId` from response

2. **Send Message:**
   - Method: POST
   - URL: `http://localhost:3000/api/chat/message`
   - Body (JSON): `{ "sessionId": "...", "message": "हाँ" }`

3. **Get Stats:**
   - Method: GET
   - URL: `http://localhost:3000/api/leads/stats`

### Using JavaScript (Browser Console)

```javascript
// Start conversation
let sessionId;
fetch('http://localhost:3000/api/chat/start', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ language: 'hindi' })
})
.then(r => r.json())
.then(data => {
  sessionId = data.data.sessionId;
  console.log('Bot:', data.data.message);
});

// Send message
fetch('http://localhost:3000/api/chat/message', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sessionId: sessionId,
    message: '4000 रुपये'
  })
})
.then(r => r.json())
.then(data => console.log('Bot:', data.data.message));
```

---

## API Best Practices

1. **Store Session IDs**: Save sessionId in local storage or state
2. **Handle Errors**: Always check `success` field in response
3. **Session Expiry**: Sessions expire after 30 minutes of inactivity
4. **Retry Logic**: Implement retry for failed requests
5. **Loading States**: Show loading indicators during API calls
6. **Error Messages**: Display user-friendly error messages

---

## Support

For API issues or questions:
- Check server logs: `npm start`
- Test with cURL examples above
- Review error responses
- Check environment configuration

---

**API Version:** 1.0.0
**Last Updated:** 2024-01-15
