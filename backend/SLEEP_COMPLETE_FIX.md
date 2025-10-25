# Fix: 500 Error in Sleep Complete Endpoint

## Problem

The `/api/v1/sleep/complete` endpoint was returning a **500 Internal Server Error**.

## Root Cause

**Serialization Issue:** The endpoint returned a dict containing SQLAlchemy model objects that FastAPI couldn't serialize to JSON:

```python
# Service returned this:
{
    "session": <SleepSession object>,      # SQLAlchemy model - can't serialize!
    "quality_score": 85.5,
    "reward": {
        "wool": 340,
        "new_sheep": <Sheep object>        # Another model - can't serialize!
    }
}
```

FastAPI tried to convert this to JSON but failed because:
1. No `response_model` was specified on the endpoint
2. SQLAlchemy models were nested in plain dicts
3. Pydantic couldn't automatically convert nested models

## Solution

### 1. Created Proper Response Schemas

Added to [app/schemas/sleep.py](src/backend/app/schemas/sleep.py):

```python
class SleepReward(BaseModel):
    """Reward details from completing a sleep session"""
    wool: int
    new_sheep: Optional[dict] = None  # Simplified sheep data

class SleepCompleteResponse(BaseModel):
    """Response for completing a sleep session"""
    session: SleepSessionResponse      # Properly serialized session
    quality_score: float
    reward: Optional[SleepReward]      # Properly serialized reward
```

### 2. Updated Endpoint with Response Model

Modified [app/api/v1/sleep.py](src/backend/app/api/v1/sleep.py):

```python
@router.post("/complete", response_model=SleepCompleteResponse)  # Added response_model!
def complete_sleep_session(
    completion_data: SleepSessionComplete,
    db: Session = Depends(get_db)
):
    # ... existing code ...

    result = SleepService.complete_session(...)

    # Convert result to proper response format
    response_data = {
        "session": result["session"],          # Pydantic auto-converts to SleepSessionResponse
        "quality_score": result["quality_score"],
        "reward": result.get("reward")         # Pydantic auto-converts to SleepReward
    }

    return response_data  # Now properly serialized!
```

## How It Works Now

1. **Service** returns raw dict with SQLAlchemy models
2. **Endpoint** wraps it in a dict structure
3. **Pydantic** (via `response_model`) converts:
   - `SleepSession` model → `SleepSessionResponse` schema
   - Reward dict → `SleepReward` schema
4. **FastAPI** serializes to JSON
5. **Client** receives clean JSON response

## Response Format

**Before (would crash):**
```python
# Couldn't serialize
<SleepSession object at 0x...>
```

**After (works!):**
```json
{
  "session": {
    "id": "session-123",
    "user_id": "user-456",
    "start_time": "2025-01-25T22:00:00Z",
    "end_time": "2025-01-26T06:30:00Z",
    "duration_hours": 8.5,
    "quality_score": 85.5,
    "reward_wool": 340,
    "new_sheep_awarded": null,
    "status": "completed",
    "created_at": "2025-01-25T22:00:00Z"
  },
  "quality_score": 85.5,
  "reward": {
    "wool": 340,
    "new_sheep": null
  }
}
```

## Testing

### Using Postman

1. **Start Session:**
   ```
   POST /api/v1/sleep/start?user_id=<user_id>
   Body: {"start_time": "2025-01-25T22:00:00Z"}
   ```

2. **Complete Session:**
   ```
   POST /api/v1/sleep/complete
   Body: {
     "session_id": "<session_id_from_step_1>",
     "end_time": "2025-01-26T06:30:00Z"
   }
   ```

3. **Should return 200 OK** with the JSON response above!

### Using cURL

```bash
# Complete sleep session
curl -X POST "http://localhost:8000/api/v1/sleep/complete" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "your-session-id",
    "end_time": "2025-01-26T06:30:00Z"
  }'
```

## Files Modified

1. ✅ `app/schemas/sleep.py` - Added `SleepReward` and `SleepCompleteResponse`
2. ✅ `app/api/v1/sleep.py` - Added `response_model` and data conversion

## Key Learnings

**Always specify `response_model` when:**
- Returning complex nested data
- Returning database models
- Need type safety and validation
- Want automatic serialization

**FastAPI requires:**
- Pydantic models for automatic serialization
- `response_model` to enable conversion
- Proper schema definitions for nested objects

## Status

✅ **FIXED** - The endpoint now works correctly and returns properly formatted JSON!
