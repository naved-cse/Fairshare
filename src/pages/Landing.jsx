import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Trophy,
  Heart,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
} from "lucide-react";

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#0b101e] text-white relative overflow-hidden flex flex-col items-center justify-between px-4 py-20 selection:bg-yellow-400 selection:text-black">
      {/* Immersive Background Glow Effects matching Subscription Page */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-rose-600/20 blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-yellow-500/15 blur-[120px] pointer-events-none"></div>

      {/* Hero Header Section */}
      <div className="max-w-4xl mx-auto text-center relative z-10 mb-16">
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="h-px bg-slate-700 w-12"></div>
          <p className="text-slate-400 uppercase tracking-[0.2em] text-xs font-semibold">
            Win Big • Give Back • Stay Consistent
          </p>
          <div className="h-px bg-slate-700 w-12"></div>
        </div>

        <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight tracking-tight">
          Track Your Progress.
          <br />
          Win Amazing Prizes.
          <br />
          <span className="bg-gradient-to-r from-yellow-400 to-amber-200 bg-clip-text text-transparent">
            Make a Real Difference.
          </span>
        </h1>

        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Fairshare pools monthly subscriptions to fund life-changing prize
          draws while consistently channeling revenue to verified charitable
          causes.
        </p>

        {/* Hero Action Buttons including the new Donate Button */}
        <div className="flex flex-wrap gap-4 justify-center items-center">
          <Link
            to={user ? "/dashboard" : "/signup"}
            className="flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black px-8 py-4 rounded-2xl text-base font-extrabold transition-all shadow-[0_0_30px_rgba(251,191,36,0.25)] hover:scale-[1.02]"
          >
            {user ? "Go to Dashboard" : "Get Started Now"}{" "}
            <ArrowRight size={18} />
          </Link>

          <Link
            to="/donate"
            className="flex items-center justify-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 px-8 py-4 rounded-2xl text-base font-bold transition-all backdrop-blur-md"
          >
            <Heart size={18} /> Donate Now
          </Link>

          <Link
            to="/charities"
            className="flex items-center justify-center gap-2 bg-[#111827]/80 hover:bg-slate-800 text-white border border-slate-700/80 px-8 py-4 rounded-2xl text-base font-bold transition-all backdrop-blur-md"
          >
            Explore Charities
          </Link>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="max-w-5xl w-full grid md:grid-cols-3 gap-6 relative z-10 mb-20">
        <div className="bg-[#111827]/80 border border-slate-800/80 rounded-3xl p-8 backdrop-blur-md shadow-xl flex flex-col justify-between">
          <div className="w-12 h-12 rounded-2xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center text-yellow-400 mb-6">
            <Trophy size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-2">
              Monthly Prize Pools
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Every active member gets automatically entered into transparent
              monthly community draws.
            </p>
          </div>
        </div>

        <div className="bg-[#111827]/80 border border-slate-800/80 rounded-3xl p-8 backdrop-blur-md shadow-xl flex flex-col justify-between">
          <div className="w-12 h-12 rounded-2xl bg-rose-400/10 border border-rose-400/20 flex items-center justify-center text-rose-400 mb-6">
            <Heart size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-2">
              Direct Charity Support
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              A minimum of 10% from every membership goes straight toward
              verified partner causes.
            </p>
          </div>
        </div>

        <div className="bg-[#111827]/80 border border-slate-800/80 rounded-3xl p-8 backdrop-blur-md shadow-xl flex flex-col justify-between">
          <div className="w-12 h-12 rounded-2xl bg-teal-400/10 border border-teal-400/20 flex items-center justify-center text-teal-400 mb-6">
            <Sparkles size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-2">
              Stableford Tracking
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Log your rounds, track your rolling handicap, and stay active
              while supporting a community.
            </p>
          </div>
        </div>
      </div>

      {/* Trust Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-12 relative z-10">
        <div className="flex items-center gap-4">
          <ShieldCheck className="text-teal-400" size={32} />
          <div>
            <p className="font-semibold text-white">Secure payment</p>
            <p className="text-slate-400 text-sm">
              Your data is always protected
            </p>
          </div>
        </div>

        <div className="hidden sm:block w-px h-10 bg-slate-800"></div>

        <div className="flex items-center gap-4">
          <Heart className="text-rose-400" size={32} />
          <div>
            <p className="font-semibold text-white">Every membership helps</p>
            <p className="text-slate-400 text-sm">
              Min 10% goes to trusted charities
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
