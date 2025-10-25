from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.services.wool_service import WoolService
from app.schemas.wool import WoolBalanceResponse, WoolTransactionResponse
from app.core.exceptions import InsufficientWoolError

router = APIRouter()

@router.get("/balance/{user_id}", response_model=WoolBalanceResponse)
def get_wool_balance(user_id: str, db: Session = Depends(get_db)):
    """Get user's wool balance and generation rate"""
    try:
        balance_data = WoolService.get_balance(db, user_id)
        return balance_data
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )

@router.post("/collect/{user_id}", response_model=WoolBalanceResponse)
def collect_wool(user_id: str, db: Session = Depends(get_db)):
    """Manually trigger wool collection from sheep"""
    try:
        # Get generation rate
        hourly_rate = WoolService.get_generation_rate(db, user_id)

        if hourly_rate <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No sheep to generate wool"
            )

        # Add one hour's worth of wool
        wool_amount = int(hourly_rate)
        WoolService.add_wool(
            db=db,
            user_id=user_id,
            amount=wool_amount,
            source='manual_collection'
        )

        balance_data = WoolService.get_balance(db, user_id)
        return balance_data
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )

@router.get("/transactions/{user_id}", response_model=List[WoolTransactionResponse])
def get_transactions(
    user_id: str,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """Get user's wool transaction history"""
    from app.models.wool import WoolTransaction

    transactions = db.query(WoolTransaction).filter(
        WoolTransaction.user_id == user_id
    ).order_by(
        WoolTransaction.created_at.desc()
    ).limit(limit).all()

    return transactions

@router.post("/purchase")
def purchase_with_wool(
    user_id: str,
    item_id: str,
    amount: int,
    db: Session = Depends(get_db)
):
    """Purchase something with wool (generic endpoint)"""
    try:
        WoolService.spend_wool(
            db=db,
            user_id=user_id,
            amount=amount,
            purpose='shop_purchase',
            item_id=item_id
        )
        return {"success": True, "message": "Purchase successful"}
    except InsufficientWoolError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
