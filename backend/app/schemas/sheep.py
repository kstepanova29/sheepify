from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class SheepCreate(BaseModel):
    sheep_type_id: str
    custom_name: Optional[str] = None

class SheepResponse(BaseModel):
    id: str
    user_id: str
    sheep_type_id: str
    custom_name: Optional[str]
    level: int
    experience: int
    wool_rate_modifier: float
    date_acquired: datetime
    is_favorite: bool
    total_wool_generated: int

    class Config:
        from_attributes = True

class SheepUpdate(BaseModel):
    custom_name: Optional[str] = None
    is_favorite: Optional[bool] = None
