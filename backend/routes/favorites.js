const express = require('express');
const pool = require('../db/pool');
const authenticate = require('../middleware/auth');
const router = express.Router();

// ============================================
// ADD TO FAVORITES (Protected)
// ============================================
router.post('/', authenticate, async (req, res) => {
    try {
        const userId = req.userId;
        const { recipe_id } = req.body;

        if (!recipe_id) {
            return res.status(400).json({
                success: false,
                message: 'Recipe ID is required'
            });
        }

        // Check if recipe exists
        const recipeCheck = await pool.query(
            'SELECT id FROM recipes WHERE id = $1',
            [recipe_id]
        );

        if (recipeCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Recipe not found'
            });
        }

        // Add to favorites
        const result = await pool.query(
            `INSERT INTO favorites (user_id, recipe_id) 
             VALUES ($1, $2) 
             ON CONFLICT (user_id, recipe_id) DO NOTHING
             RETURNING *`,
            [userId, recipe_id]
        );

        if (result.rows.length === 0) {
            return res.status(409).json({
                success: false,
                message: 'Recipe already in favorites'
            });
        }

        res.status(201).json({
            success: true,
            message: 'Recipe added to favorites',
            favorite: result.rows[0]
        });

    } catch (error) {
        console.error('Add favorite error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add to favorites'
        });
    }
});

// ============================================
// GET USER'S FAVORITES (Protected)
// ============================================
router.get('/', authenticate, async (req, res) => {
    try {
        const userId = req.userId;

        const result = await pool.query(
            `SELECT r.*, u.username as author, f.created_at as favorited_at
             FROM favorites f
             JOIN recipes r ON f.recipe_id = r.id
             LEFT JOIN users u ON r.user_id = u.id
             WHERE f.user_id = $1
             ORDER BY f.created_at DESC`,
            [userId]
        );

        res.json({
            success: true,
            count: result.rows.length,
            favorites: result.rows
        });

    } catch (error) {
        console.error('Get favorites error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch favorites'
        });
    }
});

// ============================================
// REMOVE FROM FAVORITES (Protected)
// ============================================
router.delete('/:recipe_id', authenticate, async (req, res) => {
    try {
        const userId = req.userId;
        const recipeId = req.params.recipe_id;

        const result = await pool.query(
            'DELETE FROM favorites WHERE user_id = $1 AND recipe_id = $2 RETURNING *',
            [userId, recipeId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Favorite not found'
            });
        }

        res.json({
            success: true,
            message: 'Removed from favorites'
        });

    } catch (error) {
        console.error('Remove favorite error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to remove from favorites'
        });
    }
});

module.exports = router;