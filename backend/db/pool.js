// ============================================
// DATABASE CONNECTION POOL
// Works for both local development and production
// ============================================

const { Pool } = require('pg');
require('dotenv').config();

// Determine which connection method to use
let poolConfig;

if (process.env.DATABASE_URL) {
    // ─── PRODUCTION (Render/Supabase) ───
    console.log('🔗 Connecting via DATABASE_URL (production mode)');
    poolConfig = {
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false  // Required for Supabase
        }
    };
} else {
    // ─── DEVELOPMENT (Local PostgreSQL) ───
    console.log('🔗 Connecting via individual DB credentials (development mode)');
    poolConfig = {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'ai_recipe_finder'
    };
}

// Create the pool
const pool = new Pool(poolConfig);

// Test the connection
pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
    } else {
        console.log('✅ Connected to PostgreSQL successfully!');
        console.log(`📊 Database: ${process.env.DATABASE_URL ? 'Supabase (cloud)' : 'Local'}`);
        release();
    }
});

// Handle unexpected errors
pool.on('error', (err) => {
    console.error('❌ Unexpected database error:', err.message);
});

module.exports = pool;