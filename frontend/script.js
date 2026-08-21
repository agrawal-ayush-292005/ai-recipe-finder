// ============================================
// CONFIGURATION
// ============================================

const API_URL = 'http://localhost:3000/api';

// ============================================
// STATE
// ============================================

let authToken = localStorage.getItem('token') || null;
let currentUser = JSON.parse(localStorage.getItem('user')) || null;

// ============================================
// DOM REFS - AUTH
// ============================================

const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const loginBtn = document.getElementById('loginBtn');
const registerUsername = document.getElementById('registerUsername');
const registerEmail = document.getElementById('registerEmail');
const registerPassword = document.getElementById('registerPassword');
const registerBtn = document.getElementById('registerBtn');
const showRegisterLink = document.getElementById('showRegisterLink');
const showLoginLink = document.getElementById('showLoginLink');
const authMessage = document.getElementById('authMessage');

// ============================================
// DOM REFS - DASHBOARD
// ============================================

const userDisplay = document.getElementById('userDisplay');
const logoutBtn = document.getElementById('logoutBtn');
const refreshBtn = document.getElementById('refreshBtn');
const recipeList = document.getElementById('recipeList');

// Recipe Form
const createRecipeForm = document.getElementById('createRecipeForm');
const recipeTitle = document.getElementById('recipeTitle');
const recipeDescription = document.getElementById('recipeDescription');
const recipeIngredients = document.getElementById('recipeIngredients');
const recipeInstructions = document.getElementById('recipeInstructions');
const recipePrepTime = document.getElementById('recipePrepTime');
const recipeCookTime = document.getElementById('recipeCookTime');
const recipeServings = document.getElementById('recipeServings');
const recipeDifficulty = document.getElementById('recipeDifficulty');
const recipeImage = document.getElementById('recipeImage');
const submitRecipeBtn = document.getElementById('submitRecipeBtn');

// ============================================
// AUTH FUNCTIONS
// ============================================

function showAuthMessage(message, type) {
    authMessage.textContent = message;
    authMessage.className = `message ${type}`;
    authMessage.style.display = 'block';
    setTimeout(() => {
        authMessage.style.display = 'none';
    }, 5000);
}

function toggleAuthForms(showLogin) {
    loginForm.style.display = showLogin ? 'block' : 'none';
    registerForm.style.display = showLogin ? 'none' : 'block';
    authMessage.style.display = 'none';
}

// Register
registerBtn.addEventListener('click', async () => {
    const username = registerUsername.value.trim();
    const email = registerEmail.value.trim();
    const password = registerPassword.value.trim();

    if (!username || !email || !password) {
        showAuthMessage('All fields are required!', 'error');
        return;
    }

    if (password.length < 6) {
        showAuthMessage('Password must be at least 6 characters!', 'error');
        return;
    }

    registerBtn.disabled = true;
    registerBtn.textContent = 'Creating...';

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            showAuthMessage('✅ Registration successful! Please login.', 'success');
            registerUsername.value = '';
            registerEmail.value = '';
            registerPassword.value = '';
            setTimeout(() => toggleAuthForms(true), 1500);
        } else {
            showAuthMessage(data.message || 'Registration failed!', 'error');
        }
    } catch (error) {
        showAuthMessage('Network error. Is the server running?', 'error');
    } finally {
        registerBtn.disabled = false;
        registerBtn.textContent = 'Create Account';
    }
});

// Login
loginBtn.addEventListener('click', async () => {
    const email = loginEmail.value.trim();
    const password = loginPassword.value.trim();

    if (!email || !password) {
        showAuthMessage('Email and password required!', 'error');
        return;
    }

    loginBtn.disabled = true;
    loginBtn.textContent = 'Logging in...';

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('token', authToken);
            localStorage.setItem('user', JSON.stringify(currentUser));
            window.location.href = 'dashboard.html';
        } else {
            showAuthMessage(data.message || 'Login failed!', 'error');
        }
    } catch (error) {
        showAuthMessage('Network error. Is the server running?', 'error');
    } finally {
        loginBtn.disabled = false;
        loginBtn.textContent = 'Login';
    }
});

// Toggle forms
showRegisterLink.addEventListener('click', (e) => {
    e.preventDefault();
    toggleAuthForms(false);
});

showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    toggleAuthForms(true);
});

// ============================================
// DASHBOARD FUNCTIONS
// ============================================

if (window.location.pathname.includes('dashboard.html')) {
    if (!authToken || !currentUser) {
        window.location.href = 'index.html';
    } else {
        userDisplay.textContent = `👋 ${currentUser.username}`;
        loadRecipes();
    }
}

if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    });
}

async function loadRecipes() {
    recipeList.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>Loading recipes...</p>
        </div>
    `;

    try {
        const response = await fetch(`${API_URL}/recipes`);
        const data = await response.json();

        if (response.ok) {
            displayRecipes(data.recipes);
        } else {
            recipeList.innerHTML = `
                <div class="empty-state">
                    <div class="icon">⚠️</div>
                    <h3>Failed to load recipes</h3>
                    <p>${data.message || 'Please try again'}</p>
                </div>
            `;
        }
    } catch (error) {
        recipeList.innerHTML = `
            <div class="empty-state">
                <div class="icon">🔌</div>
                <h3>Cannot connect to server</h3>
                <p>Make sure the backend is running on port 3000</p>
            </div>
        `;
    }
}

function displayRecipes(recipes) {
    if (!recipes || recipes.length === 0) {
        recipeList.innerHTML = `
            <div class="empty-state">
                <div class="icon">🍽️</div>
                <h3>No recipes yet</h3>
                <p>Be the first to add a recipe!</p>
            </div>
        `;
        return;
    }

    recipeList.innerHTML = recipes.map(recipe => `
        <div class="recipe-card" data-id="${recipe.id}">
            <h3>${escapeHtml(recipe.title)}</h3>
            <div class="meta">
                <span class="difficulty-${recipe.difficulty?.toLowerCase() || 'medium'}">
                    ${recipe.difficulty || 'Medium'}
                </span>
                ${recipe.prep_time ? `<span>⏱️ ${recipe.prep_time}m prep</span>` : ''}
                ${recipe.cook_time ? `<span>🍳 ${recipe.cook_time}m cook</span>` : ''}
                ${recipe.servings ? `<span>👥 ${recipe.servings} servings</span>` : ''}
            </div>
            ${recipe.description ? `<p class="description">${escapeHtml(recipe.description)}</p>` : ''}
            <div class="ingredients">
                <strong>Ingredients:</strong> 
                ${Array.isArray(recipe.ingredients) ? recipe.ingredients.map(i => escapeHtml(i)).join(', ') : escapeHtml(recipe.ingredients || '')}
            </div>
            <div class="author">👤 By: ${escapeHtml(recipe.author || 'Unknown')}</div>
            <div class="recipe-actions">
                ${currentUser && recipe.user_id === currentUser.id ? `
                    <button class="btn-warning" onclick="toggleEdit(${recipe.id})">✏️ Edit</button>
                    <button class="btn-danger" onclick="deleteRecipe(${recipe.id})">🗑️ Delete</button>
                ` : ''}
                <button class="btn-secondary" onclick="viewRecipe(${recipe.id})">👁️ View</button>
            </div>
            <div class="edit-form" id="editForm_${recipe.id}" style="display: none;">
                <hr style="margin: 15px 0; border-color: rgba(255,255,255,0.1);">
                <h4 style="color: white;">Edit Recipe</h4>
                <div class="form-group">
                    <input type="text" id="editTitle_${recipe.id}" value="${escapeHtml(recipe.title)}" placeholder="Title">
                </div>
                <div class="form-group">
                    <textarea id="editDescription_${recipe.id}" placeholder="Description">${escapeHtml(recipe.description || '')}</textarea>
                </div>
                <div class="form-group">
                    <textarea id="editIngredients_${recipe.id}" placeholder="Ingredients">${Array.isArray(recipe.ingredients) ? recipe.ingredients.join(', ') : recipe.ingredients || ''}</textarea>
                </div>
                <div class="form-group">
                    <textarea id="editInstructions_${recipe.id}" placeholder="Instructions">${escapeHtml(recipe.instructions || '')}</textarea>
                </div>
                <div class="edit-actions">
                    <button class="btn-success" onclick="updateRecipe(${recipe.id})">💾 Save</button>
                    <button class="btn-secondary" onclick="toggleEdit(${recipe.id})">❌ Cancel</button>
                </div>
            </div>
        </div>
    `).join('');
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// RECIPE CRUD
// ============================================

if (createRecipeForm) {
    createRecipeForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const title = recipeTitle.value.trim();
        const ingredients = recipeIngredients.value.trim().split(',').map(i => i.trim()).filter(i => i);
        const instructions = recipeInstructions.value.trim();

        if (!title || ingredients.length === 0 || !instructions) {
            alert('Title, ingredients, and instructions are required!');
            return;
        }

        submitRecipeBtn.disabled = true;
        submitRecipeBtn.textContent = 'Adding...';

        try {
            const response = await fetch(`${API_URL}/recipes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    title,
                    description: recipeDescription.value.trim(),
                    ingredients,
                    instructions,
                    prep_time: parseInt(recipePrepTime.value) || null,
                    cook_time: parseInt(recipeCookTime.value) || null,
                    servings: parseInt(recipeServings.value) || null,
                    difficulty: recipeDifficulty.value,
                    image_url: recipeImage.value.trim() || null
                })
            });

            const data = await response.json();

            if (response.ok) {
                createRecipeForm.reset();
                loadRecipes();
                alert('✅ Recipe created successfully!');
            } else {
                alert(data.message || 'Failed to create recipe');
            }
        } catch (error) {
            alert('Network error. Is the server running?');
        } finally {
            submitRecipeBtn.disabled = false;
            submitRecipeBtn.textContent = '✨ Add Recipe';
        }
    });
}

function toggleEdit(recipeId) {
    const editForm = document.getElementById(`editForm_${recipeId}`);
    if (editForm) {
        const isVisible = editForm.style.display !== 'none';
        editForm.style.display = isVisible ? 'none' : 'block';
        const card = editForm.closest('.recipe-card');
        if (card) {
            card.classList.toggle('editing');
        }
    }
}

async function updateRecipe(recipeId) {
    const title = document.getElementById(`editTitle_${recipeId}`).value.trim();
    const description = document.getElementById(`editDescription_${recipeId}`).value.trim();
    const ingredients = document.getElementById(`editIngredients_${recipeId}`).value.trim().split(',').map(i => i.trim()).filter(i => i);
    const instructions = document.getElementById(`editInstructions_${recipeId}`).value.trim();

    if (!title || ingredients.length === 0 || !instructions) {
        alert('Title, ingredients, and instructions are required!');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/recipes/${recipeId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                title,
                description,
                ingredients,
                instructions,
                prep_time: null,
                cook_time: null,
                servings: null,
                difficulty: 'Medium',
                image_url: null
            })
        });

        const data = await response.json();

        if (response.ok) {
            loadRecipes();
            alert('✅ Recipe updated successfully!');
        } else {
            alert(data.message || 'Failed to update recipe');
        }
    } catch (error) {
        alert('Network error. Is the server running?');
    }
}

async function deleteRecipe(recipeId) {
    if (!confirm('Are you sure you want to delete this recipe?')) return;

    try {
        const response = await fetch(`${API_URL}/recipes/${recipeId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            loadRecipes();
            alert('✅ Recipe deleted successfully!');
        } else {
            const data = await response.json();
            alert(data.message || 'Failed to delete recipe');
        }
    } catch (error) {
        alert('Network error. Is the server running?');
    }
}

function viewRecipe(recipeId) {
    alert(`View recipe ${recipeId} - Feature coming soon!`);
}