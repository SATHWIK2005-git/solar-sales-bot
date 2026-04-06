# ☀️ Solar Sales Bot

A multilingual, AI-powered solar sales chatbot that converts website visitors into qualified leads for a solar installation company. Built with **Node.js + Express + OpenAI GPT**.

---

## Features

| Feature | Detail |
|---------|--------|
| 🗣️ Languages | Hindi (primary) · Telugu · Odia · English fallback |
| 🤖 AI Engine | OpenAI GPT-4o-mini (configurable) |
| 📋 Sales Funnel | Greeting → Qualification → Value Pitch → Objection Handling → Closing |
| 💰 Lead Capture | Name, phone, city, monthly bill, house ownership, interest level |
| 📅 Booking | Free site visit booking with 24-hour callback promise |
| 🏷️ Objections | Cost → EMI options · Uncertainty → Free site visit |
| 💾 Storage | Leads saved to `data/leads.json` (swap for DB in production) |
| 🌐 UI | Responsive web chat interface served from `/public` |

---

## Quick Start

### Prerequisites
- Node.js ≥ 18
- An [OpenAI API key](https://platform.openai.com/api-keys)

### Setup

```bash
# 1. Clone & install
git clone https://github.com/SATHWIK2005-git/solar-sales-bot.git
cd solar-sales-bot
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY

# 3. Start the server
npm start
# → http://localhost:3000
```

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENAI_API_KEY` | ✅ | — | Your OpenAI secret key |
| `OPENAI_MODEL` | ❌ | `gpt-4o-mini` | Model to use (e.g. `gpt-4o`) |
| `PORT` | ❌ | `3000` | HTTP port |
| `ADMIN_API_KEY` | ❌ | — | Secret for the `/leads` admin endpoint |

---

## API Endpoints

### `POST /chat`
Send a user message and receive the bot's reply.

**Request body:**
```json
{
  "sessionId": "optional-uuid-to-continue-session",
  "message": "नमस्ते"
}
```

**Response:**
```json
{
  "sessionId": "uuid",
  "reply": "नमस्ते! मैं Ravi हूँ... आपका नाम क्या है?"
}
```

### `DELETE /chat/:sessionId`
Clear conversation history for a session (start fresh).

### `GET /leads`
Return all captured leads (requires `X-API-Key` header if `ADMIN_API_KEY` is set).

---

## Sales Funnel

```
1. Greeting      — warm intro, ask for name
2. Qualification — electricity bill · house ownership · rooftop · city
3. Value Pitch   — 40% subsidy (₹78k) · 80–100% bill reduction · 25yr lifetime
4. Objections    — cost → EMI from ₹2,500/mo · uncertainty → free site visit
5. Lead Capture  — name · phone · city · bill · interest level
6. Closing       — book a FREE site visit; callback within 24 hours
```

---

## Running Tests

```bash
npm test
```

Tests cover lead extraction parsing, lead storage round-trips, system-prompt content, and API validation — all without requiring a real OpenAI API key.

---

## Project Structure

```
solar-sales-bot/
├── server.js          # Express server & API routes
├── src/
│   ├── chatbot.js     # OpenAI chat wrapper + lead-data extractor
│   ├── leads.js       # Lead persistence (JSON file)
│   └── prompt.js      # System prompt (sales funnel + multilingual rules)
├── public/
│   └── index.html     # Web chat UI
├── test/
│   └── bot.test.js    # Unit & integration tests
├── data/
│   └── leads.json     # Auto-created; captured leads (gitignored)
├── .env.example       # Environment template
└── package.json
```

---

## Production Notes

- Replace in-memory session store (`Map`) in `server.js` with **Redis** for multi-instance deployments.
- Replace `data/leads.json` with a real database (PostgreSQL, MongoDB, etc.).
- Add rate-limiting middleware (e.g. `express-rate-limit`) before deploying publicly.
- Protect `/leads` with a strong `ADMIN_API_KEY`.
