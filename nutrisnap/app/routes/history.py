from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from bson import json_util
import json

from app.core.security import get_current_user
from app.db.mongo import meals_collection, mongo_client
from app.services.gemini import MODEL
from app.utils.helpers import safe_json


router = APIRouter(tags=["History"])




@router.get("/history")
def get_user_history(
    limit: int = 5,
    current_user: dict = Depends(get_current_user),
):
    meals = list(
        meals_collection.find({"user_id": str(current_user["_id"])})
        .sort("timestamp", -1)
        .limit(limit)
    )

    return JSONResponse(
        content=safe_json(
            {
                "count": len(meals),
                "meals": meals,
            }
        )
    )


@router.get("/health")
def health():
    try:
        mongo_client.admin.command("ping")
        db_status = True
    except Exception:
        db_status = False

    return {
        "ok": True,
        "model": MODEL,
        "db_connected": db_status,
    }
