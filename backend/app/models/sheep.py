from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import uuid

class Sheep(Base):
    __tablename__ = "sheep"

    id = Column(String(255), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(255), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    sheep_type_id = Column(String(50), nullable=False)
    custom_name = Column(String(50))

    level = Column(Integer, default=1)
    experience = Column(Integer, default=0)
    wool_rate_modifier = Column(Float, default=1.0)

    date_acquired = Column(DateTime, server_default=func.now())
    is_favorite = Column(Boolean, default=False)
    total_wool_generated = Column(Integer, default=0)

    # Relationships
    user = relationship("User", back_populates="sheep")

    @property
    def current_wool_rate(self) -> float:
        """Calculate current wool generation rate per hour"""
        # Sheep type base rates (wool per hour)
        SHEEP_TYPES = {
            'starter': 5,
            'merino': 10,
            'suffolk': 15,
            'cotswold': 20,
            'golden': 50
        }
        base_rate = SHEEP_TYPES.get(self.sheep_type_id, 5)
        level_bonus = (self.level - 1) * 2
        return (base_rate + level_bonus) * self.wool_rate_modifier
