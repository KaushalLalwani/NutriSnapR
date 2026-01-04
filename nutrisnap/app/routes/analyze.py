import io
from fastapi import APIRouter, File, UploadFile, Form, Depends, HTTPException
from PIL import Image

from app.core.security import get_current_user
from app.services.gemini import analyze_with_gemini
from app.services.cloudinary import upload_image
from app.db.mongo import meals_collection
from app.models.schemas import AnalyzeResponse

router = APIRouter(tags=["Analyze"])


# 🔹 Helper to normalize nutrition keys
def normalize_nutrition(n: dict) -> dict:
    return {
        "calories": n.get("calories", 0),
        "protein": n.get("protein_g", 0),
        "carbs": n.get("carbs_g", 0),
        "fat": n.get("fat_g", 0),
        "fiber": n.get("fiber_g", 0),
        "sugar": n.get("sugar_g", 0),
        "sodium": n.get("sodium_mg", 0),
    }


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_food(
    image: UploadFile = File(...),
    cuisine_hint: str = Form(None),
    current_user: dict = Depends(get_current_user),
):
    # Validate image
    if not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are allowed")

    # Read image
    pil = Image.open(io.BytesIO(await image.read())).convert("RGB")

    # 🔹 AI analysis (raw)
    raw_analysis = analyze_with_gemini(pil, cuisine_hint)

    # 🔹 Normalize items
    items = []
    for item in raw_analysis.get("items", []):
        items.append({
            "name": item.get("name"),
            "confidence": item.get("confidence", 0.9),
            "estimated_weight_g": item.get("estimated_weight_g", 0),
            "nutrition_per_portion": normalize_nutrition(
                item.get("nutrition_per_portion", {})
            ),
        })

    # 🔹 Normalize totals
    total_nutrition = normalize_nutrition(
        raw_analysis.get("total_nutrition", {})
    )

    normalized_analysis = {
        "items": items,
        "total_nutrition": total_nutrition,
    }

    # Upload image
    image_url = upload_image(pil)

    # Save to MongoDB
    meal_doc = {
        "user_id": str(current_user["_id"]),
        "email": current_user["email"],
        "image_url": image_url,
        "analysis": normalized_analysis,
    }
    meals_collection.insert_one(meal_doc)

    # ✅ Response matches AnalyzeResponse exactly
    return {
        "analysis": normalized_analysis,
        "image_url": image_url,
    }
