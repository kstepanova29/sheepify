from pydantic import BaseModel
from datetime import datetime

class WoolTransactionResponse(BaseModel):
    id: str
    user_id: str
    amount: int
    balance_after: int
    source: str
    reference_id: str | None
    created_at: datetime

    class Config:
        from_attributes = True

class WoolBalanceResponse(BaseModel):
    wool_balance: int
    generation_rate: float  # per hour
    total_sheep: int
