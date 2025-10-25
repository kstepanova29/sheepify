from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.sleep import SleepSession
from app.models.user import User
from app.services.wool_service import WoolService
from app.services.sheep_service import SheepService
from app.core.exceptions import ValidationError
from datetime import datetime, timedelta
from typing import Optional
import statistics

class SleepService:
    @staticmethod
    def start_session(
        db: Session,
        user_id: str,
        start_time: datetime,
        planned_wake_time: Optional[datetime] = None
    ) -> SleepSession:
        """Start a new sleep tracking session"""
        # Check for active session
        active_session = db.query(SleepSession).filter(
            SleepSession.user_id == user_id,
            SleepSession.status == 'active'
        ).first()

        if active_session:
            raise ValidationError("User already has an active sleep session")

        # Create new session
        session = SleepSession(
            user_id=user_id,
            start_time=start_time,
            status='active'
        )

        db.add(session)
        db.commit()
        db.refresh(session)

        return session

    @staticmethod
    def complete_session(
        db: Session,
        session_id: str,
        user_id: str,
        end_time: datetime
    ) -> dict:
        """Complete sleep session and calculate rewards"""
        # Get session
        session = db.query(SleepSession).filter(
            SleepSession.id == session_id,
            SleepSession.user_id == user_id
        ).first()

        if not session:
            raise ValidationError("Session not found")

        if session.status != 'active':
            raise ValidationError("Session is not active")

        # Calculate duration
        duration_seconds = (end_time - session.start_time).total_seconds()
        duration_hours = duration_seconds / 3600

        # Anti-cheat validation
        if duration_hours > 16:
            duration_hours = 16  # Cap at 16 hours
        elif duration_hours < 1:
            session.status = 'completed'
            session.end_time = end_time
            session.duration_hours = duration_hours
            db.commit()
            return {
                "message": "Sleep session too short",
                "session": session,
                "quality_score": 0,
                "reward": None
            }

        # Calculate quality score
        quality_score = SleepService.calculate_quality_score(
            db=db,
            duration_hours=duration_hours,
            start_time=session.start_time,
            user_id=user_id
        )

        # Calculate rewards
        reward = None
        if quality_score >= 50:
            reward = SleepService.calculate_reward(
                db=db,
                user_id=user_id,
                duration_hours=duration_hours,
                quality_score=quality_score
            )

        # Update session
        session.end_time = end_time
        session.duration_hours = duration_hours
        session.quality_score = quality_score
        session.reward_wool = reward['wool'] if reward else 0
        session.status = 'completed'

        if reward and reward.get('new_sheep'):
            session.new_sheep_awarded = reward['new_sheep'].id

        db.commit()
        db.refresh(session)

        return {
            "session": session,
            "quality_score": quality_score,
            "reward": reward
        }

    @staticmethod
    def calculate_quality_score(
        db: Session,
        duration_hours: float,
        start_time: datetime,
        user_id: str
    ) -> float:
        """Calculate sleep quality score (0-100)"""
        base_score = 0.0

        # Duration component (40 points max)
        if 8 <= duration_hours <= 10:
            duration_score = 40
        elif 7 <= duration_hours < 8:
            duration_score = 30
        elif 6 <= duration_hours < 7:
            duration_score = 20
        elif duration_hours > 10:
            duration_score = 25
        else:
            duration_score = 10

        base_score += duration_score

        # Timing component (30 points max) - ideal bedtime 21:00-23:00
        hour_of_day = start_time.hour
        if 21 <= hour_of_day <= 23:
            timing_score = 30
        elif 20 <= hour_of_day < 21 or hour_of_day == 0:
            timing_score = 25
        elif 1 <= hour_of_day <= 3:
            timing_score = 15
        else:
            timing_score = 10

        base_score += timing_score

        # Consistency component (30 points max)
        consistency_score = SleepService.calculate_consistency_score(
            db, user_id, start_time
        )
        base_score += consistency_score * 30

        return min(base_score, 100.0)

    @staticmethod
    def calculate_consistency_score(
        db: Session,
        user_id: str,
        current_start_time: datetime
    ) -> float:
        """Calculate consistency score based on recent sleep patterns"""
        # Get last 7 days of sleep sessions
        seven_days_ago = datetime.utcnow() - timedelta(days=7)
        recent_sessions = db.query(SleepSession).filter(
            SleepSession.user_id == user_id,
            SleepSession.start_time >= seven_days_ago,
            SleepSession.status == 'completed'
        ).order_by(SleepSession.start_time).all()

        if len(recent_sessions) < 3:
            return 0.5  # Not enough data

        # Calculate standard deviation of start times (in hours)
        start_hours = [
            s.start_time.hour + s.start_time.minute / 60
            for s in recent_sessions
        ]

        try:
            std_dev = statistics.stdev(start_hours)
        except:
            return 0.5

        # Convert std_dev to consistency score
        if std_dev < 0.5:  # Less than 30 min variance
            return 1.0
        elif std_dev < 1.0:  # Less than 1 hour variance
            return 0.75
        elif std_dev < 2.0:  # Less than 2 hours variance
            return 0.5
        else:
            return 0.25

    @staticmethod
    def calculate_reward(
        db: Session,
        user_id: str,
        duration_hours: float,
        quality_score: float
    ) -> Optional[dict]:
        """Calculate wool and potential sheep rewards"""
        # Base wool calculation
        base_wool = int(duration_hours * 50)  # 50 wool per hour
        quality_multiplier = quality_score / 100
        wool_reward = int(base_wool * quality_multiplier)

        # Add wool to user balance
        WoolService.add_wool(
            db=db,
            user_id=user_id,
            amount=wool_reward,
            source='sleep_reward'
        )

        # Check for new sheep
        new_sheep = None
        if quality_score >= 70:
            new_sheep = SheepService.determine_sheep_reward(
                db=db,
                user_id=user_id,
                sleep_quality=quality_score
            )

        return {
            'wool': wool_reward,
            'new_sheep': new_sheep
        }

    @staticmethod
    def get_user_sessions(
        db: Session,
        user_id: str,
        limit: int = 10,
        offset: int = 0
    ):
        """Get user's sleep session history"""
        sessions = db.query(SleepSession).filter(
            SleepSession.user_id == user_id
        ).order_by(
            SleepSession.start_time.desc()
        ).offset(offset).limit(limit).all()

        return sessions

    @staticmethod
    def get_weekly_stats(db: Session, user_id: str) -> dict:
        """Get weekly sleep statistics"""
        seven_days_ago = datetime.utcnow() - timedelta(days=7)
        sessions = db.query(SleepSession).filter(
            SleepSession.user_id == user_id,
            SleepSession.start_time >= seven_days_ago,
            SleepSession.status == 'completed'
        ).all()

        if not sessions:
            return {
                "total_sessions": 0,
                "total_hours": 0,
                "average_quality": 0,
                "total_wool_earned": 0,
                "best_session_date": None
            }

        total_hours = sum(s.duration_hours for s in sessions if s.duration_hours)
        avg_quality = statistics.mean([s.quality_score for s in sessions if s.quality_score])
        total_wool = sum(s.reward_wool for s in sessions)
        best_session = max(sessions, key=lambda s: s.quality_score or 0)

        return {
            "total_sessions": len(sessions),
            "total_hours": round(total_hours, 2),
            "average_quality": round(avg_quality, 2),
            "total_wool_earned": total_wool,
            "best_session_date": best_session.start_time
        }
