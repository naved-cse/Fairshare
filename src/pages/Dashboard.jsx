import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabaseClient";
import ScoreLogModal from "../components/dashboard/ScoreLogModal";
import {
  CheckCircle2,
  Trophy,
  Activity,
  Heart,
  ArrowRight,
  Plus,
} from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [scores, setScores] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [averageHandicap, setAverageHandicap] = useState("--");
  const [subscriptionStatus, setSubscriptionStatus] = useState("Loading...");

  useEffect(() => {
    if (searchParams.get("payment") === "success") {
      setShowSuccessBanner(true);
    }
    if (user) {
      fetchScores();
      fetchSubscriptionStatus();
    }
  }, [user, searchParams]);

  const fetchScores = async () => {
    const { data, error } = await supabase
      .from("scores")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false });

    if (error) {
      console.error("Error fetching scores:", error);
    } else {
      setScores(data || []);
      calculateRollingAverage(data || []);
    }
  };

  const fetchSubscriptionStatus = async () => {
    try {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("status")
        .eq("user_id", user.id)
        .single();

      if (error || !data) {
        setSubscriptionStatus("Inactive");
      } else {
        setSubscriptionStatus(data.status === "active" ? "Active" : "Inactive");
      }
    } catch (err) {
      setSubscriptionStatus("Inactive");
    }
  };

  const calculateRollingAverage = (scoreData) => {
    if (!scoreData || scoreData.length === 0) {
      setAverageHandicap("--");
      return;
    }
    const recentScores = scoreData.slice(0, 5);
    const sum = recentScores.reduce(
      (acc, curr) => acc + curr.stableford_points,
      0,
    );
    const avg = (sum / recentScores.length).toFixed(1);
    setAverageHandicap(avg);
  };

  return (
    <div className="min-h-screen bg-[#0b101e] text-white relative overflow-hidden p-6 md:p-12 flex flex-col items-center">
      {/* Background Glow Effects matching Subscription Page */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-rose-600/15 blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-yellow-500/10 blur-[120px] pointer-events-none"></div>

      <div className="max-w-5xl w-full relative z-10">
        {/* Success Banner after Payment */}
        {showSuccessBanner && (
          <div className="mb-8 bg-teal-500/10 border border-teal-500/30 p-6 rounded-3xl flex items-start gap-4 shadow-[0_0_30px_rgba(20,184,166,0.15)] backdrop-blur-md">
            <CheckCircle2 className="text-teal-400 shrink-0 mt-1" size={28} />
            <div>
              <h2 className="text-xl font-bold text-white mb-1">
                Payment Successful! 🎉
              </h2>
              <p className="text-slate-300 text-sm">
                Welcome to Fairshare Pro! Your membership is active and your
                monthly prize draw entries are locked in.
              </p>
            </div>
          </div>
        )}

        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white">
              Your Dashboard
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Logged in as{" "}
              <span className="text-white font-medium">{user?.email}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 rounded-2xl bg-yellow-400 hover:bg-yellow-500 text-black text-sm font-extrabold transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(251,191,36,0.2)] hover:scale-[1.02]"
            >
              <Plus size={16} /> Log Round
            </button>

            <Link
              to="/subscribe"
              className="px-6 py-3 rounded-2xl bg-[#111827] hover:bg-slate-800 text-slate-200 text-sm font-bold border border-slate-700/80 transition-all flex items-center gap-2 backdrop-blur-md"
            >
              Manage Plan <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="bg-[#111827]/80 border border-slate-800/80 p-8 rounded-3xl backdrop-blur-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400 text-sm font-medium">
                Stableford Average
              </span>
              <Activity className="text-teal-400" size={20} />
            </div>
            <div className="text-4xl font-extrabold text-white mb-2">
              {averageHandicap}
            </div>
            <p className="text-slate-500 text-xs">
              Based on your rolling {Math.min(scores.length, 5)} scores
            </p>
          </div>

          <div className="bg-[#111827]/80 border border-slate-800/80 p-8 rounded-3xl backdrop-blur-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400 text-sm font-medium">
                Monthly Prize Entries
              </span>
              <Trophy className="text-yellow-400" size={20} />
            </div>
            <div
              className={`text-4xl font-extrabold mb-2 ${subscriptionStatus === "Active" ? "text-yellow-400" : "text-slate-500"}`}
            >
              {subscriptionStatus}
            </div>
            <p className="text-slate-500 text-xs">
              {subscriptionStatus === "Active"
                ? "Eligible for random & algorithmic draws"
                : "Subscribe below to unlock entries"}
            </p>
          </div>

          <div className="bg-[#111827]/80 border border-slate-800/80 p-8 rounded-3xl backdrop-blur-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400 text-sm font-medium">
                Charity Contribution
              </span>
              <Heart className="text-rose-400" size={20} />
            </div>
            <div className="text-4xl font-extrabold text-white mb-2">10%</div>
            <p className="text-slate-500 text-xs">
              Allocated from your membership
            </p>
          </div>
        </div>

        {/* Recent Rounds Table */}
        <div className="bg-[#111827]/80 border border-slate-800/80 rounded-3xl p-8 backdrop-blur-md shadow-xl">
          <h3 className="text-lg font-bold text-white mb-4">Recent Rounds</h3>
          {scores.length === 0 ? (
            <p className="text-slate-500 text-sm py-8 text-center">
              No rounds logged yet. Click "Log Round" above to add your first
              score!
            </p>
          ) : (
            <div className="space-y-3">
              {scores.map((score) => (
                <div
                  key={score.id}
                  className="flex justify-between items-center p-4 bg-[#0b101e]/60 border border-slate-800/60 rounded-2xl"
                >
                  <div>
                    <p className="font-semibold text-white">
                      {score.course_name}
                    </p>
                    <p className="text-xs text-slate-400">{score.date}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold text-yellow-400">
                      {score.stableford_points} pts
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Component */}
      <ScoreLogModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onScoreAdded={fetchScores}
      />
    </div>
  );
}
