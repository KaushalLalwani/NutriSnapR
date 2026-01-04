import { useEffect, useState } from "react";
import api from "../services/api";

export default function Goals() {
  const [goals, setGoals] = useState({
    daily_calories: "",
    protein_g: "",
    carbs_g: "",
    fat_g: "",
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/goals")
      .then((res) => {
        if (res.data) setGoals(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    setGoals({ ...goals, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    await api.post("/goals", {
      daily_calories: Number(goals.daily_calories),
      protein_g: Number(goals.protein_g),
      carbs_g: Number(goals.carbs_g),
      fat_g: Number(goals.fat_g),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) return <div className="p-10">Loading goals...</div>;

  return (
    <div className="max-w-xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Nutrition Goals</h1>

      <div className="space-y-4 bg-white p-6 rounded-xl shadow">
        <Input label="Daily Calories" name="daily_calories" value={goals.daily_calories} onChange={handleChange} />
        <Input label="Protein (g)" name="protein_g" value={goals.protein_g} onChange={handleChange} />
        <Input label="Carbs (g)" name="carbs_g" value={goals.carbs_g} onChange={handleChange} />
        <Input label="Fat (g)" name="fat_g" value={goals.fat_g} onChange={handleChange} />

        <button
          onClick={handleSave}
          className="w-full bg-teal-600 text-white py-3 rounded"
        >
          Save Goals
        </button>

        {saved && (
          <p className="text-green-600 text-center">
            Goals saved successfully ✅
          </p>
        )}
      </div>
    </div>
  );
}

function Input({ label, name, value, onChange }) {
  return (
    <div>
      <label className="block text-sm text-slate-600 mb-1">{label}</label>
      <input
        type="number"
        name={name}
        value={value}
        onChange={onChange}
        className="w-full border p-3 rounded"
      />
    </div>
  );
}
