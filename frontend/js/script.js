// ============================================
// APP CONFIGURATION
// ============================================
const APP_CONFIG = {
    name: 'Pantry',
    version: '2.0.0',
    apiUrl: 'http://localhost:3000/api',
    debug: true,
    pagination: 12,
    cacheDuration: 3600000, // 1 hour
};

// ============================================
// STATE MANAGEMENT
// ============================================
class AppState {
    constructor() {
        this.state = {
            theme: localStorage.getItem('theme') || 'light',
            user: JSON.parse(localStorage.getItem('user')) || null,
            token: localStorage.getItem('token') || null,
            pantry: JSON.parse(localStorage.getItem('pantry')) || [],
            favorites: JSON.parse(localStorage.getItem('favorites')) || [],
            recipes: [],
            loading: false,
            error: null,
        };
        this.listeners = [];
    }

    get(key) {
        return this.state[key];
    }

    set(key, value) {
        this.state[key] = value;
        this.notify(key, value);
        return this;
    }

    subscribe(callback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }

    notify(key, value) {
        this.listeners.forEach(listener => {
            try {
                listener(key, value);
            } catch (error) {
                console.error('State listener error:', error);
            }
        });
    }

    persist(key) {
        const value = this.state[key];
        localStorage.setItem(key, JSON.stringify(value));
        return this;
    }

    load(key) {
        const value = localStorage.getItem(key);
        if (value) {
            try {
                this.state[key] = JSON.parse(value);
            } catch (error) {
                this.state[key] = value;
            }
        }
        return this;
    }
}

const appState = new AppState();

// ============================================
// THEME MANAGER
// ============================================
class ThemeManager {
    constructor() {
        this.currentTheme = appState.get('theme');
        this.init();
    }

    init() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        this.updateToggleIcon();
    }

    toggle() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        appState.set('theme', this.currentTheme).persist('theme');
        this.updateToggleIcon();
        this.showToast(`Theme switched to ${this.currentTheme} mode`, 'info');
    }

    updateToggleIcon() {
        const toggle = document.querySelector('.theme-toggle');
        if (toggle) {
            toggle.innerHTML = this.currentTheme === 'light' ? '🌙' : '☀️';
            toggle.setAttribute('aria-label', 
                `Switch to ${this.currentTheme === 'light' ? 'dark' : 'light'} mode`
            );
        }
    }

    showToast(message, type = 'info') {
        Toast.show(message, type);
    }
}

const themeManager = new ThemeManager();

// ============================================
// TOAST NOTIFICATION SYSTEM
// ============================================
class Toast {
    static container = null;

    static init() {
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        }
    }

    static show(message, type = 'info', duration = 3000) {
        this.init();

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️',
        };

        toast.innerHTML = `
            <span>${icons[type] || 'ℹ️'}</span>
            <span>${message}</span>
            <button class="toast-close" aria-label="Close notification">&times;</button>
        `;

        const close = () => {
            toast.style.animation = 'slideInRight 0.3s reverse';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        };

        toast.querySelector('.toast-close').addEventListener('click', close);

        setTimeout(() => {
            close();
        }, duration);

        this.container.appendChild(toast);
    }
}

// ============================================
// RECIPE STORE
// ============================================
class RecipeStore {
    static recipes = [
        {
            id: 1,
            title: 'Koulenje',
            source: 'armenianmuseum.org',
            cuisine: 'Armenian',
            image: '🥙',
            tags: ['Vegetarian', 'Pescatarian'],
            ingredients: ['Cottage Cheese', 'Feta', 'Peppers', 'Herbs'],
            instructions: '1. Mix cottage cheese and feta.\n2. Stuff into peppers.\n3. Bake at 350°F for 30 minutes.',
            prep_time: 20,
            cook_time: 30,
            servings: 4,
            difficulty: 'Medium',
            featured: true,
            rating: 4.5,
            reviews: 12,
        },
        {
            id: 2,
            title: 'Challah',
            source: 'bbcgoodfood.com',
            cuisine: 'Polish',
            image: '🍞',
            tags: ['Vegetarian', 'Dairy-Free', 'Pescatarian'],
            ingredients: ['Flour', 'Yeast', 'Eggs', 'Sugar', 'Oil'],
            instructions: '1. Mix flour, yeast, and sugar.\n2. Add eggs and oil.\n3. Knead and let rise.\n4. Braid and bake.',
            prep_time: 30,
            cook_time: 25,
            servings: 8,
            difficulty: 'Hard',
            featured: true,
            rating: 4.8,
            reviews: 8,
        },
        {
            id: 3,
            title: 'Cottage Cheese Stuffed Peppers',
            source: 'cookinglsl.com',
            cuisine: 'Mediterranean',
            image: '🫑',
            tags: ['Vegetarian', 'Gluten-Free', 'Low-Carb'],
            ingredients: ['Cottage Cheese', 'Bell Peppers', 'Herbs', 'Olive Oil'],
            instructions: '1. Cut peppers in half.\n2. Mix cottage cheese with herbs.\n3. Stuff peppers.\n4. Drizzle with olive oil.\n5. Bake.',
            prep_time: 15,
            cook_time: 25,
            servings: 4,
            difficulty: 'Easy',
            featured: true,
            rating: 4.3,
            reviews: 15,
        },
        {
            id: 4,
            title: 'Apam Balik',
            source: 'nyonyacooking.com',
            cuisine: 'Malaysian',
            image: '🥞',
            tags: ['Vegetarian', 'Pescatarian'],
            ingredients: ['Milk', 'Eggs', 'Flour', 'Baking Powder', 'Sugar'],
            instructions: '1. Mix all ingredients.\n2. Cook in a pan.\n3. Flip and cook until golden.',
            prep_time: 10,
            cook_time: 15,
            servings: 6,
            difficulty: 'Easy',
            featured: false,
            rating: 4.7,
            reviews: 6,
        },
        {
            id: 5,
            title: 'White Chocolate Creme Brulee',
            source: 'bbcgoodfood.com',
            cuisine: 'French',
            image: '🍮',
            tags: ['Vegetarian', 'Gluten-Free'],
            ingredients: ['Double Cream', 'White Chocolate', 'Vanilla', 'Egg Yolks', 'Sugar'],
            instructions: '1. Heat cream and chocolate.\n2. Whisk egg yolks and sugar.\n3. Combine and bake.\n4. Chill and caramelize.',
            prep_time: 20,
            cook_time: 40,
            servings: 4,
            difficulty: 'Hard',
            featured: false,
            rating: 4.9,
            reviews: 20,
        },
        {
            id: 6,
            title: 'Beef Mechado',
            source: 'panlasangpinoy.com',
            cuisine: 'Filipino',
            image: '🥩',
            tags: ['Gluten-Free', 'Dairy-Free'],
            ingredients: ['Beef', 'Tomato Puree', 'Onion', 'Garlic', 'Potatoes'],
            instructions: '1. Brown beef.\n2. Sauté onion and garlic.\n3. Add tomato puree and simmer.\n4. Add potatoes.\n5. Cook until tender.',
            prep_time: 20,
            cook_time: 60,
            servings: 6,
            difficulty: 'Medium',
            featured: false,
            rating: 4.4,
            reviews: 10,
        },
    ];

    static getFeatured() {
        return this.recipes.filter(r => r.featured);
    }

    static getAll() {
        return this.recipes;
    }

    static getById(id) {
        return this.recipes.find(r => r.id === parseInt(id));
    }

    static search(query) {
        const q = query.toLowerCase().trim();
        if (!q) return this.recipes;
        
        return this.recipes.filter(r =>
            r.title.toLowerCase().includes(q) ||
            r.ingredients.some(i => i.toLowerCase().includes(q)) ||
            r.cuisine.toLowerCase().includes(q) ||
            r.tags.some(t => t.toLowerCase().includes(q))
        );
    }

    static filterByDiet(diet) {
        if (!diet || diet === 'all') return this.recipes;
        return this.recipes.filter(r =>
            r.tags.some(t => t.toLowerCase().includes(diet.toLowerCase()))
        );
    }

    static filterByCuisine(cuisine) {
        if (!cuisine || cuisine === 'all') return this.recipes;
        return this.recipes.filter(r =>
            r.cuisine.toLowerCase().includes(cuisine.toLowerCase())
        );
    }
}

// ============================================
// PAGINATION
// ============================================
class Pagination {
    constructor(items, itemsPerPage = 12) {
        this.items = items;
        this.itemsPerPage = itemsPerPage;
        this.currentPage = 1;
    }

    get totalPages() {
        return Math.ceil(this.items.length / this.itemsPerPage);
    }

    get currentItems() {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        return this.items.slice(start, end);
    }

    goTo(page) {
        if (page < 1) page = 1;
        if (page > this.totalPages) page = this.totalPages;
        this.currentPage = page;
        return this.currentItems;
    }

    next() {
        return this.goTo(this.currentPage + 1);
    }

    prev() {
        return this.goTo(this.currentPage - 1);
    }

    getPaginationInfo() {
        return {
            currentPage: this.currentPage,
            totalPages: this.totalPages,
            totalItems: this.items.length,
            startItem: (this.currentPage - 1) * this.itemsPerPage + 1,
            endItem: Math.min(this.currentPage * this.itemsPerPage, this.items.length),
        };
    }
}

// ============================================
// PANTRY MANAGER
// ============================================
class PantryManager {
    constructor() {
        this.items = appState.get('pantry');
        this.suggestedRecipes = [];
    }

    addItem(item) {
        const trimmed = item.trim();
        if (!trimmed) return false;
        if (this.items.includes(trimmed)) {
            Toast.show(`${trimmed} is already in your pantry!`, 'warning');
            return false;
        }
        this.items.push(trimmed);
        appState.set('pantry', this.items).persist('pantry');
        this.save();
        this.updateUI();
        Toast.show(`Added ${trimmed} to your pantry!`, 'success');
        return true;
    }

    removeItem(item) {
        this.items = this.items.filter(i => i !== item);
        appState.set('pantry', this.items).persist('pantry');
        this.save();
        this.updateUI();
        Toast.show(`Removed ${item} from pantry`, 'info');
        return true;
    }

    getSuggestedRecipes() {
        if (this.items.length === 0) return [];
        
        return RecipeStore.getAll().filter(recipe =>
            recipe.ingredients.some(ing =>
                this.items.some(p => ing.toLowerCase().includes(p.toLowerCase()))
            )
        );
    }

    save() {
        localStorage.setItem('pantry', JSON.stringify(this.items));
    }

    updateUI() {
        const container = document.getElementById('pantryItems');
        const count = document.getElementById('pantryCount');
        const suggestedContainer = document.getElementById('suggestedRecipes');

        if (container) {
            if (this.items.length === 0) {
                container.innerHTML = '<span style="color: var(--text-muted); font-size: 14px;">No ingredients added yet</span>';
            } else {
                container.innerHTML = this.items.map(item => `
                    <div class="pantry-item">
                        ${item}
                        <span class="remove" onclick="pantryManager.removeItem('${item}')">×</span>
                    </div>
                `).join('');
            }
        }

        if (count) {
            count.textContent = `${this.items.length} ingredients added`;
        }

        if (suggestedContainer) {
            const suggested = this.getSuggestedRecipes();
            if (suggested.length === 0) {
                suggestedContainer.innerHTML = `
                    <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 40px 20px; color: var(--text-muted);">
                        <p>Add ingredients to get recipe suggestions!</p>
                    </div>
                `;
            } else {
                displayRecipes(suggested, 'suggestedRecipes');
            }
        }
    }
}

const pantryManager = new PantryManager();

// ============================================
// DISPLAY FUNCTIONS
// ============================================
function displayRecipes(recipes, containerId = 'recipesGrid') {
    const grid = document.getElementById(containerId);
    if (!grid) return;

    if (!recipes || recipes.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                <div style="font-size: 48px; margin-bottom: 16px;">🔍</div>
                <h3 style="font-size: 20px; color: var(--text-secondary);">No recipes found</h3>
                <p style="color: var(--text-muted);">Try adjusting your search or filters</p>
            </div>
        `;
        return;
    }

    const favorites = appState.get('favorites');

    grid.innerHTML = recipes.map((recipe, index) => `
        <div class="recipe-card animate-fade-up animate-delay-${(index % 4) + 1}">
            <div class="card-image">
                ${recipe.image || '🍽️'}
                <div class="badge-diet">
                    ${recipe.tags.map(tag => `<span>${tag}</span>`).join('')}
                </div>
            </div>
            <div class="card-body">
                <h3 class="recipe-title">${recipe.title}</h3>
                <p class="recipe-source">${recipe.source}</p>
                <p class="recipe-cuisine">${recipe.cuisine}</p>
                <div class="recipe-tags">
                    ${recipe.tags.map(tag => `<span>${tag}</span>`).join('')}
                </div>
                <div class="recipe-rating">
                    <span>⭐ ${recipe.rating || 0}</span>
                    <span style="color: var(--text-muted); font-size: 12px;">(${recipe.reviews || 0} reviews)</span>
                </div>
                <div class="recipe-ingredients">
                    <h4>YOU'LL NEED</h4>
                    <div class="ingredient-list">
                        ${recipe.ingredients.map(ing => `<span>${ing}</span>`).join('')}
                    </div>
                </div>
                <div style="display: flex; gap: 8px; margin-top: 12px;">
                    <a href="recipe-detail.html?id=${recipe.id}" class="btn btn-primary" style="flex: 1;">
                        <i class="fas fa-arrow-right"></i> View Recipe
                    </a>
                    <button class="btn btn-secondary btn-sm favorite-btn" 
                            onclick="toggleFavorite(${recipe.id})"
                            data-favorite="${favorites.includes(recipe.id)}">
                        <i class="fas fa-${favorites.includes(recipe.id) ? 'heart' : 'heart-o'}"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// ============================================
// FAVORITES
// ============================================
function toggleFavorite(recipeId) {
    const favorites = appState.get('favorites');
    const index = favorites.indexOf(recipeId);
    
    if (index > -1) {
        favorites.splice(index, 1);
        Toast.show('Removed from favorites', 'info');
    } else {
        favorites.push(recipeId);
        Toast.show('Added to favorites ❤️', 'success');
    }
    
    appState.set('favorites', favorites).persist('favorites');
    
    // Update all favorite buttons
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        const id = parseInt(btn.dataset.recipeId);
        if (id === recipeId) {
            const isFavorite = favorites.includes(recipeId);
            btn.dataset.favorite = isFavorite;
            btn.innerHTML = `<i class="fas fa-${isFavorite ? 'heart' : 'heart-o'}"></i>`;
        }
    });
}

// ============================================
// SEARCH WITH DEBOUNCING
// ============================================
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

function searchRecipes(query) {
    if (!query || query.length < 2) {
        displayRecipes(RecipeStore.getAll());
        return;
    }
    const results = RecipeStore.search(query);
    displayRecipes(results);
}

const debouncedSearch = debounce(searchRecipes, 300);

// ============================================
// LOAD RECIPE DETAIL
// ============================================
function loadRecipeDetail() {
    const container = document.getElementById('recipeDetail');
    if (!container) return;

    const params = new URLSearchParams(window.location.search);
    const recipeId = parseInt(params.get('id'));
    const recipe = RecipeStore.getById(recipeId);

    if (!recipe) {
        container.innerHTML = `
            <div style="text-align: center; padding: 60px 20px;">
                <h2>Recipe not found</h2>
                <p><a href="recipes.html" style="color: var(--primary);">Browse all recipes</a></p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="recipe-detail animate-fade-up">
            <div class="detail-image">${recipe.image}</div>
            <h1 class="detail-title">${recipe.title}</h1>
            <div class="detail-meta">
                <span class="meta-item"><i class="fas fa-utensils"></i> ${recipe.cuisine}</span>
                <span class="meta-item"><i class="fas fa-clock"></i> Prep: ${recipe.prep_time}m</span>
                <span class="meta-item"><i class="fas fa-clock"></i> Cook: ${recipe.cook_time}m</span>
                <span class="meta-item"><i class="fas fa-users"></i> ${recipe.servings} servings</span>
                <span class="meta-item"><i class="fas fa-signal"></i> ${recipe.difficulty}</span>
                <span class="meta-item"><i class="fas fa-star" style="color: #F1C40F;"></i> ${recipe.rating} (${recipe.reviews} reviews)</span>
            </div>
            <div class="detail-tags">
                ${recipe.tags.map(tag => `<span class="meta-item">${tag}</span>`).join('')}
            </div>
            <div class="detail-section">
                <h3><i class="fas fa-list"></i> Ingredients</h3>
                <ul>
                    ${recipe.ingredients.map(ing => `<li>${ing}</li>`).join('')}
                </ul>
            </div>
            <div class="detail-section">
                <h3><i class="fas fa-list-ol"></i> Instructions</h3>
                <ol>
                    ${recipe.instructions.split('\n').filter(s => s.trim()).map(step => `<li>${step}</li>`).join('')}
                </ol>
            </div>
            <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                <a href="recipes.html" class="btn btn-secondary">
                    <i class="fas fa-arrow-left"></i> Back to Recipes
                </a>
                <button class="btn btn-primary" onclick="window.print()">
                    <i class="fas fa-print"></i> Print Recipe
                </button>
            </div>
        </div>
    `;
}

// ============================================
// FORM VALIDATION
// ============================================
class FormValidator {
    static validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    static validatePassword(password) {
        return password.length >= 6;
    }

    static validateUsername(username) {
        return username.length >= 3 && /^[a-zA-Z0-9_]+$/.test(username);
    }

    static validatePhone(phone) {
        return /^[\d\+\-\(\)]{10,}$/.test(phone);
    }

    static validateRequired(value) {
        return value && value.trim().length > 0;
    }
}

// ============================================
// AUTHENTICATION
// ============================================
class Auth {
    static login(email, password) {
        if (!FormValidator.validateEmail(email)) {
            Toast.show('Please enter a valid email', 'error');
            return false;
        }

        if (!FormValidator.validatePassword(password)) {
            Toast.show('Password must be at least 6 characters', 'error');
            return false;
        }

        // Simulate login (replace with actual API call)
        const user = {
            id: 1,
            username: 'john_doe',
            email: email,
            name: 'John Doe',
            avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=FF6B35&color=fff'
        };

        const token = 'mock_jwt_token_' + Date.now();

        appState.set('user', user).persist('user');
        appState.set('token', token).persist('token');

        Toast.show('Welcome back! 🎉', 'success');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);

        return true;
    }

    static register(username, email, password, name) {
        if (!FormValidator.validateUsername(username)) {
            Toast.show('Username must be at least 3 characters and contain only letters, numbers, and underscores', 'error');
            return false;
        }

        if (!FormValidator.validateEmail(email)) {
            Toast.show('Please enter a valid email', 'error');
            return false;
        }

        if (!FormValidator.validatePassword(password)) {
            Toast.show('Password must be at least 6 characters', 'error');
            return false;
        }

        Toast.show('Account created successfully! 🎁', 'success');
        
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);

        return true;
    }

    static logout() {
        appState.set('user', null).persist('user');
        appState.set('token', null).persist('token');
        Toast.show('Logged out successfully', 'info');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 500);
    }

    static isAuthenticated() {
        return !!appState.get('token');
    }
}

// ============================================
// INITIALIZE
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // Load theme
    themeManager.init();

    // Check authentication status
    const isAuth = Auth.isAuthenticated();
    const user = appState.get('user');

    // Update UI based on auth status
    updateAuthUI(isAuth, user);

    // Setup event listeners
    setupEventListeners();

    // Load content based on page
    const page = window.location.pathname.split('/').pop();

    switch(page) {
        case 'index.html':
        case '':
            loadHomePage();
            break;
        case 'recipes.html':
            loadRecipesPage();
            break;
        case 'recipe-detail.html':
            loadRecipeDetail();
            break;
        case 'pantry.html':
            loadPantryPage();
            break;
        case 'login.html':
            break;
        case 'register.html':
            break;
        default:
            break;
    }

    console.log(`🍽️ ${APP_CONFIG.name} v${APP_CONFIG.version} loaded!`);
    console.log(`📚 ${RecipeStore.getAll().length} recipes available`);
    console.log(`📦 ${appState.get('pantry').length} items in pantry`);
    console.log(`❤️ ${appState.get('favorites').length} favorites`);
});

// ============================================
// PAGE LOADERS
// ============================================
function loadHomePage() {
    const featured = RecipeStore.getFeatured();
    displayRecipes(featured);
}

function loadRecipesPage() {
    const params = new URLSearchParams(window.location.search);
    const search = params.get('search');
    
    if (search) {
        const results = RecipeStore.search(search);
        displayRecipes(results);
    } else {
        displayRecipes(RecipeStore.getAll());
    }
}

function loadPantryPage() {
    pantryManager.updateUI();
}

// ============================================
// UPDATE AUTH UI
// ============================================
function updateAuthUI(isAuthenticated, user) {
    const authLinks = document.querySelectorAll('.auth-links');
    const userDisplay = document.getElementById('userDisplay');

    if (isAuthenticated && user) {
        authLinks.forEach(el => {
            el.innerHTML = `
                <span style="display: flex; align-items: center; gap: 8px;">
                    <img src="${user.avatar}" alt="${user.name}" style="width: 32px; height: 32px; border-radius: 50%;">
                    <span>${user.name}</span>
                </span>
                <button onclick="Auth.logout()" class="btn btn-sm btn-secondary">Logout</button>
            `;
        });
    } else {
        authLinks.forEach(el => {
            el.innerHTML = `
                <a href="login.html" class="btn btn-sm btn-secondary">Sign In</a>
                <a href="register.html" class="btn btn-sm btn-primary">Join for Rewards</a>
            `;
        });
    }

    if (userDisplay) {
        userDisplay.textContent = isAuthenticated ? `👋 ${user?.name || 'User'}` : '👋 Welcome!';
    }
}

// ============================================
// EVENT LISTENERS
// ============================================
function setupEventListeners() {
    // Theme toggle
    document.querySelectorAll('.theme-toggle').forEach(el => {
        el.addEventListener('click', () => themeManager.toggle());
    });

    // Hamburger menu
    document.querySelectorAll('.hamburger').forEach(el => {
        el.addEventListener('click', function() {
            document.getElementById('navLinks')?.classList.toggle('open');
        });
    });

    // Search
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            debouncedSearch(e.target.value);
        });
    }

    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            const query = searchInput?.value || '';
            if (query.length > 0) {
                window.location.href = `recipes.html?search=${encodeURIComponent(query)}`;
            }
        });
    }

    // Quick filters
    document.querySelectorAll('.filter-tag').forEach(tag => {
        tag.addEventListener('click', function() {
            document.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            const filter = this.dataset.filter;
            if (filter === 'all') {
                displayRecipes(RecipeStore.getAll());
            } else {
                const filtered = RecipeStore.getAll().filter(r =>
                    r.tags.some(t => t.toLowerCase().includes(filter.toLowerCase())) ||
                    r.cuisine.toLowerCase().includes(filter.toLowerCase())
                );
                displayRecipes(filtered);
            }
        });
    });

    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('loginEmail')?.value;
            const password = document.getElementById('loginPassword')?.value;
            Auth.login(email, password);
        });
    }

    // Register form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('registerUsername')?.value;
            const email = document.getElementById('registerEmail')?.value;
            const password = document.getElementById('registerPassword')?.value;
            const name = document.getElementById('registerName')?.value || username;
            Auth.register(username, email, password, name);
        });
    }

    // Contact form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            Toast.show('✅ Thank you for your message! We\'ll get back to you soon.', 'success');
            this.reset();
        });
    }

    // Pantry
    const pantryInput = document.getElementById('pantryInput');
    const addPantryBtn = document.getElementById('addPantryBtn');

    if (addPantryBtn) {
        addPantryBtn.addEventListener('click', () => {
            const value = pantryInput?.value;
            if (value) {
                pantryManager.addItem(value);
                pantryInput.value = '';
            }
        });
    }

    if (pantryInput) {
        pantryInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                addPantryBtn?.click();
            }
        });
    }

    // Cookie consent
    const cookieConsent = document.getElementById('cookieConsent');
    if (cookieConsent && !localStorage.getItem('cookiesAccepted')) {
        cookieConsent.style.display = 'flex';
    }

    document.getElementById('acceptCookies')?.addEventListener('click', function() {
        localStorage.setItem('cookiesAccepted', 'true');
        document.getElementById('cookieConsent').style.display = 'none';
        Toast.show('Cookies accepted!', 'success');
    });

    document.getElementById('declineCookies')?.addEventListener('click', function() {
        document.getElementById('cookieConsent').style.display = 'none';
    });

    // Navbar scroll effect
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 50) {
            navbar.classList.add('navbar-scrolled');
        } else {
            navbar.classList.remove('navbar-scrolled');
        }
        
        lastScroll = currentScroll;
    });

    // Lazy load images
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    imageObserver.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

// ============================================
// EXPOSE TO GLOBAL SCOPE
// ============================================
window.appState = appState;
window.themeManager = themeManager;
window.Toast = Toast;
window.pantryManager = pantryManager;
window.Auth = Auth;
window.RecipeStore = RecipeStore;
window.displayRecipes = displayRecipes;
window.toggleFavorite = toggleFavorite;
window.debouncedSearch = debouncedSearch;
window.searchRecipes = searchRecipes;

console.log('🚀 Advanced features loaded successfully!');
// ============================================
// INDIAN RECIPE DATA
// ============================================

const indianRecipes = [
    {
        id: 1,
        title: 'Butter Chicken',
        source: 'authenticindianrecipes.com',
        cuisine: 'Indian',
        image: '🍛',
        tags: ['North Indian', 'Non-Veg', 'Popular'],
        ingredients: [
            'Chicken (500g)',
            'Butter (50g)',
            'Tomato Puree (2 cups)',
            'Heavy Cream (1/2 cup)',
            'Ginger-Garlic Paste (2 tbsp)',
            'Red Chili Powder (1 tsp)',
            'Garam Masala (1 tsp)',
            'Kasuri Methi (1 tbsp)',
            'Salt to taste',
            'Sugar (1 tsp)'
        ],
        instructions: `1. Marinate chicken with ginger-garlic paste, chili powder, and salt for 30 minutes.
2. Heat butter in a pan and cook the marinated chicken until golden brown.
3. Add tomato puree and cook for 10 minutes.
4. Add garam masala and sugar, simmer for 15 minutes.
5. Stir in heavy cream and kasuri methi.
6. Cook for 5 more minutes.
7. Garnish with fresh coriander and serve hot with naan or rice.`,
        prep_time: 20,
        cook_time: 35,
        servings: 4,
        difficulty: 'Medium',
        featured: true,
        rating: 4.9,
        reviews: 156,
        calories: 450,
        origin: 'Punjab',
        dietary: 'Non-Vegetarian'
    },
    {
        id: 2,
        title: 'Chicken Biryani',
        source: 'biryaniwala.com',
        cuisine: 'Indian',
        image: '🍚',
        tags: ['Hyderabadi', 'Non-Veg', 'Festival'],
        ingredients: [
            'Chicken (1 kg)',
            'Basmati Rice (2 cups)',
            'Onions (3 large)',
            'Tomatoes (2 medium)',
            'Yogurt (1 cup)',
            'Ginger-Garlic Paste (2 tbsp)',
            'Biryani Masala (2 tbsp)',
            'Saffron (a pinch)',
            'Mint Leaves (1/2 cup)',
            'Coriander Leaves (1/2 cup)',
            'Ghee (4 tbsp)',
            'Salt to taste'
        ],
        instructions: `1. Marinate chicken with yogurt, ginger-garlic paste, and biryani masala for 2 hours.
2. Soak rice for 30 minutes, then boil until 70% cooked.
3. Fry onions until golden brown.
4. Layer the marinated chicken, rice, fried onions, mint, and coriander.
5. Add saffron soaked in milk.
6. Seal the pot and cook on low flame for 20 minutes.
7. Let it rest for 10 minutes before serving.
8. Serve with raita and salad.`,
        prep_time: 30,
        cook_time: 40,
        servings: 6,
        difficulty: 'Hard',
        featured: true,
        rating: 4.8,
        reviews: 203,
        calories: 550,
        origin: 'Hyderabad',
        dietary: 'Non-Vegetarian'
    },
    {
        id: 3,
        title: 'Dal Makhani',
        source: 'punjabirecipes.com',
        cuisine: 'Indian',
        image: '🥘',
        tags: ['Punjabi', 'Vegetarian', 'Popular'],
        ingredients: [
            'Whole Black Lentils (1 cup)',
            'Kidney Beans (1/4 cup)',
            'Butter (4 tbsp)',
            'Cream (1/2 cup)',
            'Tomato Puree (1 cup)',
            'Ginger-Garlic Paste (1 tbsp)',
            'Red Chili Powder (1 tsp)',
            'Garam Masala (1 tsp)',
            'Salt to taste'
        ],
        instructions: `1. Soak lentils and kidney beans overnight.
2. Pressure cook until soft and mushy.
3. Heat butter and sauté ginger-garlic paste.
4. Add tomato puree and cook for 5 minutes.
5. Add the cooked lentils and beans.
6. Simmer for 30 minutes on low heat.
7. Add cream and garam masala.
8. Cook for 10 more minutes.
9. Garnish with butter and serve with naan or rice.`,
        prep_time: 15,
        cook_time: 45,
        servings: 4,
        difficulty: 'Easy',
        featured: true,
        rating: 4.7,
        reviews: 189,
        calories: 380,
        origin: 'Punjab',
        dietary: 'Vegetarian'
    },
    {
        id: 4,
        title: 'Chole Bhature',
        source: 'delhistreetfood.com',
        cuisine: 'Indian',
        image: '🫓',
        tags: ['North Indian', 'Vegetarian', 'Street Food'],
        ingredients: [
            'Chickpeas (2 cups)',
            'Onions (2 large)',
            'Tomatoes (2 medium)',
            'Ginger-Garlic Paste (1 tbsp)',
            'Chole Masala (2 tbsp)',
            'Tea Bags (for color)',
            'Coriander Leaves',
            'Salt to taste',
            'Oil (2 tbsp)',
            'For Bhature: Maida (2 cups), Yogurt, Baking Powder'
        ],
        instructions: `1. Soak chickpeas overnight with tea bags for color.
2. Pressure cook chickpeas until soft.
3. Sauté onions, ginger-garlic paste.
4. Add tomatoes and cook until soft.
5. Add chole masala and salt.
6. Add cooked chickpeas and simmer for 20 minutes.
7. For bhature, knead maida with yogurt and baking powder.
8. Rest for 2 hours.
9. Roll and deep fry until golden.
10. Serve hot with chole.`,
        prep_time: 20,
        cook_time: 35,
        servings: 4,
        difficulty: 'Medium',
        featured: false,
        rating: 4.6,
        reviews: 134,
        calories: 520,
        origin: 'Delhi',
        dietary: 'Vegetarian'
    },
    {
        id: 5,
        title: 'Chicken Tikka Masala',
        source: 'indianfoodforever.com',
        cuisine: 'Indian',
        image: '🍲',
        tags: ['North Indian', 'Non-Veg', 'Popular'],
        ingredients: [
            'Chicken (500g)',
            'Yogurt (1 cup)',
            'Tikka Masala (2 tbsp)',
            'Tomato Puree (1.5 cups)',
            'Heavy Cream (1/2 cup)',
            'Butter (2 tbsp)',
            'Ginger-Garlic Paste (1 tbsp)',
            'Coriander Leaves',
            'Salt to taste'
        ],
        instructions: `1. Marinate chicken with yogurt and tikka masala for 2 hours.
2. Grill or bake until charred.
3. Heat butter and sauté ginger-garlic paste.
4. Add tomato puree and cook for 8-10 minutes.
5. Add the grilled chicken pieces.
6. Simmer for 15 minutes.
7. Add cream and cook for 5 minutes.
8. Garnish with coriander.
9. Serve with naan or rice.`,
        prep_time: 25,
        cook_time: 30,
        servings: 4,
        difficulty: 'Medium',
        featured: true,
        rating: 4.8,
        reviews: 178,
        calories: 480,
        origin: 'Punjab',
        dietary: 'Non-Vegetarian'
    },
    {
        id: 6,
        title: 'Palak Paneer',
        source: 'vegetarianrecipes.in',
        cuisine: 'Indian',
        image: '🥬',
        tags: ['North Indian', 'Vegetarian', 'Healthy'],
        ingredients: [
            'Spinach (500g)',
            'Paneer (250g)',
            'Onions (2 medium)',
            'Tomatoes (2 medium)',
            'Ginger-Garlic Paste (1 tbsp)',
            'Green Chilies (2)',
            'Garam Masala (1 tsp)',
            'Cumin Seeds (1 tsp)',
            'Butter (2 tbsp)',
            'Salt to taste'
        ],
        instructions: `1. Blanch spinach in hot water for 2 minutes.
2. Grind spinach with green chilies to a smooth paste.
3. Heat butter and add cumin seeds.
4. Sauté onions and ginger-garlic paste.
5. Add tomatoes and cook until soft.
6. Add spinach puree and cook for 5 minutes.
7. Add paneer cubes and garam masala.
8. Simmer for 5-7 minutes.
9. Serve hot with naan or rice.`,
        prep_time: 15,
        cook_time: 25,
        servings: 4,
        difficulty: 'Easy',
        featured: false,
        rating: 4.5,
        reviews: 98,
        calories: 320,
        origin: 'North India',
        dietary: 'Vegetarian'
    },
    {
        id: 7,
        title: 'Rogan Josh',
        source: 'kashmirirecipes.com',
        cuisine: 'Indian',
        image: '🍛',
        tags: ['Kashmiri', 'Non-Veg', 'Royal'],
        ingredients: [
            'Lamb (1 kg)',
            'Onions (3 large)',
            'Yogurt (1 cup)',
            'Ginger-Garlic Paste (2 tbsp)',
            'Rogan Josh Masala (3 tbsp)',
            'Saffron (a pinch)',
            'Dry Ginger Powder (1 tsp)',
            'Fennel Powder (1 tbsp)',
            'Mustard Oil (4 tbsp)',
            'Salt to taste'
        ],
        instructions: `1. Heat mustard oil and fry onions until golden.
2. Add ginger-garlic paste and sauté.
3. Add lamb and brown on all sides.
4. Add rogan josh masala and cook for 5 minutes.
5. Add yogurt and simmer for 45 minutes.
6. Add fennel powder and dry ginger.
7. Cook until meat is tender.
8. Add saffron soaked in milk.
9. Garnish with coriander and serve with rice.`,
        prep_time: 25,
        cook_time: 55,
        servings: 6,
        difficulty: 'Hard',
        featured: false,
        rating: 4.7,
        reviews: 112,
        calories: 580,
        origin: 'Kashmir',
        dietary: 'Non-Vegetarian'
    },
    {
        id: 8,
        title: 'Vegetable Pulao',
        source: 'indianrice.com',
        cuisine: 'Indian',
        image: '🍚',
        tags: ['North Indian', 'Vegetarian', 'One-pot'],
        ingredients: [
            'Basmati Rice (2 cups)',
            'Mixed Vegetables (2 cups)',
            'Onions (2 medium)',
            'Ginger-Garlic Paste (1 tbsp)',
            'Cardamom (2 pods)',
            'Cloves (4-5)',
            'Cinnamon (1 inch)',
            'Ghee (2 tbsp)',
            'Salt to taste',
            'Coriander Leaves'
        ],
        instructions: `1. Rinse rice and soak for 30 minutes.
2. Heat ghee and add whole spices.
3. Add onions and sauté until golden.
4. Add ginger-garlic paste and vegetables.
5. Sauté for 5 minutes.
6. Add rice and cook for 2 minutes.
7. Add water and salt.
8. Cover and cook until rice is done.
9. Garnish with coriander.
10. Serve with raita.`,
        prep_time: 15,
        cook_time: 25,
        servings: 4,
        difficulty: 'Easy',
        featured: false,
        rating: 4.4,
        reviews: 76,
        calories: 300,
        origin: 'India',
        dietary: 'Vegetarian'
    },
    {
        id: 9,
        title: 'Malai Kofta',
        source: 'royalindianrecipes.com',
        cuisine: 'Indian',
        image: '🥘',
        tags: ['North Indian', 'Vegetarian', 'Rich'],
        ingredients: [
            'Potatoes (3 large)',
            'Paneer (200g)',
            'Cashews (1/2 cup)',
            'Raisins (1/4 cup)',
            'Onions (2 large)',
            'Tomatoes (3 medium)',
            'Ginger-Garlic Paste (1 tbsp)',
            'Garam Masala (1 tsp)',
            'Cream (1/2 cup)',
            'Oil (for frying)',
            'Salt to taste'
        ],
        instructions: `1. Boil and mash potatoes.
2. Mix with paneer and shape into balls.
3. Stuff with cashews and raisins.
4. Deep fry koftas until golden brown.
5. Prepare gravy with onions, tomatoes, and spices.
6. Add cream and simmer.
7. Add the koftas to the gravy.
8. Cook for 5 minutes.
9. Serve hot with naan or rice.`,
        prep_time: 30,
        cook_time: 35,
        servings: 4,
        difficulty: 'Hard',
        featured: false,
        rating: 4.6,
        reviews: 89,
        calories: 500,
        origin: 'North India',
        dietary: 'Vegetarian'
    },
    {
        id: 10,
        title: 'Garlic Naan',
        source: 'indianbreads.com',
        cuisine: 'Indian',
        image: '🫓',
        tags: ['North Indian', 'Vegetarian', 'Bread'],
        ingredients: [
            'All-purpose Flour (2 cups)',
            'Yogurt (1/2 cup)',
            'Baking Powder (1 tsp)',
            'Sugar (1 tsp)',
            'Salt (1/2 tsp)',
            'Garlic (6 cloves, minced)',
            'Coriander Leaves',
            'Butter (for brushing)'
        ],
        instructions: `1. Mix flour, baking powder, sugar, and salt.
2. Add yogurt and knead into a soft dough.
3. Cover and rest for 2 hours.
4. Divide into balls and roll out.
5. Sprinkle minced garlic and coriander.
6. Cook on hot tawa until bubbles appear.
7. Flip and cook the other side.
8. Brush with butter.
9. Serve hot with any curry.`,
        prep_time: 20,
        cook_time: 15,
        servings: 6,
        difficulty: 'Easy',
        featured: false,
        rating: 4.3,
        reviews: 54,
        calories: 200,
        origin: 'Punjab',
        dietary: 'Vegetarian'
    }
];

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = indianRecipes;
}