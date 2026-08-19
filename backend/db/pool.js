const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({
    host: process.env.DB_HOST,        
    port: process.env.DB_PORT,        // Which port? (5432 is default)
    user: process.env.DB_USER,        // Username (postgres)
    password: process.env.DB_PASSWORD, // Password (root)
    database: process.env.DB_NAME,    // Which database? (ai_recipe_finder)
});
pool.connect((err, client, release) => {
    

    if (err) {
        // ❌ 
        console.error('❌ Database connection failed:', err.stack);
    } else {
        // ✅ If successful
        console.log('✅ Connected to PostgreSQL successfully!');
        release(); 
    }
});
module.exports = pool;