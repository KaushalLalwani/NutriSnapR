import { useEffect, useState } from "react";
import api from "../services/api";

export default function Community() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchFeed = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get(`/community/feed?page=${page}&limit=6`);
      setPosts(res.data.posts || []);
    } catch (err) {
      console.error("Failed to load feed", err);
      setError("Failed to load community feed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, [page]);

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-6">
      <h1 className="text-3xl font-bold">Community</h1>

      <CreatePost onPostCreated={fetchFeed} />

      {loading && <p>Loading feed...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <div className="grid md:grid-cols-2 gap-6">
          {posts.length === 0 ? (
            <p className="text-slate-500">No posts yet.</p>
          ) : (
            posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))
          )}
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-center gap-4 pt-6">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          Prev
        </button>

        <button
          disabled={posts.length < 6}
          onClick={() => setPage((p) => p + 1)}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

/* ---------------- CREATE POST ---------------- */

function CreatePost({ onPostCreated }) {
  const [image, setImage] = useState(null);
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);

  const submitPost = async () => {
    if (!image || !caption.trim()) return;

    const formData = new FormData();
    formData.append("image", image);
    formData.append("caption", caption);

    try {
      setLoading(true);
      await api.post("/community/post", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setImage(null);
      setCaption("");
      onPostCreated();
    } catch (err) {
      console.error("Post failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow space-y-3">
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImage(e.target.files[0])}
      />

      <input
        type="text"
        placeholder="Write a caption..."
        className="w-full border p-2 rounded"
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
      />

      <button
        onClick={submitPost}
        disabled={loading}
        className="bg-teal-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? "Posting..." : "Post"}
      </button>
    </div>
  );
}

/* ---------------- POST CARD ---------------- */

function PostCard({ post }) {
  const [likes, setLikes] = useState(post.likes || 0);
  const [liking, setLiking] = useState(false);
  const [comment, setComment] = useState("");

  const likePost = async () => {
    if (liking) return;
    try {
      setLiking(true);
      await api.post(`/community/${post._id}/like`);
      setLikes((l) => l + 1);
    } catch (err) {
      console.error("Like failed", err);
    } finally {
      setLiking(false);
    }
  };

  const addComment = async () => {
    if (!comment.trim()) return;
    try {
      await api.post(`/community/${post._id}/comment`, { comment });
      setComment("");
    } catch (err) {
      console.error("Comment failed", err);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <img
        src={post.image_url}
        alt="post"
        className="h-56 w-full object-cover"
      />

      <div className="p-4 space-y-2">
        <p className="font-medium">{post.caption}</p>

        <p className="text-sm text-slate-500">{likes} likes</p>

        <button
          onClick={likePost}
          disabled={liking}
          className="text-teal-600 text-sm disabled:opacity-50"
        >
          ❤️ Like
        </button>

        {/* Comments */}
        <div className="space-y-1">
          {post.comments?.slice(0, 2).map((c, idx) => (
            <p key={idx} className="text-sm">
              <span className="font-semibold">{c.user_email}:</span>{" "}
              {c.comment}
            </p>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add comment"
            className="flex-1 border p-1 rounded text-sm"
          />
          <button
            onClick={addComment}
            className="text-teal-600 text-sm"
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
}
