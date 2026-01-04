import { useState } from "react";
import api from "../services/api";

export default function Analyze() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
    setError("");
  };

const handleAnalyze = async () => {
  if (!image) return;

  setLoading(true);
  try {
    const formData = new FormData();
    formData.append("image", image);

    const res = await api.post("/analyze", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    setResult(res.data); // ✅ THIS WAS MISSING
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Analyze Your Meal</h1>

      {/* Upload */}
      <div className="border-2 border-dashed rounded-lg p-6 text-center bg-white">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
          id="upload"
        />
        <label htmlFor="upload" className="cursor-pointer text-teal-600">
          Click to upload meal image
        </label>

        {preview && (
          <img
            src={preview}
            alt="preview"
            className="mt-4 mx-auto max-h-64 rounded"
          />
        )}
      </div>

      {error && (
        <p className="text-red-600 mt-4 text-sm">{error}</p>
      )}

      <button
        onClick={handleAnalyze}
        disabled={loading}
        className="mt-6 px-6 py-3 bg-teal-600 text-white rounded hover:bg-teal-700 disabled:opacity-50"
      >
        {loading ? "Analyzing..." : "Analyze with AI"}
      </button>

      {result && <AnalysisResult data={result} />}
    </div>
  );
}

function AnalysisResult({ data }) {
  const total = data.analysis.total_nutrition;

  return (
    <div className="mt-10 space-y-6">
      <img
        src={data.image_url}
        alt="meal"
        className="w-full max-h-80 object-cover rounded"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Calories" value={`${total.calories} kcal`} />
        <Stat label="Protein" value={`${total.protein} g`} />
        <Stat label="Carbs" value={`${total.carbs} g`} />
        <Stat label="Fat" value={`${total.fat} g`} />
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-white p-4 rounded shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  );
}
