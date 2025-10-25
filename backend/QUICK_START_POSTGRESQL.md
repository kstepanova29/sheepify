# Quick Start: PostgreSQL Setup

## TL;DR - Fastest Way (Docker)

```bash
# 1. Start PostgreSQL with Docker
cd src/backend
docker-compose up -d

# 2. Create .env file
cp .env.example .env
```

Edit `.env` - change the DATABASE_URL line:
```env
DATABASE_URL=postgresql://sheepify_user:sheepify_pass@localhost:5432/sheepify
```

```bash
# 3. Install PostgreSQL driver
pip install psycopg2-binary

# 4. Run backend
python run.py
```

Done! ✅

## Where Are the Configs?

### 🗂️ Database Configuration Files

1. **Main Config:** [app/config.py](app/config.py) - Line 12
   ```python
   DATABASE_URL: str = "sqlite:///./sheepify.db"  # ← Change this
   ```

2. **Environment File:** `.env` (create from `.env.example`)
   ```env
   DATABASE_URL=postgresql://user:pass@localhost:5432/sheepify
   ```

3. **Database Connection:** [app/core/database.py](app/core/database.py)
   - Automatically uses the DATABASE_URL from config
   - No changes needed here!

### 📋 How Config Loading Works

```
.env file
   ↓
app/config.py (loads via pydantic-settings)
   ↓
settings.DATABASE_URL
   ↓
app/core/database.py (creates SQLAlchemy engine)
   ↓
Auto-detects PostgreSQL vs SQLite
```

## Two Ways to Configure

### Option A: Environment Variable (Recommended)

1. Create `.env` in `src/backend/`:
   ```env
   DATABASE_URL=postgresql://sheepify_user:sheepify_pass@localhost:5432/sheepify
   ```

2. That's it! Config.py will auto-load it.

### Option B: Hardcode in config.py

Edit [app/config.py](app/config.py):
```python
# Line 12, change from:
DATABASE_URL: str = "sqlite:///./sheepify.db"

# To:
DATABASE_URL: str = "postgresql://sheepify_user:sheepify_pass@localhost:5432/sheepify"
```

⚠️ **Not recommended** - credentials in code = bad practice

## Setup Methods

### Method 1: Docker (Recommended - Easiest)

```bash
# Already created docker-compose.yml for you!
docker-compose up -d

# Check it's running:
docker-compose ps

# View logs:
docker-compose logs -f

# Stop when done:
docker-compose down
```

**Connection String:**
```
postgresql://sheepify_user:sheepify_pass@localhost:5432/sheepify
```

### Method 2: Local PostgreSQL Install

**Windows:**
1. Download: https://www.postgresql.org/download/windows/
2. Install with defaults
3. Remember postgres password

**Create database:**
```bash
psql -U postgres
CREATE DATABASE sheepify;
\q
```

**Connection String:**
```
postgresql://postgres:YOUR_PASSWORD@localhost:5432/sheepify
```

**macOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
createdb sheepify
```

**Connection String:**
```
postgresql://localhost:5432/sheepify
```

## Complete Setup Checklist

- [ ] PostgreSQL running (Docker or local)
- [ ] Created `.env` file from `.env.example`
- [ ] Updated `DATABASE_URL` in `.env`
- [ ] Installed `psycopg2-binary`: `pip install psycopg2-binary`
- [ ] Run backend: `python run.py`
- [ ] Check logs - should see "Application startup complete"

## Test Connection

### Quick Python Test

```python
# test_db.py
from app.config import settings
from app.core.database import engine

print(f"🔗 Database URL: {settings.DATABASE_URL}")
print(f"🗄️ Database Type: {engine.dialect.name}")

try:
    with engine.connect() as conn:
        result = conn.execute("SELECT version();")
        version = result.fetchone()[0]
        print(f"✅ Connected to PostgreSQL!")
        print(f"📊 Version: {version}")
except Exception as e:
    print(f"❌ Connection failed: {e}")
```

```bash
python test_db.py
```

### Using psql

```bash
# Test connection directly
psql postgresql://sheepify_user:sheepify_pass@localhost:5432/sheepify

# Should connect successfully
# List tables (after running backend once):
\dt

# Should show: users, sheep, sleep_sessions, wool_transactions
```

## Common Issues

### `ModuleNotFoundError: No module named 'psycopg2'`
```bash
pip install psycopg2-binary
```

### `connection refused` / `could not connect to server`
- PostgreSQL not running
- Check Docker: `docker-compose ps`
- Check local: `pg_isready` or `brew services list`

### `password authentication failed`
- Wrong password in DATABASE_URL
- Double-check .env file
- Check username exists in PostgreSQL

### Tables not created
- Backend didn't start properly - check logs
- Run `python run.py` and look for errors
- Tables auto-create on first startup

## Verify Everything Works

```bash
# 1. Start PostgreSQL
docker-compose up -d

# 2. Check status
docker-compose ps
# Should show: sheepify_postgres | running

# 3. Test connection
psql postgresql://sheepify_user:sheepify_pass@localhost:5432/sheepify -c "SELECT 1;"
# Should return: 1

# 4. Start backend
python run.py

# 5. Check in browser
# http://localhost:8000/health
# Should return: {"status": "healthy"}

# 6. Register a user (creates tables automatically)
# Use Postman or curl:
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test_user",
    "email": "test@example.com",
    "password": "password123",
    "farm_name": "Test Farm",
    "timezone": "UTC"
  }'

# 7. Verify tables created
psql postgresql://sheepify_user:sheepify_pass@localhost:5432/sheepify -c "\dt"
# Should list: users, sheep, sleep_sessions, wool_transactions
```

## File Locations Summary

```
src/backend/
├── .env                          ← CREATE THIS (database URL here)
├── .env.example                  ← Template (updated with PostgreSQL examples)
├── docker-compose.yml            ← NEW! For running PostgreSQL
├── requirements.txt              ← Added psycopg2-binary comment
├── POSTGRESQL_SETUP.md           ← Full detailed guide
├── QUICK_START_POSTGRESQL.md     ← This file
│
├── app/
│   ├── config.py                 ← Reads DATABASE_URL (line 12)
│   └── core/
│       └── database.py           ← Creates DB connection
```

## Next Steps After PostgreSQL Works

1. **Test with Postman** - Import the collection, register users, track sleep
2. **View data in PostgreSQL:**
   ```bash
   psql postgresql://sheepify_user:sheepify_pass@localhost:5432/sheepify
   SELECT * FROM users;
   ```
3. **Add migrations** - For production, use Alembic (see POSTGRESQL_SETUP.md)

## Need Help?

- Full guide: [POSTGRESQL_SETUP.md](POSTGRESQL_SETUP.md)
- PostgreSQL docs: https://www.postgresql.org/docs/
- SQLAlchemy docs: https://docs.sqlalchemy.org/
