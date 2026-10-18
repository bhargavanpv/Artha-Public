# Artha — AI-Powered Expense Tracker

> Ask your finances a question. Get a real answer.

**Live Demo → [getarthaai.com](https://getarthaai.com)**

Artha is a full-stack personal finance application where users can track expenses, visualize spending patterns, and interact with their financial data through a natural language AI chat interface. Built as a production-deployed MERN application with a mobile-first PWA architecture.

---

## What it does

Most expense trackers make you dig through menus and filters to understand your money. Artha lets you just ask.

- **"How much did I spend on food last month?"**
- **"Which merchant am I spending the most at?"**
- **"Show me my top 5 expenses this week."**

The AI chat doesn't hallucinate numbers — it translates your question into a structured MongoDB aggregation query, runs it against your real data, and explains the result in plain English.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Redux Toolkit, Recharts, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT (Access + Refresh token pattern) |
| AI | Claude API (Anthropic) — tool/function calling |
| Deployment | EC2 (backend), S3 static hosting (frontend) |
| Architecture | REST API, MVC pattern, Mobile-first PWA |

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                     Frontend (React)                 │
│   Redux Store → Axios interceptor → JWT attachment   │
└──────────────────────┬──────────────────────────────┘
                       │ REST API
┌──────────────────────▼──────────────────────────────┐
│                  Backend (Express)                   │
│                                                      │
│  Auth routes    Transaction routes    AI routes      │
│       │               │                  │           │
│  JWT middleware  MongoDB aggregations  Claude API    │
│       │               │                  │           │
│       └───────────────▼──────────────────┘          │
│                   MongoDB (Atlas)                    │
└─────────────────────────────────────────────────────┘
```

**Key design decision:** The backend owns all financial logic. MongoDB aggregations for grouping, summing, and filtering are computed server-side. The LLM (Claude) is used only to translate natural language into structured function calls and to explain results — it never touches raw data directly. This keeps responses accurate and prevents hallucination.

---

## Features

**Authentication**
- JWT-based auth with secure token handling
- Protected routes on both frontend and backend
- Auth middleware on all financial endpoints

**Dashboard & Analytics**
- Category breakdown — donut chart by spend type
- Monthly spending trend — bar chart with period comparison
- Top merchants by transaction volume
- All charts powered by Recharts with real MongoDB aggregation data

**AI Chat**
- Natural language interface for querying your own financial data
- Powered by Claude API with tool/function calling
- Structured query generation — LLM outputs a function call, backend executes it, result is explained in plain English
- Prevents hallucination by grounding every response in live DB data

**Transaction Management**
- Add, view, search and filter transactions
- Rule-based auto-categorization on input
- CSV/PDF bank statement parsing

---

## Project Structure

```
artha/
├── backend/
│   ├── controllers/        # Route handlers — auth, transactions, AI chat
│   ├── middleware/         # JWT auth middleware
│   ├── models/             # Mongoose schemas — User, Transaction
│   ├── routes/             # Express route definitions
│   ├── services/           # AI service — Claude API integration
│   └── server.js           # Entry point
│
├── frontend/
│   ├── src/
│   │   ├── api/            # Axios instance with JWT interceptor
│   │   ├── components/     # Reusable UI components
│   │   ├── features/       # Redux slices — auth, transactions, chat
│   │   ├── pages/          # Route-level views
│   │   └── App.jsx
│   └── public/
│
└── docs/                   # Architecture diagrams, API reference
```

---

## Local Setup

**Prerequisites:** Node.js 18+, MongoDB Atlas account, Anthropic API key

```bash
# 1. Clone the repo
git clone https://github.com/bhargavanpv/Artha-Public.git
cd Artha-Public

# 2. Backend setup
cd backend
npm install
cp .env.example .env
# Fill in your values in .env
npm start

# 3. Frontend setup (new terminal)
cd frontend
npm install
npm start
```

**Environment variables** — create `backend/.env`:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
ANTHROPIC_API_KEY=your_anthropic_api_key
CLIENT_URL=http://localhost:3000
PORT=5000
```

---

## Deployment

| Service | Platform |
|---|---|
| Backend (Node/Express) | AWS EC2 (t2.micro) + PM2 |
| Frontend (React build) | AWS S3 static hosting |
| Database | MongoDB Atlas |
| Domain | getarthaai.com |

The frontend React build is served from S3 with public read access. The backend runs on EC2 managed by PM2 for process persistence. Both talk over REST. No Docker or orchestration — intentionally kept lean for a solo-deployed portfolio project.

---

## What I'd add with more time

- CloudFront CDN in front of S3 for faster global delivery
- Presigned S3 URLs for bank statement file uploads (removes size limits)
- Redis caching layer for frequent aggregation queries
- Refresh token rotation with Redis blacklist
- Rate limiting on AI chat endpoint

---

## Author

**Bhargavan PV** — CS graduate, VIT Chennai (2026)

Full-stack developer focused on MERN, currently building in public.

[LinkedIn](https://linkedin.com/in/bhargavanpv) · [Live App](https://getarthaai.com) · [GitHub](https://github.com/bhargavanpv)

---

> This is the public portfolio version of Artha. The production codebase is kept private. No API keys or credentials are present in this repository.
