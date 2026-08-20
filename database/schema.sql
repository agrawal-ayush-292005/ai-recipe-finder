-- ==========================================
-- FILE: backend/db/schema.sql
-- Complete Database Schema for AI Recipe Finder
-- ==========================================

-- 1. Create Database (if not exists)
CREATE DATABASE ai_recipe_finder;

-- 2. Connect to database
\c ai_recipe_finder;

-- 3. Drop existing tables (if they exist)
DROP TABLE IF EXISTS search_history;
DROP TABLE IF EXISTS favorites;
DROP TABLE IF EXISTS recipes;
DROP TABLE IF EXISTS users;

-- 4. Create Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Create Recipes Table
CREATE TABLE recipes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    ingredients TEXT[] NOT NULL,
    instructions TEXT NOT NULL,
    prep_time INTEGER,
    cook_time INTEGER,
    servings INTEGER,
    difficulty VARCHAR(20) CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Create Favorites Table
CREATE TABLE favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    recipe_id INTEGER REFERENCES recipes(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, recipe_id)
);

-- 7. Create Search History Table
CREATE TABLE search_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    searched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Create Indexes for Performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_recipes_user_id ON recipes(user_id);
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_recipe_id ON favorites(recipe_id);
CREATE INDEX idx_search_history_user_id ON search_history(user_id);

-- 9. Insert Sample Data
INSERT INTO users (username, email, password_hash) 
VALUES ('testuser', 'test@email.com', '$2b$10$X5kM3...this_will_be_hashed_later');

INSERT INTO recipes (user_id, title, description, ingredients, instructions, prep_time, cook_time, servings, difficulty) 
VALUES 
(1, 'Spaghetti Carbonara', 'Classic Italian pasta dish with creamy egg sauce',
 ARRAY['Spaghetti', 'Eggs', 'Pancetta', 'Parmesan Cheese', 'Black Pepper'],
 '1. Boil pasta\n2. Cook pancetta\n3. Mix eggs and cheese\n4. Combine everything',
 15, 20, 4, 'Medium'),
(1, 'Chicken Biryani', 'Fragrant Indian rice dish with spiced chicken',
 ARRAY['Chicken', 'Rice', 'Onions', 'Tomatoes', 'Yogurt', 'Biryani Masala'],
 '1. Marinate chicken\n2. Cook rice\n3. Layer and cook',
 30, 45, 6, 'Hard'),
(1, 'Vegetable Stir Fry', 'Quick and healthy vegetable stir fry',
 ARRAY['Broccoli', 'Carrots', 'Bell Peppers', 'Soy Sauce', 'Garlic'],
 '1. Chop vegetables\n2. Stir fry in wok\n3. Add sauce',
 10, 15, 2, 'Easy');

-- 10. Verify
SELECT 'Users:' as "Table", COUNT(*) as "Count" FROM users
UNION ALL
SELECT 'Recipes:', COUNT(*) FROM recipes
UNION ALL
SELECT 'Favorites:', COUNT(*) FROM favorites
UNION ALL
SELECT 'Search History:', COUNT(*) FROM search_history;