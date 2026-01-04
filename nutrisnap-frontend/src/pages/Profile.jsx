import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user, logout } = useAuth();

  const [goals, setGoals] = useState(null);
  const [stats, setStats] = useState({ meals: 0, posts: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const [goalsRes, statsRes] = await Promise.all([
          api.get("/goals"),
          api.get("/profile/stats"),
        ]);

        setGoals(goalsRes.data);
        setStats(statsRes.data);
      } catch (err) {
        console.error("Profile load failed", err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const updateGoals = async () => {
    try {
      setSaving(true);
      await api.post("/goals", goals);
      alert("Goals updated successfully");
    } catch (err) {
      alert("Failed to update goals");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-10">Loading profile...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold">Profile</h1>

      {/* User Info */}
      <section className="bg-white p-6 rounded-xl shadow space-y-2">
        <h2 className="text-xl font-semibold">Account</h2>
        <p><b>Email:</b> {user?.email}</p>
      </section>

      {/* Stats */}
      <section className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4">Your Activity</h2>
        <div className="grid grid-cols-2 gap-4">
          <Stat label="Meals Analyzed" value={stats.meals} />
          <Stat label="Community Posts" value={stats.posts} />
        </div>
      </section>

      {/* Nutrition Goals */}
      <section className="bg-white p-6 rounded-xl shadow space-y-4">
        <h2 className="text-xl font-semibold">Nutrition Goals</h2>

        <GoalInput
          label="Daily Calories"
          value={goals.daily_calories}
          onChange={(v) =>
            setGoals({ ...goals, daily_calories: Number(v) })
          }
        />

        <GoalInput
          label="Protein (g)"
          value={goals.protein_g}
          onChange={(v) =>
            setGoals({ ...goals, protein_g: Number(v) })
          }
        />

        <GoalInput
          label="Carbs (g)"
          value={goals.carbs_g}
          onChange={(v) =>
            setGoals({ ...goals, carbs_g: Number(v) })
          }
        />

        <GoalInput
          label="Fat (g)"
          value={goals.fat_g}
          onChange={(v) =>
            setGoals({ ...goals, fat_g: Number(v) })
          }
        />

        <button
          onClick={updateGoals}
          disabled={saving}
          className="bg-teal-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Goals"}
        </button>
      </section>

      {/* Logout */}
      <button
        onClick={logout}
        className="text-red-500 underline"
      >
        Logout
      </button>
    </div>
  );
}

/* ---------------- COMPONENTS ---------------- */

function Stat({ label, value }) {
  return (
    <div className="bg-slate-50 p-4 rounded-lg">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}

function GoalInput({ label, value, onChange }) {
  return (
    <div>
      <label className="text-sm text-slate-600">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border p-2 rounded"
      />
    </div>
  );
}
