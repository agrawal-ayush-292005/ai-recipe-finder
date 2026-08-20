


const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const pool = require('./db/pool');

// Import routes
const authRoutes = require('./routes/auth');
const recipeRoutes = require('./routes/recipes');
const favoriteRoutes = require('./routes/favorites');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ============================================
// REGISTER ROUTES
// ============================================

app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/favorites', favoriteRoutes);

// ============================================
// TEST ROUTES
// ============================================

// Server test
app.get('/', (req, res) => {
    res.json({
        message: '🍳 AI Recipe Finder API is running!',
        status: 'OK',
        timestamp: new Date().toISOString()
    });
});

// API test
app.get('/api/test', (req, res) => {
    res.json({
        message: 'API is working! 🎉',
        env: process.env.NODE_ENV || 'development'
    });
});

// Database test
app.get('/api/db-test', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW() as current_time');
        const recipeCount = await pool.query('SELECT COUNT(*) as count FROM recipes');
        const userCount = await pool.query('SELECT COUNT(*) as count FROM users');

        res.json({
            success: true,
            message: '✅ Database is connected!',
            database: {
                current_time: result.rows[0].current_time,
                total_recipes: parseInt(recipeCount.rows[0].count),
                total_users: parseInt(userCount.rows[0].count)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '❌ Database connection failed!',
            error: error.message
        });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// ============================================
// ERROR HANDLING MIDDLEWARE
// ============================================

app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error'
    });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
    console.log(`🍳 AI Recipe Finder Server is running!`);
    console.log(`📍 http://localhost:${PORT}`);
    console.log(`📝 Test API: http://localhost:${PORT}/api/test`);
    console.log(`📝 DB Test: http://localhost:${PORT}/api/db-test`);
    console.log(`📝 Recipes: http://localhost:${PORT}/api/recipes`);
    console.log(`📝 Health: http://localhost:${PORT}/api/health`);
});