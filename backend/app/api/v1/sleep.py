from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.services.sleep_service import SleepService
from app.schemas.sleep import (
    SleepSessionCreate,
    SleepSessionComplete,
    SleepSessionResponse,
    SleepCompleteResponse,
    SleepStatsResponse
)
from app.core.exceptions import ValidationError

router = APIRouter()

@router.post("/start", response_model=SleepSessionResponse, status_code=status.HTTP_201_CREATED)
def start_sleep_session(
    user_id: str,
    session_data: SleepSessionCreate,
    db: Session = Depends(get_db)
):
    """Start a new sleep tracking session"""
    try:
        session = SleepService.start_session(
            db=db,
            user_id=user_id,
            start_time=session_data.start_time,
            planned_wake_time=session_data.planned_wake_time
        )
        return session
    except ValidationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.post("/complete", response_model=SleepCompleteResponse)
def complete_sleep_session(
    completion_data: SleepSessionComplete,
    db: Session = Depends(get_db)
):
    """Complete a sleep session and calculate rewards"""
    try:
        # Extract user_id from session
        from app.models.sleep import SleepSession
        session = db.query(SleepSession).filter(
            SleepSession.id == completion_data.session_id
        ).first()

        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found"
            )

        result = SleepService.complete_session(
            db=db,
            session_id=completion_data.session_id,
            user_id=session.user_id,
            end_time=completion_data.end_time
        )

        # Convert result to proper response format
        response_data = {
            "session": result["session"],
            "quality_score": result["quality_score"],
            "reward": result.get("reward")
        }

        return response_data
    except ValidationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/sessions/{user_id}", response_model=List[SleepSessionResponse])
def get_sleep_sessions(
    user_id: str,
    limit: int = 10,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """Get user's sleep session history"""
    sessions = SleepService.get_user_sessions(
        db=db,
        user_id=user_id,
        limit=limit,
        offset=offset
    )
    return sessions

@router.get("/active/{user_id}", response_model=SleepSessionResponse)
def get_active_session(user_id: str, db: Session = Depends(get_db)):
    """Get user's active sleep session"""
    from app.models.sleep import SleepSession

    session = db.query(SleepSession).filter(
        SleepSession.user_id == user_id,
        SleepSession.status == 'active'
    ).first()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active sleep session found"
        )

    return session

@router.get("/stats/weekly/{user_id}", response_model=SleepStatsResponse)
def get_weekly_stats(user_id: str, db: Session = Depends(get_db)):
    """Get weekly sleep statistics"""
    stats = SleepService.get_weekly_stats(db, user_id)
    return stats
