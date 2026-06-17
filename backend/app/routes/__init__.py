from fastapi import APIRouter
from app.routes.auth import router as auth_router
from app.routes.profile import router as profile_router
from app.routes.path import router as path_router
from app.routes.chat import router as chat_router
from app.routes.resources import router as resources_router
from app.routes.sandbox import router as sandbox_router
from app.routes.errors import router as errors_router
from app.routes.console import router as console_router
from app.routes.settings import router as settings_router
from app.routes.kb import router as kb_router
from app.db import init_db

router = APIRouter()

router.include_router(auth_router)
router.include_router(profile_router)
router.include_router(path_router)
router.include_router(chat_router)
router.include_router(resources_router)
router.include_router(sandbox_router)
router.include_router(errors_router)
router.include_router(console_router)
router.include_router(settings_router, prefix="/settings")
router.include_router(kb_router, prefix="/kb")

# Ensure DB is initialized
init_db()

