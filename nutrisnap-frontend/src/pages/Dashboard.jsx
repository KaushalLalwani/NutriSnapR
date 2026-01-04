import { useEffect, useState } from "react";
import api from "../services/api";

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [meals, setMeals] = useState([]);
  const [goals, setGoals] = useState(null);
  const [weekly, setWeekly] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const [summaryRes, historyRes, goalsRes] = await Promise.all([
          api.get("/summary"),
          api.get("/history"),
          api.get("/goals"),
        ]);

        setSummary(summaryRes.data);
        setMeals(historyRes.data.meals || []);
        setGoals(goalsRes.data || null);
        setWeekly(computeWeekly(historyRes.data.meals || []));
      } catch (err) {
        console.error("Dashboard load failed", err);
        setError("Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return <div className="p-10">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="p-10 text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {summary && <SummaryCards summary={summary} />}

      {summary && goals && (
        <ProgressSection summary={summary} goals={goals} />
      )}

      {weekly.length > 0 && <WeeklyChart data={weekly} />}

      <RecentMeals meals={meals} />
    </div>
  );
}

/* ---------------- SUMMARY CARDS ---------------- */

function SummaryCards({ summary }) {
  const { calories, protein, carbs, fat } = summary;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Stat label="Calories" value={`${calories} kcal`} />
      <Stat label="Protein" value={`${protein} g`} />
      <Stat label="Carbs" value={`${carbs} g`} />
      <Stat label="Fat" value={`${fat} g`} />
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}

/* ---------------- PROGRESS SECTION ---------------- */

function ProgressSection({ summary, goals }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow space-y-4">
      <h2 className="text-xl font-semibold">Today's Progress</h2>

      <ProgressBar
        label="Calories"
        value={summary.calories}
        goal={goals.daily_calories}
        unit="kcal"
      />
      <ProgressBar
        label="Protein"
        value={summary.protein}
        goal={goals.protein_g}
        unit="g"
      />
      <ProgressBar
        label="Carbs"
        value={summary.carbs}
        goal={goals.carbs_g}
        unit="g"
      />
      <ProgressBar
        label="Fat"
        value={summary.fat}
        goal={goals.fat_g}
        unit="g"
      />
    </div>
  );
}

function ProgressBar({ label, value = 0, goal = 0, unit }) {
  const percent = goal ? Math.min((value / goal) * 100, 100) : 0;

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span>
          {value}/{goal} {unit}
        </span>
      </div>

      <div className="w-full bg-slate-200 rounded-full h-3">
        <div
          className="bg-teal-600 h-3 rounded-full transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

/* ---------------- WEEKLY CHART ---------------- */

function WeeklyChart({ data }) {
  const max = Math.max(1, ...data.map((d) => d.calories || 0));

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-4">Weekly Calories</h2>

      <div className="flex items-end gap-4 h-40">
        {data.map((d) => (
          <div key={d.date} className="flex-1 text-center">
            <div
              className="bg-teal-500 rounded-t"
              style={{ height: `${(d.calories / max) * 100}%` }}
            />
            <p className="text-xs mt-1">{d.calories}</p>
            <p className="text-xs text-slate-500">{d.date}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function computeWeekly(meals) {
  const map = {};

  meals.forEach((meal) => {
    const d = new Date(meal.timestamp);
    if (Number.isNaN(d.getTime())) return;

    const date = d.toISOString().slice(0, 10); // YYYY-MM-DD
    const calories = meal.analysis?.total_nutrition?.calories || 0;
    map[date] = (map[date] || 0) + calories;
  });

  return Object.entries(map)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-7)
    .map(([date, calories]) => ({ date, calories }));
}

/* ---------------- RECENT MEALS ---------------- */

function RecentMeals({ meals }) {
  if (!meals.length) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <p>No meals analyzed yet.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Recent Meals</h2>

      <div className="grid md:grid-cols-3 gap-4">
        {meals.map((meal) => (
          <div
            key={meal._id}
            className="bg-white rounded-xl overflow-hidden shadow-sm"
          >
            <img
              src={meal.image_url}
              alt="meal"
              className="h-40 w-full object-cover"
            />
            <div className="p-4">
              <p className="font-medium">
                {meal.analysis?.total_nutrition?.calories || 0} kcal
              </p>
              <p className="text-sm text-slate-500">
                {new Date(meal.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
