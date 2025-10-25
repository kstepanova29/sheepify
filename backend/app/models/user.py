from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Time
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import uuid

class User(Base):
    __tablename__ = "users"

    id = Column(String(255), primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=True)
    password = Column(String(255), nullable=False)  # Plain text for simplicity
    farm_name = Column(String(100), nullable=False)

    wool_balance = Column(Integer, default=0, nullable=False)
    sleep_goal_hours = Column(Float, default=8.0)
    target_bedtime = Column(Time)
    target_wake_time = Column(Time)
    timezone = Column(String(50), default="UTC")

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    sheep = relationship("Sheep", back_populates="user", cascade="all, delete-orphan")
    sleep_sessions = relationship("SleepSession", back_populates="user", cascade="all, delete-orphan")
    wool_transactions = relationship("WoolTransaction", back_populates="user", cascade="all, delete-orphan")
