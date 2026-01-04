import { Link } from "react-router-dom";
import { Camera, Activity, Users, BarChart3 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-8 py-20 grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Snap your food.  
            <span className="text-teal-600"> Understand your nutrition.</span>
          </h1>

          <p className="text-slate-600 text-lg">
            NutriSnap uses AI to analyze your meals, track nutrition,
            and help you build healthier eating habits — effortlessly.
          </p>

          <div className="flex gap-4">
            {user ? (
              <Link
                to="/analyze"
                className="bg-teal-600 text-white px-6 py-3 rounded-lg font-medium"
              >
                Analyze Meal
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="bg-teal-600 text-white px-6 py-3 rounded-lg font-medium"
                >
                  Get Started
                </Link>
                <Link
                  to="/login"
                  className="border px-6 py-3 rounded-lg font-medium"
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Visual / Stats */}
        <div className="grid grid-cols-2 gap-6">
          <StatCard icon={<Camera />} label="AI Meal Scan" />
          <StatCard icon={<BarChart3 />} label="Nutrition Tracking" />
          <StatCard icon={<Users />} label="Community Recipes" />
          <StatCard icon={<Activity />} label="Health Insights" />
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-8 text-center space-y-12">
          <h2 className="text-3xl font-bold">How NutriSnap Works</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <Step
              step="1"
              title="Snap your meal"
              desc="Upload a photo of your food in seconds."
            />
            <Step
              step="2"
              title="AI analyzes nutrition"
              desc="Calories, protein, carbs & more — instantly."
            />
            <Step
              step="3"
              title="Track & improve"
              desc="Monitor progress and eat smarter every day."
            />
          </div>
        </div>
      </section>

      {/* Community CTA */}
      <section className="py-20 bg-teal-600 text-white">
        <div className="max-w-5xl mx-auto px-8 text-center space-y-6">
          <h2 className="text-3xl font-bold">
            Join a community of smart eaters
          </h2>
          <p className="text-teal-100">
            Share meals, discover recipes, and learn from others.
          </p>

          <Link
            to="/community"
            className="inline-block bg-white text-teal-600 px-6 py-3 rounded-lg font-medium"
          >
            Explore Community
          </Link>
        </div>
      </section>
    </div>
  );
}

/* ---------------- COMPONENTS ---------------- */

function StatCard({ icon, label }) {
  return (
    <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4">
      <div className="text-teal-600">{icon}</div>
      <p className="font-medium">{label}</p>
    </div>
  );
}

function Step({ step, title, desc }) {
  return (
    <div className="bg-slate-50 p-6 rounded-xl shadow-sm">
      <div className="text-teal-600 text-2xl font-bold mb-2">
        {step}
      </div>
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-slate-600 text-sm">{desc}</p>
    </div>
  );
}
