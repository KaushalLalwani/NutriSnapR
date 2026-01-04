import { Link, useLocation } from "react-router-dom";
import { Activity } from "lucide-react";
import { useAuth } from "../context/AuthContext";


export default function Navbar() {
  const { pathname } = useLocation();
  const { user, logout, loading } = useAuth();

  if (loading) {
    return (
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold">
            <Activity className="text-teal-600" />
            <span>NutriSnap</span>
          </Link>
        </div>
      </nav>
    );
  }

  const linkClass = (path) =>
    pathname === path
      ? "text-teal-600 font-semibold"
      : "text-slate-600 hover:text-teal-600";

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* Center Brand (Unique Touch) */}
        <Link to="/" className="flex items-center gap-2 text-xl font-bold">
          <Activity className="text-teal-600" />
          <span>NutriSnap</span>
        </Link>

        {/* Navigation */}
        <div className="hidden md:flex gap-6 text-sm">
          <Link to="/analyze" className={linkClass("/analyze")}>Analyze</Link>
          <Link to="/dashboard" className={linkClass("/dashboard")}>Dashboard</Link>
          <Link to="/community" className={linkClass("/community")}>Community</Link>
          <Link to="/goals" className={linkClass("/goals")}>Goals</Link>

        </div>

        {/* Right Side */}
        {user ? (
  <>
    <button
      onClick={logout}
      className="text-slate-600 hover:text-red-500"
    >
      Logout
    </button>
    <Link
      to="/profile"
      className="px-4 py-1.5 rounded-full bg-teal-600 text-white"
    >
      Profile
    </Link>
  </>
) : (
  <>
    <Link to="/login" className="text-slate-600">
      Login
    </Link>
    <Link
      to="/register"
      className="px-4 py-1.5 rounded-full bg-teal-600 text-white"
    >
      Register
    </Link>
  </>
)}

      </div>
    </nav>
  );
}
