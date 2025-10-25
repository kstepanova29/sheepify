from sqlalchemy.orm import Session
from app.models.user import User
from app.models.wool import WoolTransaction
from app.models.sheep import Sheep
from app.core.exceptions import InsufficientWoolError
from datetime import datetime

class WoolService:
    @staticmethod
    def add_wool(
        db: Session,
        user_id: str,
        amount: int,
        source: str,
        reference_id: str = None
    ) -> int:
        """Add wool to user's balance with transaction logging"""
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError("User not found")

        new_balance = user.wool_balance + amount
        user.wool_balance = new_balance

        # Create transaction record
        transaction = WoolTransaction(
            user_id=user_id,
            amount=amount,
            balance_after=new_balance,
            source=source,
            reference_id=reference_id
        )
        db.add(transaction)
        db.commit()

        return new_balance

    @staticmethod
    def spend_wool(
        db: Session,
        user_id: str,
        amount: int,
        purpose: str,
        item_id: str
    ) -> bool:
        """Deduct wool from user's balance"""
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError("User not found")

        if user.wool_balance < amount:
            raise InsufficientWoolError(
                f"Insufficient wool. Has {user.wool_balance}, needs {amount}"
            )

        new_balance = user.wool_balance - amount
        user.wool_balance = new_balance

        transaction = WoolTransaction(
            user_id=user_id,
            amount=-amount,
            balance_after=new_balance,
            source=purpose,
            reference_id=item_id
        )
        db.add(transaction)
        db.commit()

        return True

    @staticmethod
    def get_generation_rate(db: Session, user_id: str) -> float:
        """Calculate user's total wool generation rate per hour"""
        sheep_list = db.query(Sheep).filter(Sheep.user_id == user_id).all()
        hourly_rate = sum(sheep.current_wool_rate for sheep in sheep_list)
        return hourly_rate

    @staticmethod
    def get_balance(db: Session, user_id: str) -> dict:
        """Get user's wool balance and generation rate"""
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError("User not found")

        generation_rate = WoolService.get_generation_rate(db, user_id)
        total_sheep = db.query(Sheep).filter(Sheep.user_id == user_id).count()

        return {
            "wool_balance": user.wool_balance,
            "generation_rate": generation_rate,
            "total_sheep": total_sheep
        }
