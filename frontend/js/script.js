// ============================================
// AI RECIPE FINDER - COMPLETE JAVASCRIPT
// ============================================

// ============================================
// CONFIGURATION
// ============================================

const API_URL = 'https://ai-recipe-finder-7p11.onrender.com/api';

// ============================================
// STATE MANAGEMENT
// ============================================

let authToken = localStorage.getItem('token') || null;
let currentUser = JSON.parse(localStorage.getItem('user')) || null;
let pantry = JSON.parse(localStorage.getItem('pantry')) || [];
let currentAIRecipe = null;

// ============================================
// SAMPLE INDIAN RECIPES DATA (Fallback)
// ============================================

const sampleRecipes = [
    {
        id: 1,
        title: 'Butter Chicken',
        source: 'authenticindianrecipes.com',
        cuisine: 'Indian',
        image: '🍛',
        tags: ['North Indian', 'Non-Veg', 'Popular'],
        ingredients: ['Chicken (500g)', 'Butter (50g)', 'Tomato Puree (2 cups)', 'Heavy Cream (1/2 cup)', 'Ginger-Garlic Paste', 'Red Chili Powder', 'Garam Masala', 'Kasuri Methi'],
        instructions: '1. Marinate chicken with ginger-garlic paste, chili powder, and salt for 30 minutes.\n2. Heat butter in a pan and cook the marinated chicken until golden brown.\n3. Add tomato puree and cook for 10 minutes.\n4. Add garam masala and sugar, simmer for 15 minutes.\n5. Stir in heavy cream and kasuri methi.\n6. Cook for 5 more minutes.\n7. Garnish with fresh coriander and serve hot.',
        prep_time: 20,
        cook_time: 35,
        servings: 4,
        difficulty: 'Medium',
        rating: 4.9,
        reviews: 156,
        calories: 450
    },
    {
        id: 2,
        title: 'Chicken Biryani',
        source: 'biryaniwala.com',
        cuisine: 'Indian',
        image: '🍚',
        tags: ['Hyderabadi', 'Non-Veg', 'Festival'],
        ingredients: ['Chicken (1 kg)', 'Basmati Rice (2 cups)', 'Onions (3 large)', 'Yogurt (1 cup)', 'Ginger-Garlic Paste', 'Biryani Masala', 'Saffron', 'Mint Leaves'],
        instructions: '1. Marinate chicken with yogurt, ginger-garlic paste, and biryani masala for 2 hours.\n2. Soak rice for 30 minutes, then boil until 70% cooked.\n3. Fry onions until golden brown.\n4. Layer the marinated chicken, rice, fried onions, mint, and coriander.\n5. Add saffron soaked in milk.\n6. Seal the pot and cook on low flame for 20 minutes.\n7. Let it rest for 10 minutes before serving.',
        prep_time: 30,
        cook_time: 40,
        servings: 6,
        difficulty: 'Hard',
        rating: 4.8,
        reviews: 203,
        calories: 550
    },
    {
        id: 3,
        title: 'Dal Makhani',
        source: 'punjabirecipes.com',
        cuisine: 'Indian',
        image: '🥘',
        tags: ['Punjabi', 'Vegetarian', 'Popular'],
        ingredients: ['Whole Black Lentils (1 cup)', 'Kidney Beans (1/4 cup)', 'Butter (4 tbsp)', 'Cream (1/2 cup)', 'Tomato Puree (1 cup)', 'Ginger-Garlic Paste', 'Garam Masala'],
        instructions: '1. Soak lentils and kidney beans overnight.\n2. Pressure cook until soft and mushy.\n3. Heat butter and sauté ginger-garlic paste.\n4. Add tomato puree and cook for 5 minutes.\n5. Add the cooked lentils and beans.\n6. Simmer for 30 minutes on low heat.\n7. Add cream and garam masala.\n8. Cook for 10 more minutes.',
        prep_time: 15,
        cook_time: 45,
        servings: 4,
        difficulty: 'Easy',
        rating: 4.7,
        reviews: 189,
        calories: 380
    },
    {
        id: 4,
        title: 'Chole Bhature',
        source: 'delhistreetfood.com',
        cuisine: 'Indian',
        image: '🫓',
        tags: ['North Indian', 'Vegetarian', 'Street Food'],
        ingredients: ['Chickpeas (2 cups)', 'Onions (2 large)', 'Tomatoes (2 medium)', 'Ginger-Garlic Paste', 'Chole Masala', 'Tea Bags (for color)'],
        instructions: '1. Soak chickpeas overnight with tea bags for color.\n2. Pressure cook chickpeas until soft.\n3. Sauté onions, ginger-garlic paste.\n4. Add tomatoes and cook until soft.\n5. Add chole masala and salt.\n6. Add cooked chickpeas and simmer for 20 minutes.\n7. Serve hot with bhature.',
        prep_time: 20,
        cook_time: 35,
        servings: 4,
        difficulty: 'Medium',
        rating: 4.6,
        reviews: 134,
        calories: 520
    },
    {
        id: 5,
        title: 'Chicken Tikka Masala',
        source: 'indianfoodforever.com',
        cuisine: 'Indian',
        image: '🍲',
        tags: ['North Indian', 'Non-Veg', 'Popular'],
        ingredients: ['Chicken (500g)', 'Yogurt (1 cup)', 'Tikka Masala (2 tbsp)', 'Tomato Puree (1.5 cups)', 'Heavy Cream (1/2 cup)', 'Butter (2 tbsp)'],
        instructions: '1. Marinate chicken with yogurt and tikka masala for 2 hours.\n2. Grill or bake until charred.\n3. Heat butter and sauté ginger-garlic paste.\n4. Add tomato puree and cook for 8-10 minutes.\n5. Add the grilled chicken pieces.\n6. Simmer for 15 minutes.\n7. Add cream and cook for 5 minutes.',
        prep_time: 25,
        cook_time: 30,
        servings: 4,
        difficulty: 'Medium',
        rating: 4.8,
        reviews: 178,
        calories: 480
    },
    {
        id: 6,
        title: 'Palak Paneer',
        source: 'vegetarianrecipes.in',
        cuisine: 'Indian',
        image: '🥬',
        tags: ['North Indian', 'Vegetarian', 'Healthy'],
        ingredients: ['Spinach (500g)', 'Paneer (250g)', 'Onions (2 medium)', 'Tomatoes (2 medium)', 'Ginger-Garlic Paste', 'Garam Masala', 'Cumin Seeds'],
        instructions: '1. Blanch spinach in hot water for 2 minutes.\n2. Grind spinach with green chilies to a smooth paste.\n3. Heat butter and add cumin seeds.\n4. Sauté onions and ginger-garlic paste.\n5. Add tomatoes and cook until soft.\n6. Add spinach puree and cook for 5 minutes.\n7. Add paneer cubes and garam masala.',
        prep_time: 15,
        cook_time: 25,
        servings: 4,
        difficulty: 'Easy',
        rating: 4.5,
        reviews: 98,
        calories: 320
    },
    {
        id: 7,
        title: 'Rogan Josh',
        source: 'kashmirirecipes.com',
        cuisine: 'Indian',
        image: '🍛',
        tags: ['Kashmiri', 'Non-Veg', 'Royal'],
        ingredients: ['Lamb (1 kg)', 'Onions (3 large)', 'Yogurt (1 cup)', 'Ginger-Garlic Paste', 'Rogan Josh Masala', 'Saffron'],
        instructions: '1. Heat mustard oil and fry onions until golden.\n2. Add ginger-garlic paste and sauté.\n3. Add lamb and brown on all sides.\n4. Add rogan josh masala and cook for 5 minutes.\n5. Add yogurt and simmer for 45 minutes.\n6. Add fennel powder and dry ginger.\n7. Cook until meat is tender.',
        prep_time: 25,
        cook_time: 55,
        servings: 6,
        difficulty: 'Hard',
        rating: 4.7,
        reviews: 112,
        calories: 580
    },
    {
        id: 8,
        title: 'Vegetable Pulao',
        source: 'indianrice.com',
        cuisine: 'Indian',
        image: '🍚',
        tags: ['North Indian', 'Vegetarian', 'One-pot'],
        ingredients: ['Basmati Rice (2 cups)', 'Mixed Vegetables (2 cups)', 'Onions (2 medium)', 'Cardamom', 'Cloves', 'Cinnamon', 'Ghee (2 tbsp)'],
        instructions: '1. Rinse rice and soak for 30 minutes.\n2. Heat ghee and add whole spices.\n3. Add onions and sauté until golden.\n4. Add ginger-garlic paste and vegetables.\n5. Sauté for 5 minutes.\n6. Add rice and cook for 2 minutes.\n7. Add water and salt.\n8. Cover and cook until rice is done.',
        prep_time: 15,
        cook_time: 25,
        servings: 4,
        difficulty: 'Easy',
        rating: 4.4,
        reviews: 76,
        calories: 300
    },
    {
        id: 9,
        title: 'Malai Kofta',
        source: 'royalindianrecipes.com',
        cuisine: 'Indian',
        image: '🥘',
        tags: ['North Indian', 'Vegetarian', 'Rich'],
        ingredients: ['Potatoes (3 large)', 'Paneer (200g)', 'Cashews (1/2 cup)', 'Raisins (1/4 cup)', 'Onions (2 large)', 'Tomatoes (3 medium)', 'Cream (1/2 cup)'],
        instructions: '1. Boil and mash potatoes.\n2. Mix with paneer and shape into balls.\n3. Stuff with cashews and raisins.\n4. Deep fry koftas until golden brown.\n5. Prepare gravy with onions, tomatoes, and spices.\n6. Add cream and simmer.\n7. Add the koftas to the gravy.',
        prep_time: 30,
        cook_time: 35,
        servings: 4,
        difficulty: 'Hard',
        rating: 4.6,
        reviews: 89,
        calories: 500
    },
    {
        id: 10,
        title: 'Garlic Naan',
        source: 'indianbreads.com',
        cuisine: 'Indian',
        image: '🫓',
        tags: ['North Indian', 'Vegetarian', 'Bread'],
        ingredients: ['All-purpose Flour (2 cups)', 'Yogurt (1/2 cup)', 'Baking Powder', 'Sugar', 'Salt', 'Garlic (6 cloves)', 'Coriander Leaves'],
        instructions: '1. Mix flour, baking powder, sugar, and salt.\n2. Add yogurt and knead into a soft dough.\n3. Cover and rest for 2 hours.\n4. Divide into balls and roll out.\n5. Sprinkle minced garlic and coriander.\n6. Cook on hot tawa until bubbles appear.\n7. Flip and cook the other side.\n8. Brush with butter.',
        prep_time: 20,
        cook_time: 15,
        servings: 6,
        difficulty: 'Easy',
        rating: 4.3,
        reviews: 54,
        calories: 200
    }
];

// ============================================
// PAGE INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🍽️ Pantry App Loading...');

    const rawPage = window.location.pathname.split('/').pop() || 'index.html';
    const page = rawPage.replace('.html', '') || 'index';

    console.log('📍 Current page:', page);
    console.log('🔐 Auth status:', authToken ? 'Logged In ✅' : 'Logged Out ❌');

    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    switch(page) {
        case 'index':
        case '':
            loadHomePage();
            break;
        case 'recipes':
            loadRecipesPage();
            break;
        case 'recipe-detail':
            loadRecipeDetail();
            break;
        case 'pantry':
            loadPantryPage();
            break;
        case 'login':
            setupLoginPage();
            break;
        case 'register':
            setupRegisterPage();
            break;
        case 'contact':
            setupContactPage();
            break;
        case 'about':
            break;
        default:
            console.log('⚠️ Unknown page:', page);
    }

    setupNavbar();
    setupCookieConsent();
    setupSearch();
    setupFilterTags();
    setupAI();
    setupVoiceInput();   // ← NEW: Voice input

    console.log('✅ App loaded successfully!');
});

// ============================================
// HOMEPAGE FUNCTIONS
// ============================================

function loadHomePage() {
    console.log('📄 Loading homepage...');

    const recipesGrid = document.getElementById('recipesGrid');
    if (recipesGrid) {
        displayRecipes(sampleRecipes.slice(0, 6), recipesGrid);
    }

    updateNavbarUser();
}

// ============================================
// RECIPES PAGE FUNCTIONS
// ============================================

async function loadRecipesPage() {
    console.log('📄 Loading recipes page...');

    const recipesGrid = document.getElementById('recipesGrid');
    if (!recipesGrid) return;

    const params = new URLSearchParams(window.location.search);
    const searchQuery = params.get('search');

    let allRecipes = [];

    try {
        const response = await fetch(`${API_URL}/recipes`);
        const data = await response.json();

        if (response.ok && data.recipes && data.recipes.length > 0) {
            allRecipes = data.recipes;
            console.log('✅ Loaded', allRecipes.length, 'recipes from API');
        }
    } catch (error) {
        console.log('⚠️ API not available:', error.message);
    }

    const apiIds = new Set(allRecipes.map(r => r.id));
    sampleRecipes.forEach(sample => {
        if (!apiIds.has(sample.id)) {
            allRecipes.push(sample);
        }
    });

    console.log('📊 Total recipes after merge:', allRecipes.length);

    if (searchQuery) {
        const q = searchQuery.toLowerCase();
        allRecipes = allRecipes.filter(r => {
            if (r.title && r.title.toLowerCase().includes(q)) return true;
            if (r.cuisine && r.cuisine.toLowerCase().includes(q)) return true;
            if (Array.isArray(r.ingredients)) {
                if (r.ingredients.some(i => i.toLowerCase().includes(q))) return true;
            } else if (typeof r.ingredients === 'string') {
                if (r.ingredients.toLowerCase().includes(q)) return true;
            }
            return false;
        });
        console.log('🔍 Filtered to', allRecipes.length, 'recipes for:', searchQuery);
    }

    displayRecipes(allRecipes, recipesGrid);
}

// ============================================
// RECIPE DETAIL PAGE
// ============================================

async function loadRecipeDetail() {
    console.log('📄 Loading recipe detail page...');

    const container = document.getElementById('recipeDetail');
    if (!container) return;

    const params = new URLSearchParams(window.location.search);
    const recipeIdParam = params.get('id');

    console.log('🆔 Recipe ID from URL:', recipeIdParam);

    if (!recipeIdParam) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="icon">😕</div>
                <h3>No recipe selected</h3>
                <p><a href="recipes.html" style="color: var(--primary);">Browse all recipes</a></p>
            </div>
        `;
        return;
    }

    let recipe = null;

    try {
        const response = await fetch(`${API_URL}/recipes/${recipeIdParam}`);
        const data = await response.json();

        if (response.ok && data.recipe) {
            recipe = data.recipe;
            console.log('✅ Found in API:', recipe.title);
        }
    } catch (error) {
        console.log('⚠️ API not available');
    }

    if (!recipe) {
        const numericId = parseInt(recipeIdParam);
        if (!isNaN(numericId)) {
            recipe = sampleRecipes.find(r => r.id === numericId);
            if (recipe) console.log('✅ Found in samples:', recipe.title);
        }
    }

    if (!recipe) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="icon">😕</div>
                <h3>Recipe not found</h3>
                <p><a href="recipes.html" style="color: var(--primary);">Browse all recipes</a></p>
            </div>
        `;
        return;
    }

    displayRecipeDetail(recipe, container);
}

function displayRecipeDetail(recipe, container) {
    const instructions = recipe.instructions
        ? recipe.instructions.split('\n').filter(s => s.trim())
        : [];

    let ingredientsHtml = '';
    if (Array.isArray(recipe.ingredients)) {
        ingredientsHtml = recipe.ingredients.map(ing => `<li>${ing}</li>`).join('');
    } else if (typeof recipe.ingredients === 'string') {
        if (recipe.ingredients.startsWith('{') && recipe.ingredients.endsWith('}')) {
            const parsed = recipe.ingredients.slice(1, -1).split(',').map(i => i.trim().replace(/^"|"$/g, ''));
            ingredientsHtml = parsed.map(ing => `<li>${ing}</li>`).join('');
        } else {
            const parsed = recipe.ingredients.split(',').map(i => i.trim());
            ingredientsHtml = parsed.map(ing => `<li>${ing}</li>`).join('');
        }
    } else {
        ingredientsHtml = '<li>No ingredients listed</li>';
    }

    container.innerHTML = `
        <div class="recipe-detail">
            <div class="detail-image">${recipe.image || '🍽️'}</div>
            <h1 class="detail-title">${recipe.title}</h1>
            <p style="color: var(--text-secondary);">${recipe.source || 'Pantry Recipe'}</p>

            <div class="detail-meta">
                ${recipe.cuisine ? `<span class="meta-item">🍽️ ${recipe.cuisine}</span>` : ''}
                ${recipe.prep_time ? `<span class="meta-item">⏱️ Prep: ${recipe.prep_time}m</span>` : ''}
                ${recipe.cook_time ? `<span class="meta-item">🍳 Cook: ${recipe.cook_time}m</span>` : ''}
                ${recipe.servings ? `<span class="meta-item">👥 ${recipe.servings} servings</span>` : ''}
                ${recipe.difficulty ? `<span class="meta-item">📊 ${recipe.difficulty}</span>` : ''}
                ${recipe.rating ? `<span class="meta-item">⭐ ${recipe.rating}</span>` : ''}
                ${recipe.calories ? `<span class="meta-item">🔥 ${recipe.calories} cal</span>` : ''}
            </div>

            ${recipe.tags && Array.isArray(recipe.tags) ? `
                <div class="detail-tags">
                    ${recipe.tags.map(tag => `<span class="meta-item">${tag}</span>`).join('')}
                </div>
            ` : ''}

            <div class="detail-section">
                <h3><i class="fas fa-list"></i> Ingredients</h3>
                <ul>${ingredientsHtml}</ul>
            </div>

            <div class="detail-section">
                <h3><i class="fas fa-list-ol"></i> Instructions</h3>
                <ol>
                    ${instructions.length > 0
                        ? instructions.map(step => `<li>${step.trim().replace(/^\d+\.\s*/, '')}</li>`).join('')
                        : '<li>No instructions available</li>'
                    }
                </ol>
            </div>

            <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                <a href="recipes.html" class="btn-back">
                    <i class="fas fa-arrow-left"></i> Back to Recipes
                </a>
                <button class="btn-back" style="background: var(--success);" onclick="window.print()">
                    <i class="fas fa-print"></i> Print Recipe
                </button>
            </div>
        </div>
    `;
}

// ============================================
// PANTRY PAGE FUNCTIONS
// ============================================

function loadPantryPage() {
    console.log('📄 Loading pantry page...');

    const addBtn = document.getElementById('addPantryBtn');
    const input = document.getElementById('pantryInput');

    if (addBtn) {
        addBtn.addEventListener('click', addPantryItem);
    }

    if (input) {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') addPantryItem();
        });
    }

    updatePantryUI();
}

function addPantryItem() {
    const input = document.getElementById('pantryInput');
    if (!input) return;

    const item = input.value.trim();

    if (!item) {
        showToast('Please enter an ingredient', 'warning');
        return;
    }

    if (pantry.includes(item)) {
        showToast(`${item} is already in your pantry`, 'warning');
        return;
    }

    pantry.push(item);
    localStorage.setItem('pantry', JSON.stringify(pantry));
    input.value = '';

    updatePantryUI();
    showToast(`Added ${item} to pantry`, 'success');
}

function removePantryItem(item) {
    pantry = pantry.filter(i => i !== item);
    localStorage.setItem('pantry', JSON.stringify(pantry));
    updatePantryUI();
    showToast(`Removed ${item}`, 'info');
}

function updatePantryUI() {
    const pantryItems = document.getElementById('pantryItems');
    const pantryCount = document.getElementById('pantryCount');

    if (!pantryItems) return;

    if (pantry.length === 0) {
        pantryItems.innerHTML = '<span style="color: var(--text-muted); font-size: 14px;">No ingredients added yet</span>';
        if (pantryCount) pantryCount.textContent = '0 ingredients added';
        updateSuggestedRecipes();
        return;
    }

    pantryItems.innerHTML = pantry.map(item => `
        <div class="pantry-item">
            ${item}
            <span class="remove" onclick="removePantryItem('${item}')">×</span>
        </div>
    `).join('');

    if (pantryCount) {
        pantryCount.textContent = `${pantry.length} ingredient${pantry.length > 1 ? 's' : ''} added`;
    }

    updateSuggestedRecipes();
}

async function updateSuggestedRecipes() {
    const container = document.getElementById('suggestedRecipes');
    if (!container) return;

    if (pantry.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <p>Add ingredients to get recipe suggestions!</p>
            </div>
        `;
        return;
    }

    let allRecipes = [];

    try {
        const response = await fetch(`${API_URL}/recipes`);
        const data = await response.json();
        if (response.ok && data.recipes) {
            allRecipes = data.recipes;
        }
    } catch (error) {
        console.log('⚠️ API not available');
    }

    const apiIds = new Set(allRecipes.map(r => r.id));
    sampleRecipes.forEach(sample => {
        if (!apiIds.has(sample.id)) {
            allRecipes.push(sample);
        }
    });

    const suggested = allRecipes.filter(recipe => {
        let recipeIngredients = [];
        if (Array.isArray(recipe.ingredients)) {
            recipeIngredients = recipe.ingredients;
        } else if (typeof recipe.ingredients === 'string') {
            if (recipe.ingredients.startsWith('{') && recipe.ingredients.endsWith('}')) {
                recipeIngredients = recipe.ingredients.slice(1, -1).split(',').map(i => i.trim().replace(/^"|"$/g, ''));
            } else {
                recipeIngredients = recipe.ingredients.split(',').map(i => i.trim());
            }
        }
        return recipeIngredients.some(ing =>
            pantry.some(p => ing.toLowerCase().includes(p.toLowerCase()))
        );
    });

    if (suggested.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <p>No recipes match your pantry items yet.</p>
            </div>
        `;
        return;
    }

    displayRecipes(suggested, container);
}

// ============================================
// DISPLAY RECIPES
// ============================================

function displayRecipes(recipes, container) {
    if (!container) return;

    if (!recipes || recipes.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="icon">🔍</div>
                <h3>No recipes found</h3>
                <p>Try adjusting your search or filters</p>
            </div>
        `;
        return;
    }

    container.innerHTML = recipes.map(recipe => {
        let ingredientsDisplay = '';
        let ingredientsCount = 0;

        if (Array.isArray(recipe.ingredients)) {
            ingredientsCount = recipe.ingredients.length;
            ingredientsDisplay = recipe.ingredients.slice(0, 4).map(ing => `<span>${ing}</span>`).join('');
        } else if (typeof recipe.ingredients === 'string') {
            let parsed = [];
            if (recipe.ingredients.startsWith('{') && recipe.ingredients.endsWith('}')) {
                parsed = recipe.ingredients.slice(1, -1).split(',').map(i => i.trim().replace(/^"|"$/g, ''));
            } else {
                parsed = recipe.ingredients.split(',').map(i => i.trim());
            }
            ingredientsCount = parsed.length;
            ingredientsDisplay = parsed.slice(0, 4).map(ing => `<span>${ing}</span>`).join('');
        }

        return `
            <div class="recipe-card">
                <div class="card-image">
                    ${recipe.image || '🍽️'}
                    ${recipe.tags && Array.isArray(recipe.tags) ? `
                        <div class="badge-diet">
                            ${recipe.tags.slice(0, 2).map(tag => `<span>${tag}</span>`).join('')}
                        </div>
                    ` : ''}
                </div>
                <div class="card-body">
                    <h3 class="recipe-title">${recipe.title}</h3>
                    <p class="recipe-source">${recipe.source || 'Pantry'}</p>
                    <p class="recipe-cuisine">${recipe.cuisine || 'Indian'}</p>

                    ${recipe.tags && Array.isArray(recipe.tags) ? `
                        <div class="recipe-tags">
                            ${recipe.tags.slice(0, 3).map(tag => `<span>${tag}</span>`).join('')}
                        </div>
                    ` : ''}

                    ${recipe.rating ? `
                        <div style="font-size: 13px; color: var(--text-secondary); margin: 8px 0;">
                            ⭐ ${recipe.rating} (${recipe.reviews || 0} reviews)
                        </div>
                    ` : ''}

                    <div class="recipe-ingredients">
                        <h4>YOU'LL NEED</h4>
                        <div class="ingredient-list">
                            ${ingredientsDisplay}
                            ${ingredientsCount > 4 ? `<span>+${ingredientsCount - 4}</span>` : ''}
                        </div>
                    </div>

                    <a href="recipe-detail.html?id=${recipe.id}" class="btn-view" data-id="${recipe.id}">
                        <i class="fas fa-arrow-right"></i> View full recipe →
                    </a>
                </div>
            </div>
        `;
    }).join('');
}

// ============================================
// AUTH FUNCTIONS
// ============================================

function setupLoginPage() {
    console.log('🔐 Setting up login page...');

    const form = document.getElementById('loginForm');
    if (!form) {
        console.log('❌ loginForm not found');
        return;
    }

    console.log('✅ Login form found, attaching handler');

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value.trim();
        const message = document.getElementById('authMessage');
        const btn = document.getElementById('loginBtn');

        if (!email || !password) {
            showMessage(message, 'Email and password required', 'error');
            return;
        }

        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                authToken = data.token;
                currentUser = data.user;

                showMessage(message, '✅ Login successful! Redirecting...', 'success');

                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            } else {
                showMessage(message, data.message || 'Login failed', 'error');
            }
        } catch (error) {
            showMessage(message, 'Network error. Is the server running?', 'error');
        } finally {
            btn.disabled = false;
            btn.innerHTML = 'Sign In';
        }
    });
}

function setupRegisterPage() {
    console.log('📝 Setting up register page...');

    const form = document.getElementById('registerForm');
    if (!form) {
        console.log('❌ registerForm not found');
        return;
    }

    console.log('✅ Register form found, attaching handler');

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        console.log('📝 Register form submitted');

        const username = document.getElementById('registerUsername').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value.trim();
        const message = document.getElementById('registerMessage');
        const btn = document.getElementById('registerBtn');

        if (!username || !email || !password) {
            showMessage(message, 'All fields are required', 'error');
            return;
        }

        if (password.length < 6) {
            showMessage(message, 'Password must be at least 6 characters', 'error');
            return;
        }

        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';

        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });

            const data = await response.json();
            console.log('📥 Register response:', data);

            if (response.ok) {
                showMessage(message, '✅ Account created! Redirecting to login...', 'success');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1500);
            } else {
                showMessage(message, data.message || 'Registration failed', 'error');
            }
        } catch (error) {
            console.log('❌ Register error:', error);
            showMessage(message, 'Network error. Is the server running?', 'error');
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-gift"></i> Create Account & Get Rewards 🎁';
        }
    });
}

function showMessage(element, message, type) {
    if (!element) return;
    element.textContent = message;
    element.className = `auth-message ${type}`;

    setTimeout(() => {
        element.className = 'auth-message';
    }, 5000);
}

function updateNavbarUser() {
    const userDisplay = document.getElementById('userDisplay');
    if (!userDisplay) return;

    if (authToken && currentUser) {
        userDisplay.textContent = `👋 ${currentUser.username}`;
    }
}

// ============================================
// NAVBAR
// ============================================

function setupNavbar() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.getElementById('navLinks');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('open');
        });
    }

    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.classList.add('navbar-scrolled');
            } else {
                navbar.classList.remove('navbar-scrolled');
            }
        }
    });
}

// ============================================
// SEARCH
// ============================================

function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');

    if (!searchInput || !searchBtn) return;

    const performSearch = () => {
        const query = searchInput.value.trim();
        if (query) {
            window.location.href = `recipes.html?search=${encodeURIComponent(query)}`;
        }
    };

    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });
}

// ============================================
// FILTER TAGS
// ============================================

function setupFilterTags() {
    const filterTags = document.querySelectorAll('.filter-tag');

    filterTags.forEach(tag => {
        tag.addEventListener('click', function() {
            filterTags.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            const filter = this.dataset.filter;
            const recipesGrid = document.getElementById('recipesGrid');

            if (!recipesGrid) return;

            if (filter === 'all') {
                displayRecipes(sampleRecipes, recipesGrid);
            } else {
                const filtered = sampleRecipes.filter(recipe =>
                    recipe.tags && recipe.tags.some(t =>
                        t.toLowerCase().includes(filter.toLowerCase())
                    ) ||
                    recipe.cuisine && recipe.cuisine.toLowerCase().includes(filter.toLowerCase()) ||
                    recipe.title.toLowerCase().includes(filter.toLowerCase())
                );
                displayRecipes(filtered, recipesGrid);
            }
        });
    });
}

// ============================================
// AI RECIPE GENERATOR
// ============================================

function setupAI() {
    console.log('🤖 Setting up AI Recipe Generator...');

    const generateBtn = document.getElementById('generateAIRecipeBtn');
    if (!generateBtn) {
        console.log('⚠️ AI section not on this page');
        return;
    }

    console.log('✅ AI section found');

    generateBtn.addEventListener('click', generateAIRecipe);

    const aiInput = document.getElementById('aiIngredients');
    if (aiInput) {
        aiInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') generateAIRecipe();
        });
    }
}

async function generateAIRecipe() {
    console.log('🤖 Generate button clicked');

    const aiIngredients = document.getElementById('aiIngredients');
    const aiCuisine = document.getElementById('aiCuisine');
    const generateBtn = document.getElementById('generateAIRecipeBtn');
    const aiLoading = document.getElementById('aiLoading');
    const aiResult = document.getElementById('aiResult');

    if (!aiIngredients || !generateBtn) return;

    const ingredients = aiIngredients.value.trim();
    const cuisine = aiCuisine ? aiCuisine.value : '';

    if (!ingredients) {
        showToast('Please enter some ingredients! 🍽️', 'warning');
        aiIngredients.focus();
        return;
    }

    if (ingredients.length < 3) {
        showToast('Please enter valid ingredients', 'warning');
        return;
    }

    if (!authToken) {
        showToast('Please login to use AI features! 🔐', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }

    aiLoading.style.display = 'block';
    aiResult.style.display = 'none';
    generateBtn.disabled = true;
    generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';

    try {
        console.log('📤 Sending request to backend...');

        const response = await fetch(`${API_URL}/ai/generate-recipe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                ingredients: ingredients,
                cuisine: cuisine,
                language: localStorage.getItem('language') || 'en'   // ← NEW
            })
        });

        const data = await response.json();
        console.log('📥 Response received:', data);

        if (response.ok && data.success) {
            currentAIRecipe = data.recipe;
            displayAIRecipe(data.recipe);
            showToast('✅ Recipe generated successfully!', 'success');
        } else {
            if (response.status === 401) {
                showToast('Session expired. Please login again.', 'error');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1500);
            } else {
                showToast(data.message || 'Failed to generate recipe', 'error');
            }
        }

    } catch (error) {
        console.error('❌ AI Error:', error);
        showToast('Network error. Is the server running?', 'error');
    } finally {
        aiLoading.style.display = 'none';
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<i class="fas fa-wand-magic-sparkles"></i> Generate Recipe';
    }
}

function displayAIRecipe(recipe) {
    const aiResult = document.getElementById('aiResult');
    if (!aiResult) return;

    aiResult.style.display = 'block';

    const instructions = recipe.instructions
        ? recipe.instructions.split('\n').filter(s => s.trim())
        : [];

    aiResult.innerHTML = `
        <div class="ai-recipe-header">
            <div>
                <h3 class="ai-recipe-name">${recipe.name || 'Delicious Recipe'}</h3>
                <div class="ai-recipe-meta">
                    ${recipe.difficulty ? `<span>⭐ ${recipe.difficulty}</span>` : ''}
                    ${recipe.prep_time ? `<span>⏱️ Prep: ${recipe.prep_time}m</span>` : ''}
                    ${recipe.cook_time ? `<span>🍳 Cook: ${recipe.cook_time}m</span>` : ''}
                    ${recipe.servings ? `<span>👥 ${recipe.servings} servings</span>` : ''}
                    ${recipe.calories ? `<span>🔥 ${recipe.calories} cal</span>` : ''}
                    ${recipe.cuisine ? `<span>🌍 ${recipe.cuisine}</span>` : ''}
                </div>
            </div>
            <div class="ai-result-actions">
                <button class="btn-save-ai" onclick="saveAIRecipe()">
                    <i class="fas fa-save"></i> Save Recipe
                </button>
                <button class="btn-speak-ai" onclick="speakRecipe()">
                    <i class="fas fa-volume-up"></i> Read Aloud
                </button>
                <button class="btn-regenerate-ai" onclick="regenerateAIRecipe()">
                    <i class="fas fa-redo"></i> Regenerate
                </button>
            </div>
        </div>

        ${recipe.description ? `<p class="ai-description">${recipe.description}</p>` : ''}

        <div class="ai-section-block">
            <h4><i class="fas fa-list"></i> Ingredients</h4>
            <ul class="ai-ingredients-list">
                ${recipe.ingredients && Array.isArray(recipe.ingredients)
                    ? recipe.ingredients.map(ing => `
                        <li>
                            <strong>${ing.name || ing}</strong>
                            ${ing.quantity ? ` - ${ing.quantity} ${ing.unit || ''}` : ''}
                        </li>
                    `).join('')
                    : '<li>No ingredients listed</li>'
                }
            </ul>
        </div>

        <div class="ai-section-block">
            <h4><i class="fas fa-list-ol"></i> Instructions</h4>
            <ol class="ai-instructions-list">
                ${instructions.length > 0
                    ? instructions.map(step => `
                        <li>${step.trim().replace(/^\d+\.\s*/, '')}</li>
                    `).join('')
                    : '<li>No instructions available</li>'
                }
            </ol>
        </div>

        ${recipe.tips ? `
            <div class="ai-tips">
                <strong>💡 Pro Tip:</strong>
                <span>${recipe.tips}</span>
            </div>
        ` : ''}
    `;

    aiResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

async function saveAIRecipe() {
    if (!currentAIRecipe) {
        showToast('No recipe to save!', 'warning');
        return;
    }

    if (!authToken) {
        showToast('Please login to save recipes', 'error');
        return;
    }

    const saveBtn = document.querySelector('.btn-save-ai');
    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    }

    const ingredients = currentAIRecipe.ingredients
        .map(ing => typeof ing === 'string' ? ing : ing.name)
        .join(', ');

    try {
        const response = await fetch(`${API_URL}/recipes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                title: currentAIRecipe.name,
                description: currentAIRecipe.description,
                ingredients: ingredients,
                instructions: currentAIRecipe.instructions,
                prep_time: currentAIRecipe.prep_time || null,
                cook_time: currentAIRecipe.cook_time || null,
                servings: currentAIRecipe.servings || null,
                difficulty: currentAIRecipe.difficulty || 'Medium'
            })
        });

        const data = await response.json();

        if (response.ok) {
            showToast('✅ Recipe saved to your collection!', 'success');

            if (saveBtn) {
                saveBtn.innerHTML = '<i class="fas fa-check"></i> Saved!';
                saveBtn.style.background = 'var(--success-dark)';

                setTimeout(() => {
                    saveBtn.disabled = false;
                    saveBtn.innerHTML = '<i class="fas fa-save"></i> Save Recipe';
                    saveBtn.style.background = '';
                }, 3000);
            }
        } else {
            showToast(data.message || 'Failed to save recipe', 'error');
            if (saveBtn) {
                saveBtn.disabled = false;
                saveBtn.innerHTML = '<i class="fas fa-save"></i> Save Recipe';
            }
        }

    } catch (error) {
        showToast('Network error. Please try again.', 'error');
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.innerHTML = '<i class="fas fa-save"></i> Save Recipe';
        }
    }
}

function regenerateAIRecipe() {
    const aiIngredients = document.getElementById('aiIngredients');
    if (aiIngredients && aiIngredients.value.trim()) {
        generateAIRecipe();
    } else {
        showToast('Please enter ingredients first', 'warning');
    }
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================

function showToast(message, type = 'info') {
    document.querySelectorAll('.toast').forEach(t => t.remove());

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };

    toast.innerHTML = `
        <span>${icons[type] || 'ℹ️'}</span>
        <span>${message}</span>
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideInRight 0.3s reverse';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// ============================================
// COOKIE CONSENT
// ============================================

function setupCookieConsent() {
    const cookieConsent = document.getElementById('cookieConsent');
    if (!cookieConsent) return;

    if (localStorage.getItem('cookiesAccepted')) {
        cookieConsent.style.display = 'none';
        return;
    }

    cookieConsent.style.display = 'flex';

    const acceptBtn = document.getElementById('acceptCookies');
    if (acceptBtn) {
        acceptBtn.addEventListener('click', () => {
            localStorage.setItem('cookiesAccepted', 'true');
            cookieConsent.style.display = 'none';
            showToast('Cookies accepted!', 'success');
        });
    }

    const declineBtn = document.getElementById('declineCookies');
    if (declineBtn) {
        declineBtn.addEventListener('click', () => {
            cookieConsent.style.display = 'none';
        });
    }
}

// ============================================
// CONTACT FORM
// ============================================

function setupContactPage() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        showToast('✅ Thank you for your message! We\'ll get back to you soon.', 'success');
        this.reset();
    });
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function logoutUser() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    authToken = null;
    currentUser = null;
    showToast('Logged out successfully', 'info');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 500);
}

window.removePantryItem = removePantryItem;
window.saveAIRecipe = saveAIRecipe;
window.regenerateAIRecipe = regenerateAIRecipe;
window.logoutUser = logoutUser;

// ============================================
// 🎤 VOICE INPUT (Web Speech API)
// ============================================

let recognition = null;
let isListening = false;

function setupVoiceInput() {
    const voiceBtn = document.getElementById('voiceInputBtn');
    if (!voiceBtn) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        console.log('⚠️ Voice input not supported in this browser');
        voiceBtn.style.display = 'none';
        return;
    }

    console.log('🎤 Voice input supported');

    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;

    const savedLang = localStorage.getItem('language') || 'en';
    const langMap = { en: 'en-US', hi: 'hi-IN', kn: 'kn-IN', mr: 'mr-IN' };
    recognition.lang = langMap[savedLang] || 'en-US';

    recognition.onresult = function(event) {
        const input = document.getElementById('aiIngredients');
        if (!input) return;

        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
        }

        transcript = transcript
            .replace(/\band\b/gi, ',')
            .replace(/\s+/g, ' ')
            .trim();

        input.value = transcript;
    };

    recognition.onend = function() {
        isListening = false;
        voiceBtn.classList.remove('listening');
        voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
        removeVoiceStatus();
        console.log('🎤 Voice input stopped');
    };

    recognition.onerror = function(event) {
        console.error('🎤 Voice error:', event.error);
        isListening = false;
        voiceBtn.classList.remove('listening');
        voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
        removeVoiceStatus();

        if (event.error === 'not-allowed') {
            showToast('Please allow microphone access to use voice input', 'error');
        } else if (event.error === 'no-speech') {
            showToast('No speech detected. Try again.', 'warning');
        } else {
            showToast('Voice input failed. Try again.', 'error');
        }
    };

    voiceBtn.addEventListener('click', function() {
        if (isListening) {
            recognition.stop();
            return;
        }

        try {
            recognition.start();
            isListening = true;
            voiceBtn.classList.add('listening');
            voiceBtn.innerHTML = '<i class="fas fa-stop"></i>';
            showVoiceStatus();
            console.log('🎤 Voice input started (lang:', recognition.lang, ')');
        } catch (error) {
            console.error('🎤 Failed to start:', error);
        }
    });
}

function showVoiceStatus() {
    removeVoiceStatus();
    const status = document.createElement('div');
    status.className = 'voice-status';
    status.innerHTML = `
        <span class="pulse-dot"></span>
        🎤 Listening... Speak your ingredients
    `;
    document.body.appendChild(status);
}

function removeVoiceStatus() {
    const status = document.querySelector('.voice-status');
    if (status) status.remove();
}

// ============================================
// 🔊 VOICE OUTPUT (Text-to-Speech)
// ============================================

let currentUtterance = null;

function speakRecipe() {
    if (!currentAIRecipe) {
        showToast('No recipe to read!', 'warning');
        return;
    }

    const speechSynth = window.speechSynthesis;
    if (!speechSynth) {
        showToast('Text-to-speech not supported in this browser', 'error');
        return;
    }

    const speakBtn = document.querySelector('.btn-speak-ai');

    if (speechSynth.speaking) {
        speechSynth.cancel();
        resetSpeakButton();
        return;
    }

    const savedLang = localStorage.getItem('language') || 'en';
    const langMap = { en: 'en-US', hi: 'hi-IN', kn: 'kn-IN', mr: 'mr-IN' };
    const locale = langMap[savedLang] || 'en-US';

    const ingredientsText = currentAIRecipe.ingredients
        .map(ing => {
            if (typeof ing === 'string') return ing;
            const qty = ing.quantity ? `${ing.quantity} ${ing.unit || ''}` : '';
            return `${qty} ${ing.name || ''}`.trim();
        })
        .join(', ');

    const instructionsText = currentAIRecipe.instructions
        .replace(/\n+/g, '. ')
        .replace(/^\d+\.\s*/gm, '');

    const fullText = `
        ${currentAIRecipe.name || 'Recipe'}.
        ${currentAIRecipe.description || ''}
        Ingredients: ${ingredientsText}.
        Instructions: ${instructionsText}
        ${currentAIRecipe.tips ? 'Pro tip: ' + currentAIRecipe.tips : ''}
    `;

    currentUtterance = new SpeechSynthesisUtterance(fullText);
    currentUtterance.rate = 0.95;
    currentUtterance.pitch = 1;
    currentUtterance.volume = 1;
    currentUtterance.lang = locale;

    const voices = speechSynth.getVoices();
    const preferredVoice =
        voices.find(v => v.lang === locale && v.name.includes('Google')) ||
        voices.find(v => v.lang === locale) ||
        voices.find(v => v.lang.startsWith(locale.split('-')[0])) ||
        voices[0];

    if (preferredVoice) currentUtterance.voice = preferredVoice;

    currentUtterance.onend = function() {
        resetSpeakButton();
        console.log('🔊 Finished speaking');
    };

    currentUtterance.onerror = function(event) {
        console.error('🔊 Speech error:', event);
        resetSpeakButton();
        showToast('Read aloud failed. Try again.', 'error');
    };

    if (speakBtn) {
        speakBtn.classList.add('speaking');
        speakBtn.innerHTML = '<i class="fas fa-stop"></i> Stop';
    }

    speechSynth.speak(currentUtterance);
    console.log('🔊 Speaking recipe in', locale);
}

function resetSpeakButton() {
    const btn = document.querySelector('.btn-speak-ai');
    if (btn) {
        btn.classList.remove('speaking');
        btn.innerHTML = '<i class="fas fa-volume-up"></i> Read Aloud';
    }
}

// ============================================
// LANGUAGE CHANGE HOOK
// ============================================

// Hook into changeLanguage() from translations.js so voice picks up new lang
(function hookLanguageChange() {
    if (typeof window.changeLanguage !== 'function') {
        console.log('⚠️ changeLanguage not found — make sure translations.js loads BEFORE script.js');
        return;
    }

    const originalChangeLanguage = window.changeLanguage;

    window.changeLanguage = function(lang) {
        if (originalChangeLanguage) originalChangeLanguage(lang);

        // Update voice recognition language
        if (recognition) {
            const langMap = { en: 'en-US', hi: 'hi-IN', kn: 'kn-IN', mr: 'mr-IN' };
            recognition.lang = langMap[lang] || 'en-US';
        }

        // Stop any ongoing speech
        if (window.speechSynthesis && window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
            resetSpeakButton();
        }

        console.log('🔄 Language updated for voice:', lang);
    };
})();

// ============================================
// GLOBAL EXPORTS
// ============================================

window.speakRecipe = speakRecipe;
window.setupVoiceInput = setupVoiceInput;

// ============================================
// CONSOLE LOG
// ============================================

console.log('📦 Pantry App - JavaScript Loaded');
console.log('🔗 API URL:', API_URL);
console.log('🤖 AI features ready');