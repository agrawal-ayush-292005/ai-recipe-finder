# 🍳 AI Recipe Finder

An intelligent full-stack recipe app powered by Google Gemini AI.

![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)
![Express](https://img.shields.io/badge/Express-4.18.x-blue.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15.x-blue.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

---

## ✨ Features

- 🔐 **Auth** - JWT + bcrypt
- 🤖 **AI Recipes** - Generate recipes using Google Gemini
- 🔍 **Search** - Search by title, ingredients, cuisine
- 🥘 **Pantry** - Track ingredients and get suggestions
- ⭐ **Save Recipes** - Store AI recipes to your collection
- 🌓 **Dark Mode** - Light/dark theme toggle
- 📱 **Responsive** - Works on all devices

---

## 🛠️ Tech Stack

| Backend | Frontend | Database |
|---------|----------|----------|
| Node.js | HTML5 | PostgreSQL |
| Express.js | CSS3 | pg |
| bcrypt | JavaScript | |
| JWT | Font Awesome | |
| @google/genai | | |

---

## 📁 Structure
ai-recipe-finder/
├── backend/
│ ├── server.js
│ ├── db/pool.js
│ ├── middleware/auth.js
│ └── routes/
│ ├── auth.js
│ ├── recipes.js
│ └── ai.js
├── frontend/
│ ├── index.html
│ ├── recipes.html
│ ├── recipe-detail.html
│ ├── login.html
│ ├── register.html
│ ├── about.html
│ ├── contact.html
│ ├── pantry.html
│ ├── css/style.css
│ └── js/script.js
└── database/schema.sql

text

---

## 🚀 Setup

### 1. Clone & Install
```bash
git clone https://github.com/agrawal-ayush-292005/ai-recipe-finder.git
cd ai-recipe-finder/backend
npm install
2. Setup Database
bash
psql -U postgres
CREATE DATABASE ai_recipe_finder;
\c ai_recipe_finder
\i database/schema.sql
\q
3. Configure .env
env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=root
DB_NAME=ai_recipe_finder
JWT_SECRET=your_secret_key
GEMINI_API_KEY=your_gemini_key
4. Get Gemini API Key (FREE)
👉 aistudio.google.com → Get API Key

5. Start Server
bash
npm run dev
Server runs at http://localhost:3000

6. Open Frontend
Open frontend/index.html in browser.

📚 API Endpoints
Auth
Method	Endpoint	Auth
POST	/api/auth/register	❌
POST	/api/auth/login	❌
GET	/api/auth/profile	✅
Recipes
Method	Endpoint	Auth
GET	/api/recipes	❌
GET	/api/recipes/:id	❌
POST	/api/recipes	✅
PUT	/api/recipes/:id	✅
DELETE	/api/recipes/:id	✅
AI
Method	Endpoint	Auth
POST	/api/ai/generate-recipe	✅
POST	/api/ai/substitute	✅
🧪 Quick Test
bash
# Health check
curl http://localhost:3000/api/health

# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@email.com","password":"password123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@email.com","password":"password123"}'
📅 Progress
✅ Day 1 - Project Setup

✅ Day 2 - Database Schema

✅ Day 3 - Authentication

✅ Day 4 - Recipe CRUD

✅ Day 5 - Frontend (8 pages)

✅ Day 6 - AI Integration (Gemini)

✅ Day 7 - Bug Fixes & Integration

👨‍💻 Author
Ayush Agrawal

GitHub: @agrawal-ayush-292005

LinkedIn: ayush-agrawal-7b6a94329

Email: ayushagrawal0931@gmail.com

Phone: +91 85285 12005

Location: Gorakhpur, UP, India

📝 License
MIT License

🙏 Acknowledgments
Google Gemini AI

PostgreSQL

Express.js

bcrypt

JWT

Built with ❤️ by Ayush Agrawal | Made in India 🇮🇳

© 2026 Pantry®

text

---

## ✅ HOW TO USE

1. Open `README.md`
2. Select All (`Ctrl+A`)
3. Delete
4. Paste this
5. Save (`Ctrl+S`)
6. Push:
```bash
git add README.md
git commit -m "Short clean README"
git push origin main