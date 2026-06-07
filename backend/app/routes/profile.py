from typing import Optional
from fastapi import APIRouter
from app.models import UserProfile
from app.db import db_get_profile, db_save_profile, db_sync_path_nodes_by_goals

router = APIRouter()
logged_in_username = "default_user"

@router.get("/profile", response_model=UserProfile)
def get_profile(username: Optional[str] = None):
    target_user = username if username else logged_in_username
    return db_get_profile(target_user)

@router.post("/profile", response_model=UserProfile)
def update_profile(profile: UserProfile, username: Optional[str] = None):
    target_user = username if username else logged_in_username
    db_save_profile(target_user, profile)
    db_sync_path_nodes_by_goals(target_user, profile.learning_goals)
    return db_get_profile(target_user)
