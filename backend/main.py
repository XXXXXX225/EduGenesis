from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import router
import uvicorn

app = FastAPI(
    title="EduGenesis Core Server",
    description="Backend API for Personalized Resource Generation & Multi-Agent Learning",
    version="1.0.0"
)

# Strict CORS configuration - Allow only default local Vite dev port to call the backend APIs
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Include routes under prefix
app.include_router(router, prefix="/api")

if __name__ == "__main__":
    print("Starting EduGenesis Core Backend on http://127.0.0.1:8000 ...")
    # For security, we bind strictly to localhost (127.0.0.1) and NOT 0.0.0.0.
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
