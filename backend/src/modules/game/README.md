# Game Module

## Overview
Core game logic for the coin mining game. Handles user state, mining actions, upgrades, and idle coin generation.

## Architecture

### Components

**Controller** (`game.controller.ts`)
- REST API endpoints for game actions
- Input validation and error handling
- Swagger documentation

**Service** (`game.service.ts`)
- Business logic and game rules
- Cooldown enforcement (5s between clicks)
- Idle coin calculation
- Upgrade mechanics

**Repository** (`prisma.repository.ts`)
- Database operations using Prisma ORM
- Atomic transactions for state updates
- User creation and state management

**DTOs** (`dto/`)
- Request/response validation
- Swagger API documentation
- Type safety for API contracts

### Game Rules

**Mining:**
- Base: 1 coin per click
- Cooldown: 5 seconds between clicks
- Super Click levels: 1→2, 2→3, 3→4, 4→5 coins per click

**Upgrades:**
- Auto Miner: Generates 1 coin at intervals (L1: 30s, L2: 20s, L3: 15s, L4: 10s)
- Super Click: Increases coins per click (levels 1-4)
- Costs: Auto-miner [10, 100, 1000, 10000], Super-click [5, 50, 500, 5000]
- Max level: 4 for both upgrades

**Idle Generation:**
- Applied when user takes any action after being away
- Auto-miner generates coins based on time elapsed and level interval
- Passive income for AFK periods

## API Endpoints

- `GET /state` - Get current game state
- `POST /mine` - Mine coins (with cooldown)
- `POST /purchase` - Buy upgrades
- `POST /collect` - Collect idle coins

## Database Schema

See `prisma/schema.prisma` for full schema:
- User: Basic user info
- PlayerState: Game state (coins, upgrades, timestamps)
- Upgrade: Available upgrade types and costs
