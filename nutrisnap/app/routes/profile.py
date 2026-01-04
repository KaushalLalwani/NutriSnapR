from fastapi import APIRouter
from app.db.mongo import posts_collection, likes_collection

router = APIRouter(prefix="/profile", tags=["Profile"])
@router.get("/{user_id}")
def get_profile(user_id: str):
    total_posts = posts_collection.count_documents(
        {"author_id": user_id}
    )

    total_likes = sum(
        post.get("likes_count", 0)
        for post in posts_collection.find(
            {"author_id": user_id},
            {"likes_count": 1}
        )
    )

    return {
        "user_id": user_id,
        "total_posts": total_posts,
        "total_likes": total_likes,
    }
@router.get("/{user_id}/posts")
def get_user_posts(
    user_id: str,
    page: int = 1,
    limit: int = 10,
):
    skip = (page - 1) * limit

    posts = list(
        posts_collection.find(
            {"author_id": user_id},
            {"_id": 0}
        )
        .sort("created_at", -1)
        .skip(skip)
        .limit(limit)
    )

    total = posts_collection.count_documents(
        {"author_id": user_id}
    )

    return {
        "page": page,
        "limit": limit,
        "total": total,
        "posts": posts,
    }
