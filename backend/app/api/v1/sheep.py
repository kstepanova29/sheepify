from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.services.sheep_service import SheepService
from app.schemas.sheep import SheepCreate, SheepResponse, SheepUpdate

router = APIRouter()

@router.post("/create", response_model=SheepResponse, status_code=status.HTTP_201_CREATED)
def create_sheep(
    user_id: str,
    sheep_data: SheepCreate,
    db: Session = Depends(get_db)
):
    """Create a new sheep for user (admin/reward function)"""
    sheep = SheepService.create_sheep(
        db=db,
        user_id=user_id,
        sheep_type_id=sheep_data.sheep_type_id,
        custom_name=sheep_data.custom_name
    )
    return sheep

@router.get("/user/{user_id}", response_model=List[SheepResponse])
def get_user_sheep(user_id: str, db: Session = Depends(get_db)):
    """Get all sheep for a user"""
    sheep_list = SheepService.get_user_sheep(db, user_id)
    return sheep_list

@router.get("/{sheep_id}", response_model=SheepResponse)
def get_sheep(sheep_id: str, db: Session = Depends(get_db)):
    """Get a specific sheep by ID"""
    from app.models.sheep import Sheep
    sheep = db.query(Sheep).filter(Sheep.id == sheep_id).first()

    if not sheep:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sheep not found"
        )

    return sheep

@router.patch("/{sheep_id}", response_model=SheepResponse)
def update_sheep(
    sheep_id: str,
    user_id: str,
    sheep_data: SheepUpdate,
    db: Session = Depends(get_db)
):
    """Update sheep properties"""
    try:
        sheep = SheepService.update_sheep(
            db=db,
            sheep_id=sheep_id,
            user_id=user_id,
            custom_name=sheep_data.custom_name,
            is_favorite=sheep_data.is_favorite
        )
        return sheep
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
