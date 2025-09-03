# Coin Miner Game

Small full-stack idle clicker game built as a coding challenge.
Players mine coins, buy upgrades, and with auto-miner can earn passive income over time.
The backend relies on the database for persistence.

## 🚀 Tech Stack

- **Frontend**: React (Vite, TypeScript, Tailwind, shadcn/ui, React Query)
- **Backend**: Node.js (TypeScript, NestJS), REST API
- **Database**: PostgreSQL (via Prisma ORM for ease of setup and migrations)
- **Infrastructure (Yet to incorporate)**: AWS (ECS Fargate, RDS, S3 + CloudFront, ALB, Secrets Manager) with IaC (Terraform)
- **CI/CD**: GitHub Actions (lint, test, build, deploy)

## 🎮 Features

- Unique user ID, persistent state in Postgres
- Mine button with cooldown
- Upgrades: Auto-Miner and Super Click
- Auto-Miner: Passive coin accruence while idle
- Super Click: Mine more coins instantly
- Server-side validation, no cheating in client.

## 🧩 API Endpoints

- `GET /state` → fetch current game state
- `POST /mine` → mine coins (cooldown enforced)
- `POST /purchase` → buy an upgrade
- `POST /collect` → collect idle coins

## 🏗️ Design Decisions

- **Database**: PostgreSQL chosen due to the nature of the game and ease of setup and migrations.
- **Backend Framework**: NestJS chosen for structure (controllers, services, DI) and built-in Swagger/OpenAPI support.
- **Frontend Framework**: React chosen for familiarity and ecosystem; Tailwind + shadcn/ui for accessible, modern UI with minimal boilerplates.
- **Deployment**: AWS ECS Fargate + ALB chosen as simple choice for containerised app with scaling (if we would ever need that).
- **CI/CD**: GitHub Actions for test + deploy pipeline, with Docker images pushed to ECR.

## 🏗️ Infrastructure
![Infrastructure diagram](architecture.png)

## Repo Layout

```
coin-miner/
  backend/                 # NestJS + Prisma
  frontend/                # React (Vite) + TS + Tailwind + shadcn/ui
  docker-compose.yml       # Postgres for local dev
  README.md
```

## 📋 Requirements

### Install Manually
- **Node.js v18+**: [Download from nodejs.org](https://nodejs.org/)
- **Docker**: [Get Docker Desktop](https://www.docker.com/products/docker-desktop/)
- **Git**: [Install Git](https://git-scm.com/downloads)

### Installed via npm
**Backend:**
- NestJS, Prisma, PostgreSQL client, class-validator, Swagger

**Frontend:**
- React, Vite, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query

**Dev Tools (VScode extensions):**
- ESLint, Prettier, Jest, Vitest

## ⚙️ Running Locally

### 1. Start Postgres
```bash
docker compose up -d 
```

### 2. Prepare Backend
```bash
cd backend
npm install
```

Create `backend/.env`:
```env
DATABASE_URL="postgresql://app:app@localhost:5432/coinminer?schema=public"
PORT=3000
NODE_ENV=development
```

Generate Prisma Client:
```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 3. Prepare Frontend
```bash
cd ../frontend
npm install
```

Create `frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:3000
```

Check `tailwind.config.js` includes:
```javascript
content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"]
```

Check `src/index.css` includes:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 4. Verify Postgres is running
```bash
docker compose ps
# if not running:
docker compose up -d
```

### 5. Run Backend
```bash
cd ../backend
npm run dev
```
Visit localhost:3000 to test if up
Swagger docs available at: http://localhost:3000/docs

### 6. Run Frontend (in new terminal)
```bash
cd ../frontend  # or cd frontend
npm run dev
```

Vite dev server runs on http://localhost:5173

### 7. Stop/Start Services

To stop frontend/backend: `Ctrl+C` in each terminal

To stop Postgres (in repo root):
```bash
docker compose down
```

To restart everything:
```bash
docker compose up -d
cd backend && npm run dev
cd ../frontend && npm run dev
```

Visit http://localhost:5173 (frontend) → connects to http://localhost:3000 (backend)

## 📦 Deployment

- **Frontend**: Deployed to S3 + CloudFront (via IaC)
- **Backend**: Dockerized and deployed to ECS Fargate, behind an ALB
- **Database**: RDS Postgres
