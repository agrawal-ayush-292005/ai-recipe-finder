// ============================================
// DIRECT TEST - NODE.JS TO GEMINI API
// ============================================

// Load environment variables from .env
require('dotenv').config();

// We'll use the SDK for this test, as it's cleaner
const { GoogleGenAI } = require('@google/genai');

async function testNodeAI() {
    console.log('=================================');
    console.log('🧪 Node.js -> Gemini API Test');
    console.log('=================================');

    // 1. Check if the API key is loaded
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('❌ FAILURE: GEMINI_API_KEY is not defined in your .env file.');
        console.log('💡 Please make sure the file is in the backend folder and named .env');
        return;
    }
    console.log('✅ API Key found. Starts with:', apiKey.substring(0, 15) + '...');

    // 2. Initialize the SDK (it reads the key automatically)
    const ai = new GoogleGenAI({});

    // 3. Define the model we want to use
    // This model MUST exist in the list you got from the curl command
   const modelName = 'gemini-3.6-flash'; 

    // 4. Try the API call
    try {
        console.log(`📡 Attempting to call model: ${modelName}...`);

        const response = await ai.models.generateContent({
            model: modelName,
            contents: 'Say "Hello from Node.js!"',
        });

        console.log('=================================');
        console.log('✅ SUCCESS! Node.js can talk to Gemini.');
        console.log('📝 Response:', response.text);
        console.log('=================================');

    } catch (error) {
        console.error('=================================');
        console.error('❌ FAILURE: The SDK call failed.');
        console.error('Error Message:', error.message);
        console.error('=================================');
        console.log('💡 Troubleshooting:');
        console.log('1. Is your .env file in the /backend folder?');
        console.log('2. Does the model "' + modelName + '" exist in your list?');
        console.log('3. If the error is a network issue, try a different network (mobile hotspot).');
    }
}

// Run the test
testNodeAI();