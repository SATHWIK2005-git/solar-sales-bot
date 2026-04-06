const ChatbotController = require('./ChatbotController');

/**
 * Test script to simulate a conversation flow
 * Run: npm test
 */

async function testConversation() {
  console.log('🧪 Testing Mierae Solar Chatbot...\n');

  const chatbot = new ChatbotController();

  try {
    // Step 1: Start conversation
    console.log('📞 Starting conversation in Hindi...');
    const startResult = await chatbot.startConversation('hindi');
    console.log(`Bot: ${startResult.message}\n`);

    const sessionId = startResult.sessionId;

    // Step 2: User responds to hook
    console.log('👤 User: हाँ, मेरा बिल बहुत ज्यादा आता है\n');
    let response = await chatbot.processMessage(sessionId, 'हाँ, मेरा बिल बहुत ज्यादा आता है');
    console.log(`🤖 Bot: ${response.message}`);
    console.log(`📊 Stage: ${response.stage}\n`);

    // Step 3: Answer monthly bill
    await sleep(1000);
    console.log('👤 User: लगभग 4000 रुपये\n');
    response = await chatbot.processMessage(sessionId, 'लगभग 4000 रुपये');
    console.log(`🤖 Bot: ${response.message}`);
    console.log(`📊 Stage: ${response.stage}\n`);

    // Step 4: Answer house type
    await sleep(1000);
    console.log('👤 User: खुद का घर है\n');
    response = await chatbot.processMessage(sessionId, 'खुद का घर है');
    console.log(`🤖 Bot: ${response.message}`);
    console.log(`📊 Stage: ${response.stage}\n`);

    // Step 5: Answer roof space
    await sleep(1000);
    console.log('👤 User: हाँ, जगह है\n');
    response = await chatbot.processMessage(sessionId, 'हाँ, जगह है');
    console.log(`🤖 Bot: ${response.message}`);
    console.log(`📊 Stage: ${response.stage}\n`);

    // Step 6: Answer city
    await sleep(1000);
    console.log('👤 User: दिल्ली\n');
    response = await chatbot.processMessage(sessionId, 'दिल्ली');
    console.log(`🤖 Bot: ${response.message}`);
    console.log(`📊 Stage: ${response.stage}\n`);

    // Step 7: Respond to value pitch
    await sleep(1000);
    console.log('👤 User: ये तो अच्छा लग रहा है\n');
    response = await chatbot.processMessage(sessionId, 'ये तो अच्छा लग रहा है');
    console.log(`🤖 Bot: ${response.message}`);
    console.log(`📊 Stage: ${response.stage}\n`);

    // Step 8: Accept site visit
    await sleep(1000);
    console.log('👤 User: हाँ, बुक कर दीजिये\n');
    response = await chatbot.processMessage(sessionId, 'हाँ, बुक कर दीजिये');
    console.log(`🤖 Bot: ${response.message}`);
    console.log(`📊 Stage: ${response.stage}\n`);

    // Step 9: Provide name
    await sleep(1000);
    console.log('👤 User: राज कुमार\n');
    response = await chatbot.processMessage(sessionId, 'राज कुमार');
    console.log(`🤖 Bot: ${response.message}`);
    console.log(`📊 Stage: ${response.stage}\n`);

    // Step 10: Provide phone
    await sleep(1000);
    console.log('👤 User: 9876543210\n');
    response = await chatbot.processMessage(sessionId, '9876543210');
    console.log(`🤖 Bot: ${response.message}`);
    console.log(`📊 Stage: ${response.stage}`);
    console.log(`💾 Lead Saved: ${response.leadSaved ? '✓ Yes' : '✗ No'}\n`);

    // Display user data collected
    console.log('═══════════════════════════════════════');
    console.log('📋 User Data Collected:');
    console.log('═══════════════════════════════════════');
    console.log(JSON.stringify(response.userData, null, 2));
    console.log('═══════════════════════════════════════\n');

    // Get lead stats
    const stats = await chatbot.getLeadStats();
    console.log('📊 Lead Statistics:');
    console.log(JSON.stringify(stats, null, 2));

    console.log('\n✅ Test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Run test
testConversation();
