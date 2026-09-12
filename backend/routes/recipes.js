// ============================================
// RECIPE ROUTES
// ============================================

const express = require('express');
const pool = require('../db/pool');
const authenticate = require('../middleware/auth');
const router = express.Router();

// ============================================
// HELPER FUNCTION: Convert Ingredients to Array
// ============================================

function parseIngredients(ingredients) {
    // Case 1: Already an array
    if (Array.isArray(ingredients)) {
        return ingredients.filter(i => i && i.toString().trim().length > 0);
    }

    // Case 2: String (comma-separated)
    if (typeof ingredients === 'string') {
        return ingredients
            .split(',')
            .map(i => i.trim())
            .filter(i => i.length > 0);
    }

    // Case 3: Anything else (null, undefined)
    return [];
}

// ============================================
// GET ALL RECIPES (Public)
// ============================================
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT r.*, u.username as author
             FROM recipes r
             LEFT JOIN users u ON r.user_id = u.id
             ORDER BY r.created_at DESC`
        );

        res.json({
            success: true,
            count: result.rows.length,
            recipes: result.rows
        });

    } catch (error) {
        console.error('Get recipes error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch recipes'
        });
    }
});

// ============================================
// GET SINGLE RECIPE (Public)
// ============================================
router.get('/:id', async (req, res) => {
    try {
        const recipeId = req.params.id;

        const result = await pool.query(
            `SELECT r.*, u.username as author
             FROM recipes r
             LEFT JOIN users u ON r.user_id = u.id
             WHERE r.id = $1`,
            [recipeId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Recipe not found'
            });
        }

        res.json({
            success: true,
            recipe: result.rows[0]
        });

    } catch (error) {
        console.error('Get recipe error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch recipe'
        });
    }
});

// ============================================
// CREATE RECIPE (Protected)
// ============================================
router.post('/', authenticate, async (req, res) => {
    try {
        const userId = req.userId;
        const {
            title,
            description,
            ingredients,
            instructions,
            prep_time,
            cook_time,
            servings,
            difficulty,
            image_url
        } = req.body;

        // ─── DEBUG LOG ───
        console.log('═══════════════════════════════════════════');
        console.log('📥 CREATE RECIPE REQUEST');
        console.log('📋 Title:', title);
        console.log('📋 Ingredients (raw):', ingredients);
        console.log('📋 Ingredients type:', typeof ingredients);
        console.log('═══════════════════════════════════════════');

        // Validate
        if (!title || !ingredients || !instructions) {
            return res.status(400).json({
                success: false,
                message: 'Title, ingredients, and instructions are required'
            });
        }

        // ─── CONVERT INGREDIENTS TO ARRAY ───
        const ingredientsArray = parseIngredients(ingredients);

        console.log('✅ Ingredients array:', ingredientsArray);
        console.log('📊 Array length:', ingredientsArray.length);
        console.log('═══════════════════════════════════════════');

        // Validate array is not empty
        if (ingredientsArray.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'At least one ingredient is required'
            });
        }

        // Insert recipe with ARRAY
        const result = await pool.query(
            `INSERT INTO recipes 
             (user_id, title, description, ingredients, instructions, 
              prep_time, cook_time, servings, difficulty, image_url) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
             RETURNING *`,
            [
                userId,
                title,
                description || '',
                ingredientsArray, // ← Pass ARRAY, not string!
                instructions,
                prep_time || null,
                cook_time || null,
                servings || null,
                difficulty || 'Medium',
                image_url || null
            ]
        );

        console.log('✅ Recipe saved with ID:', result.rows[0].id);
        console.log('═══════════════════════════════════════════');

        res.status(201).json({
            success: true,
            message: 'Recipe created successfully',
            recipe: result.rows[0]
        });

    } catch (error) {
        console.error('❌ Create recipe error:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to create recipe',
            error: error.message
        });
    }
});

// ============================================
// UPDATE RECIPE (Protected - Owner only)
// ============================================
router.put('/:id', authenticate, async (req, res) => {
    try {
        const userId = req.userId;
        const recipeId = req.params.id;
        const {
            title,
            description,
            ingredients,
            instructions,
            prep_time,
            cook_time,
            servings,
            difficulty,
            image_url
        } = req.body;

        console.log('═══════════════════════════════════════════');
        console.log('📝 UPDATE RECIPE REQUEST');
        console.log('📋 Recipe ID:', recipeId);
        console.log('📋 Ingredients (raw):', ingredients);
        console.log('═══════════════════════════════════════════');

        // Validate
        if (!title || !ingredients || !instructions) {
            return res.status(400).json({
                success: false,
                message: 'Title, ingredients, and instructions are required'
            });
        }

        // Check if recipe exists and belongs to user
        const checkResult = await pool.query(
            'SELECT * FROM recipes WHERE id = $1 AND user_id = $2',
            [recipeId, userId]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Recipe not found or you don\'t have permission'
            });
        }

        // ─── CONVERT INGREDIENTS TO ARRAY ───
        const ingredientsArray = parseIngredients(ingredients);

        console.log('✅ Ingredients array:', ingredientsArray);

        // Update recipe
        const result = await pool.query(
            `UPDATE recipes 
             SET title = $1, description = $2, ingredients = $3, instructions = $4, 
                 prep_time = $5, cook_time = $6, servings = $7, difficulty = $8, image_url = $9
             WHERE id = $10 AND user_id = $11
             RETURNING *`,
            [
                title,
                description || '',
                ingredientsArray, // ← Pass ARRAY
                instructions,
                prep_time || null,
                cook_time || null,
                servings || null,
                difficulty || 'Medium',
                image_url || null,
                recipeId,
                userId
            ]
        );

        console.log('✅ Recipe updated');

        res.json({
            success: true,
            message: 'Recipe updated successfully',
            recipe: result.rows[0]
        });

    } catch (error) {
        console.error('❌ Update recipe error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update recipe',
            error: error.message
        });
    }
});

// ============================================
// DELETE RECIPE (Protected - Owner only)
// ============================================
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const userId = req.userId;
        const recipeId = req.params.id;

        // Check if recipe exists and belongs to user
        const checkResult = await pool.query(
            'SELECT * FROM recipes WHERE id = $1 AND user_id = $2',
            [recipeId, userId]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Recipe not found or you don\'t have permission'
            });
        }

        // Delete recipe
        await pool.query(
            'DELETE FROM recipes WHERE id = $1 AND user_id = $2',
            [recipeId, userId]
        );

        res.json({
            success: true,
            message: 'Recipe deleted successfully'
        });

    } catch (error) {
        console.error('Delete recipe error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete recipe'
        });
    }
});

// ============================================
// SEARCH RECIPES (Public)
// ============================================
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || q.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }

        const searchTerm = `%${q.trim()}%`;

        const result = await pool.query(
            `SELECT r.*, u.username as author,
             CASE 
                 WHEN r.title ILIKE $1 THEN 3
                 WHEN r.description ILIKE $1 THEN 2
                 WHEN EXISTS (
                     SELECT 1 FROM unnest(r.ingredients) AS ing 
                     WHERE ing ILIKE $1
                 ) THEN 1
                 ELSE 0
             END as relevance
             FROM recipes r
             LEFT JOIN users u ON r.user_id = u.id
             WHERE r.title ILIKE $1 
                OR r.description ILIKE $1
                OR EXISTS (
                    SELECT 1 FROM unnest(r.ingredients) AS ing 
                    WHERE ing ILIKE $1
                )
             ORDER BY relevance DESC, r.created_at DESC`,
            [searchTerm]
        );

        res.json({
            success: true,
            count: result.rows.length,
            query: q,
            recipes: result.rows
        });

    } catch (error) {
        console.error('Search recipes error:', error);
        res.status(500).json({
            success: false,
            message: 'Search failed'
        });
    }
});

module.exports = router;