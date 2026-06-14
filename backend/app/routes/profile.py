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
    # Save snapshot before updating for delta comparison
    current = db_get_profile(current_username)
    db_save_profile_snapshot(current_username, current.model_dump())
    
    db_save_profile(current_username, profile)
    db_sync_path_nodes_by_goals(current_username, profile.learning_goals)
    return db_get_profile(current_username)


@router.get("/profile/delta")
def get_profile_delta(current_username: str = Depends(get_current_username)):
    """
    Return the delta between the current profile and the previous snapshot.
    Also saves a new snapshot of the current profile.
    """
    from app.db import db_get_profile_delta, db_save_profile_snapshot, db_get_profile
    
    current = db_get_profile(current_username)
    delta = db_get_profile_delta(current_username)
    
    # Save current state as new snapshot for future comparisons
    db_save_profile_snapshot(current_username, current.model_dump())
    
    return delta
