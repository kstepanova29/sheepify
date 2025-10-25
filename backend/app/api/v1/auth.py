from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserResponse
from app.services.sheep_service import SheepService

router = APIRouter()

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user with simple local authentication

    No password hashing - kept simple for development
    """
    # Check if username exists
    existing_user = db.query(User).filter(
        (User.username == user_data.username) |
        (User.email == user_data.email)
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already exists"
        )

    # Create new user
    new_user = User(
        username=user_data.username,
        email=user_data.email,
        password=user_data.password,  # Plain text for simplicity
        farm_name=user_data.farm_name,
        timezone=user_data.timezone,
        wool_balance=0
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Award starter sheep
    SheepService.award_starter_sheep(db, new_user.id)

    return new_user

@router.post("/login", response_model=UserResponse)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """
    Login with username and password

    Returns user profile if credentials are valid
    """
    user = db.query(User).filter(User.username == credentials.username).first()

    if not user or user.password != credentials.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    return user

@router.get("/user/{user_id}", response_model=UserResponse)
def get_user(user_id: str, db: Session = Depends(get_db)):
    """Get user by ID"""
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return user
