// ============================================
// AI ROUTES - Gemini API Integration
// Multi-language support: en / hi / kn / mr
// Model: gemini-3.6-flash
// ============================================

// ─── Import #1: Express ───
// Used to create route handlers
const express = require('express');

// ─── Import #2: Google GenAI SDK ───
// Official Google SDK for Gemini API
const { GoogleGenAI } = require('@google/genai');

// ─── Import #3: Authentication Middleware ───
// Checks if user is logged in via JWT
const authenticate = require('../middleware/auth');

// ─── Import #4: Database Pool ───
// For saving search history
const pool = require('../db/pool');

// ─── Import #5: Router ───
// Creates a mini-app for routes
const router = express.Router();

// ─── Import #6: dotenv ───
// Loads environment variables from .env
require('dotenv').config();

// ============================================
// INITIALIZE GEMINI CLIENT
// ============================================

// The SDK automatically reads GEMINI_API_KEY
// from process.env (loaded by dotenv)
const ai = new GoogleGenAI({});

// ============================================
// LANGUAGE MAPS
// ============================================

// Maps frontend language code → full language name for Gemini prompt
const LANGUAGE_NAMES = {
    en: 'English',
    hi: 'Hindi',
    kn: 'Kannada',
    mr: 'Marwari'
};

const DEFAULT_LANGUAGE = 'English';

// ============================================
// 1. GENERATE RECIPE FROM INGREDIENTS
// POST /api/ai/generate-recipe
// ============================================

router.post('/generate-recipe', authenticate, async (req, res) => {
    try {
        // ─── STEP 1: Get input from user ───
        const { ingredients, cuisine, language } = req.body;
        const userId = req.userId; // From JWT token

        // Resolve target language
        const langCode = (language || 'en').toLowerCase();
        const targetLanguage = LANGUAGE_NAMES[langCode] || DEFAULT_LANGUAGE;

        console.log('═══════════════════════════════════════════');
        console.log('📥 New AI Recipe Request');
        console.log('📋 Ingredients:', ingredients);
        console.log('🌍 Cuisine:', cuisine || 'Any');
        console.log('🗣️ Language:', targetLanguage, `(${langCode})`);
        console.log('👤 User ID:', userId);
        console.log('═══════════════════════════════════════════');

        // ─── STEP 2: Validate input ───
        if (!ingredients || ingredients.trim().length < 3) {
            return res.status(400).json({
                success: false,
                message: 'Please enter at least one ingredient'
            });
        }

        // ─── STEP 3: Build AI prompt (language-aware) ───
        let prompt = `You are a professional chef. Create a detailed recipe using these ingredients: ${ingredients}.`;

        if (cuisine) {
            prompt += `\nCuisine preference: ${cuisine}.`;
        }

        prompt += `

CRITICAL INSTRUCTION — LANGUAGE:
You MUST respond ONLY in ${targetLanguage}.
Every field of the JSON below — the recipe name, description, ingredient names, units, instructions, and tips — must be written in ${targetLanguage}.
Do NOT mix languages. Do NOT add English translations in parentheses.
If the language is Hindi, use Devanagari script. If Kannada, use Kannada script. If Marwari, use Devanagari script.

Return ONLY valid JSON in this EXACT format, with no other text or markdown:
{
    "name": "Recipe Name in ${targetLanguage}",
    "description": "A brief, appetizing description in ${targetLanguage}",
    "cuisine": "${cuisine || 'Fusion'}",
    "difficulty": "Easy/Medium/Hard",
    "prep_time": 15,
    "cook_time": 30,
    "servings": 4,
    "calories": 350,
    "ingredients": [
        {"name": "ingredient1 in ${targetLanguage}", "quantity": "2", "unit": "cups"},
        {"name": "ingredient2 in ${targetLanguage}", "quantity": "500", "unit": "g"}
    ],
    "instructions": "Step 1 in ${targetLanguage}\\nStep 2 in ${targetLanguage}\\nStep 3 in ${targetLanguage}\\nStep 4 in ${targetLanguage}",
    "tips": "Optional cooking tips in ${targetLanguage}"
}`;

        console.log('🤖 Calling Gemini API with model: gemini-3.6-flash');

        // ─── STEP 4: Call Gemini API ───
        let aiResponse;
        let usedFallback = false;

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-3.6-flash', // ✅ YOUR MODEL — UNCHANGED
                contents: prompt,
            });

            aiResponse = response.text;
            console.log('✅ AI response received');
            console.log('📝 Response length:', aiResponse.length, 'characters');

        } catch (aiError) {
            console.error('❌ AI API Error:', aiError.message);
            usedFallback = true;

            // Fallback recipe if AI fails (localized where possible)
            const ingredientsList = ingredients.split(',').map(i => i.trim());

            const fallbackNames = {
                en: `${ingredientsList[0].charAt(0).toUpperCase() + ingredientsList[0].slice(1)} Delight`,
                hi: `${ingredientsList[0]} डिलाइट`,
                kn: `${ingredientsList[0]} ಡಿಲೈಟ್`,
                mr: `${ingredientsList[0]} डिलाइट`
            };

            const fallbackDesc = {
                en: `A delicious recipe using ${ingredients}`,
                hi: `${ingredients} से बनी स्वादिष्ट रेसिपी`,
                kn: `${ingredients} ಬಳಸಿ ರುಚಿಕರವಾದ ಪಾಕವಿಧಾನ`,
                mr: `${ingredients} सूं बणी स्वादिष्ट रेसिपी`
            };

            aiResponse = JSON.stringify({
                name: fallbackNames[langCode] || fallbackNames.en,
                description: fallbackDesc[langCode] || fallbackDesc.en,
                cuisine: cuisine || 'Fusion',
                difficulty: 'Easy',
                prep_time: 15,
                cook_time: 25,
                servings: 2,
                calories: 300,
                ingredients: ingredientsList.map(ing => ({
                    name: ing,
                    quantity: 'to taste',
                    unit: ''
                })),
                instructions: `1. Prepare all ingredients.\n2. Heat oil in a pan.\n3. Add ${ingredientsList.join(', ')}.\n4. Cook for 15-20 minutes.\n5. Season to taste.\n6. Serve hot!`,
                tips: 'Add your favorite spices to enhance the flavor.'
            });
        }

        // ─── STEP 5: Clean AI response ───
        let cleanedResponse = aiResponse;

        // Remove markdown code blocks if present
        if (aiResponse.includes('```json')) {
            cleanedResponse = aiResponse.replace(/```json\n/g, '').replace(/```\n?/g, '');
        } else if (aiResponse.includes('```')) {
            cleanedResponse = aiResponse.replace(/```\n?/g, '');
        }

        // ─── STEP 6: Parse JSON ───
        let recipeData;
        try {
            recipeData = JSON.parse(cleanedResponse);
            console.log('✅ Recipe parsed successfully');
            console.log('📛 Recipe name:', recipeData.name);

            // Normalize ingredients array (allow strings or objects)
            if (!Array.isArray(recipeData.ingredients)) {
                recipeData.ingredients = [recipeData.ingredients];
            }
            recipeData.ingredients = recipeData.ingredients.map(ing => {
                if (typeof ing === 'string') {
                    return { name: ing, quantity: '', unit: '' };
                }
                return {
                    name: ing.name || '',
                    quantity: ing.quantity || '',
                    unit: ing.unit || ''
                };
            });

        } catch (parseError) {
            console.error('❌ Failed to parse AI response');
            console.error('Raw response:', cleanedResponse.substring(0, 200));

            const ingredientsList = ingredients.split(',').map(i => i.trim());
            recipeData = {
                name: `Quick ${ingredientsList.join(' & ')}`,
                description: `A simple recipe using your ingredients`,
                cuisine: cuisine || 'Simple',
                difficulty: 'Easy',
                prep_time: 10,
                cook_time: 20,
                servings: 2,
                calories: 250,
                ingredients: ingredientsList.map(ing => ({
                    name: ing,
                    quantity: 'to taste',
                    unit: ''
                })),
                instructions: `1. Prepare your ingredients.\n2. Cook everything together.\n3. Season to taste.\n4. Enjoy!`,
                tips: 'Experiment with different seasonings.'
            };
        }

        // ─── STEP 7: Save to database ───
        try {
            await pool.query(
                'INSERT INTO search_history (user_id, query) VALUES ($1, $2)',
                [userId, `${ingredients} [${langCode}]`]
            );
            console.log('✅ Search history saved');
        } catch (dbError) {
            console.error('⚠️ Could not save history:', dbError.message);
            // Don't fail the request if history save fails
        }

        // ─── STEP 8: Send response ───
        console.log('📤 Sending response to frontend');
        console.log('═══════════════════════════════════════════');

        res.json({
            success: true,
            generated: !usedFallback,
            recipe: recipeData,
            language: langCode,
            searched_ingredients: ingredients
        });

    } catch (error) {
        console.error('❌ AI Generation Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate recipe',
            error: error.message
        });
    }
});

// ============================================
// 2. GET INGREDIENT SUBSTITUTIONS
// POST /api/ai/substitute
// ============================================

router.post('/substitute', authenticate, async (req, res) => {
    try {
        const { ingredient } = req.body;

        if (!ingredient || ingredient.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Please enter an ingredient'
            });
        }

        const prompt = `
        Suggest 5 substitutes for ${ingredient} in cooking.
        Consider dietary restrictions, flavor, and texture.

        Return ONLY valid JSON:
        {
            "substitutes": [
                {"name": "Substitute 1", "ratio": "1:1", "usage": "Works well in most recipes"},
                {"name": "Substitute 2", "ratio": "1:1", "usage": "Best for baking"}
            ]
        }`;

        let substitutes;
        let usedFallback = false;

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-3.6-flash', // ✅ YOUR MODEL — UNCHANGED
                contents: prompt,
            });

            let aiResponse = response.text;

            if (aiResponse.includes('```json')) {
                aiResponse = aiResponse.replace(/```json\n/g, '').replace(/```\n?/g, '');
            }

            substitutes = JSON.parse(aiResponse);

        } catch (error) {
            console.error('Substitute API Error:', error.message);
            usedFallback = true;

            substitutes = {
                substitutes: [
                    { name: 'Olive Oil', ratio: '1:1', usage: 'Great for cooking and dressings' },
                    { name: 'Coconut Oil', ratio: '1:1', usage: 'Best for baking and frying' },
                    { name: 'Avocado Oil', ratio: '1:1', usage: 'Good for high-heat cooking' },
                    { name: 'Butter', ratio: '1:1', usage: 'Adds richness and flavor' },
                    { name: 'Ghee', ratio: '1:1', usage: 'Perfect for Indian cuisine' }
                ]
            };
        }

        res.json({
            success: true,
            ingredient: ingredient,
            substitutes: substitutes.substitutes,
            generated: !usedFallback
        });

    } catch (error) {
        console.error('Substitution Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get substitutions'
        });
    }
});

module.exports = router;