const express = require('express');
const cors = require('cors');
require('dotenv').config();

// ✅ ADD THIS: Import database connection
const pool = require('./db/pool');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());

app.get('/', (req, res) => {
    res.json({
        message: 'AI Recipe Finder API is running!',
        status: 'OK',
        timestamp: new Date().toISOString()
    });
});

app.get('/api/test', (req, res) => {
    res.json({
        message: 'API is working! 🎉',
        env: process.env.NODE_ENV || 'development'
    });
});

// ✅ ADD THIS: Database test route (optional - just to verify connection)
app.get('/api/db-test', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW() as current_time');
        res.json({
            success: true,
            message: 'Database connected!',
            time: result.rows[0].current_time
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📝 Test API at http://localhost:${PORT}/api/test`);
    console.log(`✅ Server is now listening for requests`);
});
