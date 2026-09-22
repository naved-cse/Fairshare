import { useState } from "react";
import { supabase } from "../../supabaseClient";
import { X } from "lucide-react";

export default function ScoreLogModal({ isOpen, onClose, onScoreAdded }) {
  const [courseName, setCourseName] = useState("");
  const [points, setPoints] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("You must be logged in to log a score.");
      setLoading(false);
      return;
    }

    const numericPoints = parseInt(points);
    if (numericPoints < 1 || numericPoints > 45) {
      alert("Score must be in the valid range of 1 to 45 Stableford points.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("scores").insert([
      {
        user_id: user.id,
        course_name: courseName,
        stableford_points: numericPoints,
        date: date,
      },
    ]);

    setLoading(false);

    if (error) {
      console.error("Error saving score:", error.message);
      // Handle unique constraint violation (duplicate date)
      if (error.code === "23505") {
        alert(
          "You have already logged a round for this date. Only one score per date is allowed.",
        );
      } else {
        alert("Failed to save score. Please check your inputs.");
      }
    } else {
      setCourseName("");
      setPoints("");
      onScoreAdded(); // Refresh dashboard data
      onClose(); // Close modal
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[#111827] border border-slate-800 rounded-3xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-white"
        >
          <X size={20} />
        </button>

        <h3 className="text-xl font-bold text-white mb-1">Log New Round</h3>
        <p className="text-slate-400 text-sm mb-6">
          Enter your Stableford points (1–45) for handicap tracking.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Course Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Pine Valley Golf Club"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              className="w-full bg-[#0b101e] border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-yellow-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Stableford Points (1–45)
            </label>
            <input
              type="number"
              required
              min="1"
              max="45"
              placeholder="e.g., 36"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              className="w-full bg-[#0b101e] border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-yellow-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Date
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-[#0b101e] border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-yellow-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 rounded-full bg-yellow-400 text-black font-bold text-sm hover:bg-yellow-500 transition-all shadow-[0_0_20px_rgba(251,191,36,0.2)] disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Round"}
          </button>
        </form>
      </div>
    </div>
  );
}
