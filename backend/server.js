// ============================================
// SERVER.JS - AI Recipe Finder Backend
// ============================================

// ─── Import required packages ───
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

// ─── Import database connection ───
const pool = require('./db/pool');

// ─── Import routes ───
const authRoutes = require('./routes/auth');
const recipeRoutes = require('./routes/recipes');
const aiRoutes = require('./routes/ai');  // ← STEP 5.3: ADD THIS

// ─── Create Express app ───
const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// MIDDLEWARE
// ============================================

// Security headers
app.use(helmet());

// Enable CORS (allows frontend to talk to backend)
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// ============================================
// REGISTER ROUTES
// ============================================

// Authentication routes (register, login, profile)
app.use('/api/auth', authRoutes);

// Recipe routes (CRUD operations)
app.use('/api/recipes', recipeRoutes);

// AI routes (generate recipe, substitute)  ← STEP 5.5: ADD THIS
app.use('/api/ai', aiRoutes);

// ============================================
// TEST ROUTES
// ============================================

// Home route
app.get('/', (req, res) => {
    res.json({
        message: '🍳 AI Recipe Finder API is running!',
        status: 'OK',
        timestamp: new Date().toISOString()
    });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// Test API
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
        res.json({
            success: true,
            message: '✅ Database is connected!',
            time: result.rows[0].current_time
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '❌ Database connection failed!',
            error: error.message
        });
    }
});

// ============================================
// ERROR HANDLING MIDDLEWARE
// ============================================

app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({
        success: false,
        message: err.message || 'Internal server error'
    });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
    console.log('═══════════════════════════════════════════');
    console.log('🍳 AI Recipe Finder Server');
    console.log('═══════════════════════════════════════════');
    console.log(`📍 Server running at: http://localhost:${PORT}`);
    console.log('');
    console.log('📝 Available Routes:');
    console.log('   ─────────────────────────────────────');
    console.log(`   POST /api/auth/register   - Register user`);
    console.log(`   POST /api/auth/login      - Login user`);
    console.log(`   GET  /api/auth/profile    - Get user profile`);
    console.log(`   ─────────────────────────────────────`);
    console.log(`   GET  /api/recipes         - Get all recipes`);
    console.log(`   GET  /api/recipes/:id     - Get single recipe`);
    console.log(`   POST /api/recipes         - Create recipe`);
    console.log(`   PUT  /api/recipes/:id     - Update recipe`);
    console.log(`   DELETE /api/recipes/:id   - Delete recipe`);
    console.log(`   ─────────────────────────────────────`);
    console.log(`   POST /api/ai/generate-recipe - Generate recipe with AI`);
    console.log(`   POST /api/ai/substitute      - Get ingredient substitutions`);
    console.log(`   ─────────────────────────────────────`);
    console.log(`   GET  /api/health          - Health check`);
    console.log(`   GET  /api/db-test         - Test database`);
    console.log('═══════════════════════════════════════════');
    console.log('✅ Server is ready!');
    console.log('═══════════════════════════════════════════');
});