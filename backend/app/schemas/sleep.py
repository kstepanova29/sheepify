from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class SleepSessionCreate(BaseModel):
    start_time: datetime
    planned_wake_time: Optional[datetime] = None

class SleepSessionComplete(BaseModel):
    session_id: str
    end_time: datetime
    notes: Optional[str] = None

class SleepSessionResponse(BaseModel):
    id: str
    user_id: str
    start_time: datetime
    end_time: Optional[datetime]
    duration_hours: Optional[float]
    quality_score: Optional[float]
    reward_wool: int
    new_sheep_awarded: Optional[str]
    notes: Optional[str]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class SleepStatsResponse(BaseModel):
    total_sessions: int
    total_hours: float
    average_quality: float
    total_wool_earned: int
    best_session_date: Optional[datetime]
