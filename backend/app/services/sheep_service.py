from sqlalchemy.orm import Session
from app.models.sheep import Sheep
from app.models.user import User
from typing import Optional

class SheepService:
    @staticmethod
    def award_starter_sheep(db: Session, user_id: str) -> Sheep:
        """Award a starter sheep to new user"""
        starter_sheep = Sheep(
            user_id=user_id,
            sheep_type_id='starter',
            custom_name='Fluffy'
        )
        db.add(starter_sheep)
        db.commit()
        db.refresh(starter_sheep)
        return starter_sheep

    @staticmethod
    def create_sheep(
        db: Session,
        user_id: str,
        sheep_type_id: str,
        custom_name: Optional[str] = None
    ) -> Sheep:
        """Create a new sheep for user"""
        new_sheep = Sheep(
            user_id=user_id,
            sheep_type_id=sheep_type_id,
            custom_name=custom_name
        )
        db.add(new_sheep)
        db.commit()
        db.refresh(new_sheep)
        return new_sheep

    @staticmethod
    def get_user_sheep(db: Session, user_id: str):
        """Get all sheep for a user"""
        return db.query(Sheep).filter(Sheep.user_id == user_id).all()

    @staticmethod
    def update_sheep(
        db: Session,
        sheep_id: str,
        user_id: str,
        custom_name: Optional[str] = None,
        is_favorite: Optional[bool] = None
    ) -> Sheep:
        """Update sheep properties"""
        sheep = db.query(Sheep).filter(
            Sheep.id == sheep_id,
            Sheep.user_id == user_id
        ).first()

        if not sheep:
            raise ValueError("Sheep not found")

        if custom_name is not None:
            sheep.custom_name = custom_name
        if is_favorite is not None:
            # Unfavorite all other sheep if setting this as favorite
            if is_favorite:
                db.query(Sheep).filter(
                    Sheep.user_id == user_id,
                    Sheep.id != sheep_id
                ).update({"is_favorite": False})
            sheep.is_favorite = is_favorite

        db.commit()
        db.refresh(sheep)
        return sheep

    @staticmethod
    def determine_sheep_reward(
        db: Session,
        user_id: str,
        sleep_quality: float
    ) -> Optional[Sheep]:
        """Determine if user should receive a new sheep based on sleep quality"""
        # Simple logic: 10% chance for high quality sleep (>= 85)
        import random
        if sleep_quality >= 85 and random.random() < 0.1:
            # Award a better sheep type based on quality
            if sleep_quality >= 95:
                sheep_type = 'golden'
            elif sleep_quality >= 90:
                sheep_type = 'cotswold'
            elif sleep_quality >= 85:
                sheep_type = 'suffolk'
            else:
                sheep_type = 'merino'

            return SheepService.create_sheep(db, user_id, sheep_type)
        return None
