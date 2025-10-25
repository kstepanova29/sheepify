# PostgreSQL Setup Guide

## Current Configuration

**Database Config Location:** [app/config.py](app/config.py) (Line 12)

Currently using SQLite:
```python
DATABASE_URL: str = "sqlite:///./sheepify.db"
```

Database connection is in: [app/core/database.py](app/core/database.py)

## Switching to PostgreSQL

### Option 1: Use Environment Variables (Recommended)

1. **Create a `.env` file** in `src/backend/`:

```bash
# src/backend/.env
APP_NAME=Sheepify API
APP_VERSION=1.0.0
DEBUG=True
API_V1_PREFIX=/api/v1

# PostgreSQL Database
DATABASE_URL=postgresql://username:password@localhost:5432/sheepify
```

2. **Install PostgreSQL driver**:

```bash
pip install psycopg2-binary
# OR for better performance:
pip install psycopg2
```

3. **Update requirements.txt**:

Add this line to `src/backend/requirements.txt`:
```
psycopg2-binary==2.9.9
```

### Option 2: Modify config.py Directly

Edit [app/config.py](app/config.py) line 12:

```python
# Change from:
DATABASE_URL: str = "sqlite:///./sheepify.db"

# To:
DATABASE_URL: str = "postgresql://username:password@localhost:5432/sheepify"
```

## PostgreSQL Installation

### Windows

1. **Download PostgreSQL:**
   - https://www.postgresql.org/download/windows/
   - Install with default settings
   - Remember the password you set for user `postgres`

2. **Create Database:**
   ```bash
   # Open psql (PostgreSQL interactive terminal)
   psql -U postgres

   # Create database
   CREATE DATABASE sheepify;

   # Create user (optional)
   CREATE USER sheepify_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE sheepify TO sheepify_user;

   # Exit
   \q
   ```

3. **Connection String:**
   ```
   postgresql://postgres:your_password@localhost:5432/sheepify
   # OR with custom user:
   postgresql://sheepify_user:your_password@localhost:5432/sheepify
   ```

### macOS

```bash
# Using Homebrew
brew install postgresql@15
brew services start postgresql@15

# Create database
createdb sheepify

# Connection string:
postgresql://localhost:5432/sheepify
```

### Linux (Ubuntu/Debian)

```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database
sudo -u postgres createdb sheepify

# Create user
sudo -u postgres psql
CREATE USER sheepify_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE sheepify TO sheepify_user;
\q

# Connection string:
postgresql://sheepify_user:your_password@localhost:5432/sheepify
```

### Docker (Easiest)

1. **Create `docker-compose.yml`** in `src/backend/`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: sheepify_db
    environment:
      POSTGRES_USER: sheepify_user
      POSTGRES_PASSWORD: sheepify_pass
      POSTGRES_DB: sheepify
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U sheepify_user"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

2. **Start PostgreSQL:**
   ```bash
   docker-compose up -d
   ```

3. **Connection String:**
   ```
   postgresql://sheepify_user:sheepify_pass@localhost:5432/sheepify
   ```

## Complete Setup Steps

### 1. Install PostgreSQL Driver

```bash
cd src/backend
pip install psycopg2-binary
```

### 2. Create `.env` File

```bash
# Create .env file
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL=postgresql://sheepify_user:sheepify_pass@localhost:5432/sheepify
```

### 3. Start PostgreSQL

Choose one method:
- **Docker:** `docker-compose up -d`
- **Local Service:** Already running from installation
- **Homebrew (Mac):** `brew services start postgresql@15`

### 4. Verify Connection

```bash
# Test connection
psql postgresql://sheepify_user:sheepify_pass@localhost:5432/sheepify

# Should connect successfully
# Type \q to exit
```

### 5. Run the Backend

```bash
cd src/backend
python run.py
```

The tables will be auto-created on first run!

## Database URL Format

```
postgresql://[user]:[password]@[host]:[port]/[database]
```

Examples:
- Local default: `postgresql://postgres:password@localhost:5432/sheepify`
- Docker: `postgresql://sheepify_user:sheepify_pass@localhost:5432/sheepify`
- Remote: `postgresql://user:pass@192.168.1.100:5432/sheepify`
- Cloud (Render): `postgresql://user:pass@hostname.render.com/database`
- Cloud (Supabase): Get connection string from Supabase dashboard

## Configuration Architecture

```
src/backend/
├── .env                    ← Environment variables (DATABASE_URL here)
├── .env.example           ← Template
├── app/
│   ├── config.py          ← Loads DATABASE_URL from .env
│   └── core/
│       └── database.py    ← Creates engine from config
```

**How it works:**
1. `.env` file contains `DATABASE_URL`
2. `config.py` loads it via `pydantic-settings`
3. `database.py` uses `settings.DATABASE_URL`
4. SQLAlchemy auto-detects PostgreSQL vs SQLite

## Verify Setup

Test the configuration:

```python
# Quick test script
from app.config import settings
from app.core.database import engine

print(f"Database URL: {settings.DATABASE_URL}")
print(f"Engine: {engine}")
print(f"Dialect: {engine.dialect.name}")  # Should show "postgresql"

# Test connection
try:
    with engine.connect() as conn:
        print("✅ Database connection successful!")
except Exception as e:
    print(f"❌ Connection failed: {e}")
```

## Troubleshooting

### Error: `ModuleNotFoundError: No module named 'psycopg2'`
```bash
pip install psycopg2-binary
```

### Error: `connection refused`
- PostgreSQL not running: `sudo systemctl start postgresql` (Linux)
- Wrong port: Check PostgreSQL is on port 5432
- Firewall blocking: Allow port 5432

### Error: `authentication failed`
- Wrong password in DATABASE_URL
- User doesn't exist: Create with `CREATE USER`
- Check pg_hba.conf for auth settings

### Error: `database does not exist`
```bash
createdb sheepify
# OR in psql:
CREATE DATABASE sheepify;
```

### Tables not created
- Make sure server started: Check logs for errors
- SQLAlchemy creates tables on `Base.metadata.create_all()`
- Check [app/main.py](app/main.py) - should have startup event

## Migration to PostgreSQL from SQLite

If you have existing SQLite data:

1. **Export SQLite data:**
   ```bash
   sqlite3 sheepify.db .dump > dump.sql
   ```

2. **Import to PostgreSQL:**
   ```bash
   psql -U sheepify_user -d sheepify < dump.sql
   ```

Note: May need manual adjustments for syntax differences

## Production Recommendations

- ✅ Use connection pooling (already configured in database.py)
- ✅ Use environment variables for credentials
- ✅ Never commit `.env` to git (already in .gitignore)
- ✅ Use SSL for remote connections
- ✅ Set up regular backups
- ✅ Monitor connection pool size

## Next Steps: Migrations with Alembic

For production, use Alembic for database migrations:

```bash
pip install alembic
alembic init migrations
```

This allows version-controlled schema changes instead of auto-creating tables.
