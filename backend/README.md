# Sheepify Backend

Minimalistic backend for Sheepify - a sleep tracking app with sheep/wool economy. Built following the spec structure but simplified for MVP.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the server:
```bash
cd backend
python run.py
```

Or directly with uvicorn:
```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

## API Documentation

Once running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## API Endpoints

All endpoints are prefixed with `/api/v1`

### Authentication (`/api/v1/auth`)
- `POST /register` - Register a new user (auto-creates starter sheep)
- `POST /login` - Login with username/password
- `GET /user/{user_id}` - Get user profile

### Sleep Tracking (`/api/v1/sleep`)
- `POST /start?user_id={user_id}` - Start a sleep session
- `POST /complete` - Complete session and calculate rewards
- `GET /sessions/{user_id}` - Get sleep history (paginated)
- `GET /active/{user_id}` - Get active sleep session
- `GET /stats/weekly/{user_id}` - Get weekly statistics

### Sheep Management (`/api/v1/sheep`)
- `POST /create?user_id={user_id}` - Create new sheep (admin/reward)
- `GET /user/{user_id}` - Get all user's sheep
- `GET /{sheep_id}` - Get specific sheep
- `PATCH /{sheep_id}?user_id={user_id}` - Update sheep (name, favorite)

### Wool Economy (`/api/v1/wool`)
- `GET /balance/{user_id}` - Get wool balance and generation rate
- `POST /collect/{user_id}` - Manually collect wool from sheep
- `GET /transactions/{user_id}` - Get transaction history
- `POST /purchase?user_id={user_id}&item_id={id}&amount={amount}` - Purchase with wool

## Key Features

**Database Models:**
- User (username, email, password, farm_name, wool_balance, sleep goals)
- Sheep (type, level, experience, wool generation rate)
- SleepSession (start/end time, duration, quality score, rewards)
- WoolTransaction (amount, source, balance tracking)

**Sleep Quality Algorithm:**
- Duration score (40 pts): Optimal 8-10 hours
- Timing score (30 pts): Best bedtime 21:00-23:00
- Consistency score (30 pts): Regular sleep schedule bonus
- Total: 0-100 quality score

**Wool Economy:**
- Base: 50 wool per hour of sleep
- Multiplied by quality score (0-1.0)
- Sheep generate wool passively (5-50 wool/hour based on type)
- Chance to earn rare sheep for high-quality sleep (>70 score)

**Sheep Types:**
- Starter: 5 wool/hour
- Merino: 10 wool/hour
- Suffolk: 15 wool/hour
- Cotswold: 20 wool/hour
- Golden: 50 wool/hour

## Project Structure

```
backend/
├── app/
│   ├── main.py                 # FastAPI app
│   ├── config.py               # Settings
│   ├── api/
│   │   └── v1/
│   │       ├── auth.py         # Auth endpoints
│   │       ├── sleep.py        # Sleep tracking
│   │       ├── sheep.py        # Sheep management
│   │       └── wool.py         # Wool economy
│   ├── models/                 # SQLAlchemy models
│   │   ├── user.py
│   │   ├── sheep.py
│   │   ├── sleep.py
│   │   └── wool.py
│   ├── schemas/                # Pydantic schemas
│   ├── services/               # Business logic
│   │   ├── sleep_service.py
│   │   ├── sheep_service.py
│   │   └── wool_service.py
│   └── core/                   # Core utilities
│       ├── database.py
│       └── exceptions.py
├── requirements.txt
├── run.py
└── README.md
```

## Simplified for MVP

This implementation follows the spec structure but removes:
- ❌ PostgreSQL (using SQLite)
- ❌ Redis/caching
- ❌ Firebase Auth (simple password auth)
- ❌ JWT tokens
- ❌ Celery background tasks
- ❌ AI/ML features (Claude, ChromaDB, voice)
- ❌ Social features (friends, pranks, leaderboard)
- ❌ WebSockets
- ❌ Security features (password hashing, rate limiting)

**Focus:** Core functionality only - auth, sleep tracking, sheep/wool economy

## Database

SQLite database (`sheepify.db`) is auto-created on first run. All tables are created automatically via SQLAlchemy.
