from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import uuid

class WoolTransaction(Base):
    __tablename__ = "wool_transactions"

    id = Column(String(255), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(255), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    amount = Column(Integer, nullable=False)
    balance_after = Column(Integer, nullable=False)
    source = Column(String(50), nullable=False)  # generation, purchase, sleep_reward, shop_purchase, etc.
    reference_id = Column(String(255))

    created_at = Column(DateTime, server_default=func.now(), index=True)

    # Relationships
    user = relationship("User", back_populates="wool_transactions")
