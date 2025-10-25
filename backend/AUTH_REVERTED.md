# Authentication Reverted to Local

Firebase authentication has been removed. Back to simple username/password authentication.

## ✅ What Changed Back

### Authentication
- ❌ Removed Firebase token verification
- ✅ Restored username/password login
- ✅ Simple local auth - no external dependencies

### User Model
- ❌ Removed `firebase_uid` field
- ✅ Restored `password` field (plain text for simplicity)

### API Endpoints
- ✅ **POST /api/v1/auth/register** - Username/password registration
- ✅ **POST /api/v1/auth/login** - Username/password login
- ✅ **GET /api/v1/auth/user/{user_id}** - Get user profile
- ❌ Removed `/auth/verify` endpoint
- ❌ Removed `/auth/me` endpoint

## Files Cleaned Up

### Removed
- ❌ `app/core/security.py` (Firebase token verification)
- ❌ `app/core/dependencies.py` (Firebase auth dependency)
- ❌ `FIREBASE_SETUP.md`
- ❌ `FIREBASE_QUICK_START.md`

### Restored
- ✅ `app/config.py` - Removed Firebase config
- ✅ `app/models/user.py` - Back to password field
- ✅ `app/schemas/user.py` - Back to UserLogin schema
- ✅ `app/api/v1/auth.py` - Simple auth endpoints
- ✅ `app/main.py` - No Firebase initialization
- ✅ `requirements.txt` - Removed firebase-admin
- ✅ `.env.example` - Removed Firebase variables

## API Usage

### Register
```bash
POST /api/v1/auth/register
```
```json
{
  "username": "sleepy_user",
  "email": "user@example.com",
  "password": "password123",
  "farm_name": "Dream Farm",
  "timezone": "UTC"
}
```

### Login
```bash
POST /api/v1/auth/login
```
```json
{
  "username": "sleepy_user",
  "password": "password123"
}
```

Returns user object with `user_id` for subsequent requests.

## Database

User table now has:
- `id` - UUID
- `username` - Unique
- `email` - Optional, unique
- `password` - Plain text (no hashing)
- `farm_name`
- `wool_balance`
- Other fields...

## Postman Collection

New collection created: `Sheepify_API.postman_collection.json`

Import and test:
1. Register user
2. Login
3. Use `user_id` for other endpoints

All working with simple local auth!
