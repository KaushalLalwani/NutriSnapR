from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from datetime import datetime
from PIL import Image
import io

from app.core.security import get_current_user
from app.services.cloudinary import upload_image
from app.services.gemini import analyze_with_gemini
from app.db.mongo import posts_collection, likes_collection, comments_collection
from app.models.schemas import CommunityPostCreate, CommentCreate


router = APIRouter(prefix="/community", tags=["Community"])
@router.post("/post")
async def create_post(
    image: UploadFile = File(...),
    caption: str = Form(...),
    current_user: dict = Depends(get_current_user)
):
    # Validate image
    if not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only images allowed")

    pil = Image.open(io.BytesIO(await image.read())).convert("RGB")

    # AI nutrition analysis
    analysis = analyze_with_gemini(pil)
    nutrition = analysis.get("total_nutrition", {})

    # Upload image
    image_url = upload_image(pil)

    post = {
        "author_id": str(current_user["_id"]),
        "author_email": current_user["email"],
        "image_url": image_url,
        "caption": caption,
        "nutrition": nutrition,
        "likes_count": 0,
        "created_at": datetime.utcnow().isoformat(),
    }

    posts_collection.insert_one(post)

    return {"message": "Post created successfully"}
from fastapi import Query

@router.get("/feed")
def get_feed(
    page: int = Query(1, ge=1),
    limit: int = Query(10, le=50),
    search: str | None = None,
):
    skip = (page - 1) * limit

    query = {}
    if search:
        query = {"$text": {"$search": search}}

    posts = list(
        posts_collection.find(query, {"_id": 0})
        .sort("created_at", -1)
        .skip(skip)
        .limit(limit)
    )

    total = posts_collection.count_documents(query)

    return {
        "page": page,
        "limit": limit,
        "total": total,
        "has_more": skip + limit < total,
        "posts": posts,
    }

@router.post("/like/{post_id}")
def like_post(
    post_id: str,
    current_user: dict = Depends(get_current_user)
):
    exists = likes_collection.find_one(
        {"post_id": post_id, "user_id": str(current_user["_id"])}
    )

    if exists:
        likes_collection.delete_one({"_id": exists["_id"]})
        posts_collection.update_one(
            {"_id": post_id}, {"$inc": {"likes_count": -1}}
        )
        return {"liked": False}

    likes_collection.insert_one(
        {"post_id": post_id, "user_id": str(current_user["_id"])}
    )
    posts_collection.update_one(
        {"_id": post_id}, {"$inc": {"likes_count": 1}}
    )
    return {"liked": True}
@router.post("/comment/{post_id}")
def comment_post(
    post_id: str,
    data: CommentCreate,
    current_user: dict = Depends(get_current_user)
):
    comment = {
        "post_id": post_id,
        "user_id": str(current_user["_id"]),
        "comment": data.comment,
        "created_at": datetime.utcnow().isoformat(),
    }
    comments_collection.insert_one(comment)
    return {"message": "Comment added"}
@router.get("/comments/{post_id}")
def get_comments(post_id: str):
    comments = list(
        comments_collection.find({"post_id": post_id}, {"_id": 0})
        .sort("created_at", 1)
    )
    return {"count": len(comments), "comments": comments}
