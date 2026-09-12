// ============================================
// AI ROUTES - Gemini API Integration
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
// 1. GENERATE RECIPE FROM INGREDIENTS
// POST /api/ai/generate-recipe
// ============================================

router.post('/generate-recipe', authenticate, async (req, res) => {
    try {
        // ─── STEP 1: Get input from user ───
        const { ingredients, cuisine } = req.body;
        const userId = req.userId; // From JWT token

        console.log('═══════════════════════════════════════════');
        console.log('📥 New AI Recipe Request');
        console.log('📋 Ingredients:', ingredients);
        console.log('🌍 Cuisine:', cuisine || 'Any');
        console.log('👤 User ID:', userId);
        console.log('═══════════════════════════════════════════');

        // ─── STEP 2: Validate input ───
        if (!ingredients || ingredients.trim().length < 3) {
            return res.status(400).json({
                success: false,
                message: 'Please enter at least one ingredient'
            });
        }

        // ─── STEP 3: Build AI prompt ───
        let prompt = `You are a professional chef. Create a detailed recipe using these ingredients: ${ingredients}.`;

        if (cuisine) {
            prompt += `\nCuisine preference: ${cuisine}.`;
        }

        prompt += `

        Return ONLY valid JSON in this EXACT format, with no other text or markdown:
        {
            "name": "Recipe Name",
            "description": "A brief, appetizing description of the dish",
            "cuisine": "${cuisine || 'Fusion'}",
            "difficulty": "Easy/Medium/Hard",
            "prep_time": 15,
            "cook_time": 30,
            "servings": 4,
            "calories": 350,
            "ingredients": [
                {"name": "ingredient1", "quantity": "2", "unit": "cups"},
                {"name": "ingredient2", "quantity": "500", "unit": "g"}
            ],
            "instructions": "Step 1\\nStep 2\\nStep 3\\nStep 4",
            "tips": "Optional cooking tips"
        }`;

        console.log('🤖 Calling Gemini API with model: gemini-3.6-flash');

        // ─── STEP 4: Call Gemini API ───
        let aiResponse;
        let usedFallback = false;

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-3.6-flash', // ✅ CURRENT MODEL
                contents: prompt,
            });

            aiResponse = response.text;
            console.log('✅ AI response received');
            console.log('📝 Response length:', aiResponse.length, 'characters');

        } catch (aiError) {
            console.error('❌ AI API Error:', aiError.message);
            usedFallback = true;

            // Fallback recipe if AI fails
            const ingredientsList = ingredients.split(',').map(i => i.trim());
            aiResponse = JSON.stringify({
                name: `${ingredientsList[0].charAt(0).toUpperCase() + ingredientsList[0].slice(1)} Delight`,
                description: `A delicious recipe using ${ingredients}`,
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
                [userId, ingredients]
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
                model: 'gemini-3.6-flash',
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