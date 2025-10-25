from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import uuid

class SleepSession(Base):
    __tablename__ = "sleep_sessions"

    id = Column(String(255), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(255), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime)
    duration_hours = Column(Float)
    quality_score = Column(Float)

    reward_wool = Column(Integer, default=0)
    new_sheep_awarded = Column(String(255), ForeignKey("sheep.id"))

    notes = Column(String(500))
    status = Column(String(20), default="active")  # active, completed, cancelled

    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="sleep_sessions")
