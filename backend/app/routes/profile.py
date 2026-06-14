from fastapi import APIRouter, Depends
from app.auth_utils import get_current_username
from app.models import UserProfile
from app.db import db_get_profile, db_save_profile, db_sync_path_nodes_by_goals

router = APIRouter()

@router.get("/profile", response_model=UserProfile)
def get_profile(current_username: str = Depends(get_current_username)):
    return db_get_profile(current_username)

@router.post("/profile", response_model=UserProfile)
def update_profile(profile: UserProfile, current_username: str = Depends(get_current_username)):
    db_save_profile(current_username, profile)
    db_sync_path_nodes_by_goals(current_username, profile.learning_goals)
    return db_get_profile(current_username)
