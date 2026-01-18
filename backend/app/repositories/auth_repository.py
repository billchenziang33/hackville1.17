from sqlalchemy.orm import Session
from fastapi import Depends
from ..database import get_db
from ..models import User


class AuthRepository:
    def __init__(self, db: Session = Depends(get_db)):
        self.db = db

    def get_user_by_email(self, email: str) -> User | None:
        return self.db.query(User).filter(User.email == email).first()

    def get_user_by_firebase_uid(self, firebase_uid: str) -> User | None:
        return self.db.query(User).filter(User.firebase_uid == firebase_uid).first()

    def create_user(self, user: User) -> User:
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user
