from pydantic import BaseModel
from datetime import datetime, time
from typing import Optional

class UserCreate(BaseModel):
    username: str
    email: Optional[str] = None
    password: str
    farm_name: str
    timezone: str = "UTC"

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: str
    username: str
    email: Optional[str]
    farm_name: str
    wool_balance: int
    sleep_goal_hours: float
    target_bedtime: Optional[time]
    target_wake_time: Optional[time]
    timezone: str
    created_at: datetime

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    farm_name: Optional[str] = None
    sleep_goal_hours: Optional[float] = None
    target_bedtime: Optional[time] = None
    target_wake_time: Optional[time] = None
