const axios = require('axios');
const config = require('../config/config');

/**
 * LLM Integration Service
 * Handles communication with OpenAI or Anthropic Claude APIs
 */
class LLMService {
  constructor() {
    this.provider = config.llm.provider;

    if (this.provider === 'openai') {
      this.apiKey = config.llm.openai.apiKey;
      this.model = config.llm.openai.model;
      this.endpoint = 'https://api.openai.com/v1/chat/completions';
    } else if (this.provider === 'anthropic') {
      this.apiKey = config.llm.anthropic.apiKey;
      this.model = config.llm.anthropic.model;
      this.endpoint = 'https://api.anthropic.com/v1/messages';
    }
  }

  /**
   * Generate response using LLM
   */
  async generateResponse(systemPrompt, conversationHistory, currentAction) {
    try {
      if (this.provider === 'openai') {
        return await this.generateOpenAIResponse(systemPrompt, conversationHistory, currentAction);
      } else if (this.provider === 'anthropic') {
        return await this.generateAnthropicResponse(systemPrompt, conversationHistory, currentAction);
      }
    } catch (error) {
      console.error('LLM API Error:', error.message);
      throw new Error('Failed to generate response from LLM');
    }
  }

  /**
   * Generate response using OpenAI API
   */
  async generateOpenAIResponse(systemPrompt, conversationHistory, currentAction) {
    const messages = [
      { role: 'system', content: systemPrompt }
    ];

    // Add conversation history
    conversationHistory.forEach(msg => {
      messages.push({
        role: msg.role === 'bot' ? 'assistant' : 'user',
        content: msg.content
      });
    });

    // Add current action context
    if (currentAction) {
      messages.push({
        role: 'system',
        content: `Current Action: ${JSON.stringify(currentAction)}`
      });
    }

    const response = await axios.post(
      this.endpoint,
      {
        model: this.model,
        messages,
        temperature: 0.7,
        max_tokens: 300
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.choices[0].message.content;
  }

  /**
   * Generate response using Anthropic Claude API
   */
  async generateAnthropicResponse(systemPrompt, conversationHistory, currentAction) {
    const messages = [];

    // Add conversation history
    conversationHistory.forEach(msg => {
      messages.push({
        role: msg.role === 'bot' ? 'assistant' : 'user',
        content: msg.content
      });
    });

    // Add current action context to system prompt
    let enhancedSystemPrompt = systemPrompt;
    if (currentAction) {
      enhancedSystemPrompt += `\n\nCurrent Action: ${JSON.stringify(currentAction)}`;
    }

    const response = await axios.post(
      this.endpoint,
      {
        model: this.model,
        max_tokens: 300,
        system: enhancedSystemPrompt,
        messages
      },
      {
        headers: {
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.content[0].text;
  }

  /**
   * Build system prompt based on language and stage
   */
  buildSystemPrompt(language, stage, action, userData = {}) {
    const basePrompt = this.getBasePrompt(language);
    const stagePrompt = this.getStagePrompt(language, stage, action, userData);

    return `${basePrompt}\n\n${stagePrompt}`;
  }

  /**
   * Get base system prompt with sales rules
   */
  getBasePrompt(language) {
    if (language === 'hindi') {
      return `आप Mierae Solar के लिए एक विशेषज्ञ सेल्स एजेंट हैं। आपका काम ग्राहकों को सोलर पैनल इंस्टॉलेशन के लिए कन्वर्ट करना है।

महत्वपूर्ण नियम:
- एक इंसानी सेल्सपर्सन की तरह बात करें, रोबोट की तरह नहीं
- छोटे, आकर्षक संदेश भेजें (1-3 पंक्तियाँ)
- एक बार में केवल एक सवाल पूछें
- हमेशा मनाने वाले शब्दों का उपयोग करें
- अर्जेंसी बनाएं (सीमित सब्सिडी)
- लंबे पैराग्राफ से बचें
- हमेशा लीड क्लोज़ करने की कोशिश करें

कंपनी की जानकारी:
- सरकारी सब्सिडी: 40% तक (अधिकतम ₹78,000)
- मुफ्त बिजली: 300 यूनिट/महीना
- लोन उपलब्ध: ~6.75% ब्याज दर पर
- सिस्टम की उम्र: ~25 साल
- 3kW सिस्टम से बिल लगभग शून्य हो जाता है
- EMI: ₹2000-₹3000/महीना`;
    }

    // English fallback
    return `You are an expert sales agent for Mierae Solar. Your job is to convert customers to solar panel installation.

Important Rules:
- Speak like a human salesperson, not a robot
- Send short, engaging messages (1-3 lines)
- Ask only ONE question at a time
- Always use persuasive language
- Create urgency (limited subsidy)
- Avoid long paragraphs
- Always try to close the lead

Company Information:
- Government subsidy: Up to 40% (max ₹78,000)
- Free electricity: 300 units/month
- Loan available: ~6.75% interest rate
- System life: ~25 years
- 3kW system reduces bill to near zero
- EMI: ₹2000-₹3000/month`;
  }

  /**
   * Get stage-specific prompt
   */
  getStagePrompt(language, stage, action, userData) {
    const prompts = {
      hindi: {
        HOOK: `अभी HOOK स्टेज में हैं। ग्राहक का ध्यान आकर्षित करें:
- उनके हाई बिजली बिल के बारे में पूछें
- ₹2000-₹5000 महीने की बर्बादी की बात करें
- दर्द बनाएं फिर क्वालिफिकेशन शुरू करें`,

        QUALIFICATION_BILL: `पहला क्वालिफिकेशन सवाल पूछें:
"आपका मासिक बिजली का बिल कितना आता है? (लगभग बताएं)"`,

        QUALIFICATION_HOUSE: `दूसरा क्वालिफिकेशन सवाल पूछें:
"क्या आपका खुद का घर है या किराये का?"`,

        QUALIFICATION_ROOF: `तीसरा क्वालिफिकेशन सवाल पूछें:
"क्या आपके पास छत पर जगह है?"`,

        QUALIFICATION_CITY: `चौथा क्वालिफिकेशन सवाल पूछें:
"आप किस शहर में रहते हैं?"`,

        VALUE_PITCH: `अब वैल्यू पिच दें। बिल: ₹${userData.monthlyBill || 'X'}/महीना के आधार पर:
- 40% सब्सिडी (₹78,000 तक)
- 25 साल की लंबी बचत
- लगभग शून्य बिजली बिल
- EMI पर उपलब्ध
संक्षिप्त और मनाने वाला रहें!`,

        OBJECTION_HANDLING: `आपत्ति को संभालें: ${action?.objectionType || 'general'}
- महंगा: "EMI ₹2000-₹3000/महीना, आपके बिल से कम!"
- अनिश्चित: "फ्री साइट विज़िट, कोई कमिटमेंट नहीं"
- समय नहीं: "हम सब संभालते हैं, आप आराम करें"`,

        CLOSING: `क्लोजिंग का प्रयास करें:
"क्या मैं आपके लिए एक FREE साइट विज़िट बुक कर दूं? हमारे एक्सपर्ट आकर सब समझा देंगे।"`,

        LEAD_CAPTURE_NAME: `नाम पूछें:
"बढ़िया! मुझे आपका नाम बताएं?"`,

        LEAD_CAPTURE_PHONE: `फोन नंबर पूछें:
"और आपका मोबाइल नंबर? मैं आपको कल ही कॉल करवा दूंगा।"`,

        COMPLETED: `धन्यवाद संदेश:
"बहुत बढ़िया ${userData.name || ''}जी! हमारी टीम जल्द ही आपसे संपर्क करेगी। सोलर में आपका स्वागत है! 🌞"`
      },

      english: {
        HOOK: `Now in HOOK stage. Grab customer attention:
- Ask about their high electricity bill
- Talk about ₹2000-₹5000 monthly waste
- Create pain then start qualification`,

        QUALIFICATION_BILL: `Ask first qualification question:
"What's your monthly electricity bill? (approximately)"`,

        QUALIFICATION_HOUSE: `Ask second qualification question:
"Do you own your house or is it rented?"`,

        QUALIFICATION_ROOF: `Ask third qualification question:
"Do you have roof space available?"`,

        QUALIFICATION_CITY: `Ask fourth qualification question:
"Which city do you live in?"`,

        VALUE_PITCH: `Now give value pitch. Based on bill: ₹${userData.monthlyBill || 'X'}/month:
- 40% subsidy (up to ₹78,000)
- 25 years of long-term savings
- Almost zero electricity bill
- Available on EMI
Keep it short and persuasive!`,

        OBJECTION_HANDLING: `Handle objection: ${action?.objectionType || 'general'}
- Expensive: "EMI ₹2000-₹3000/month, less than your bill!"
- Uncertain: "Free site visit, no commitment"
- No time: "We handle everything, you relax"`,

        CLOSING: `Attempt closing:
"Can I book a FREE site visit for you? Our experts will come and explain everything."`,

        LEAD_CAPTURE_NAME: `Ask for name:
"Great! What's your name?"`,

        LEAD_CAPTURE_PHONE: `Ask for phone:
"And your mobile number? I'll have someone call you tomorrow."`,

        COMPLETED: `Thank you message:
"Excellent ${userData.name || ''}! Our team will contact you soon. Welcome to solar! 🌞"`
      }
    };

    const langPrompts = prompts[language] || prompts.english;
    return langPrompts[stage] || langPrompts.HOOK;
  }
}

module.exports = LLMService;
