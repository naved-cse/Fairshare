import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import {
  Heart,
  Search,
  Filter,
  MapPin,
  ExternalLink,
  Calendar,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Charities() {
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // State for active charity modal profile view
  const [activeCharity, setActiveCharity] = useState(null);

  useEffect(() => {
    fetchCharities();
  }, []);

  const fetchCharities = async () => {
    const { data, error } = await supabase.from("charities").select("*");
    if (error) {
      console.error("Error fetching charities:", error);
    } else {
      setCharities(data || []);
    }
    setLoading(false);
  };

  const categories = [
    "All",
    ...new Set(charities.map((c) => c.category || "General")),
  ];

  const filteredCharities = charities.filter((charity) => {
    const matchesSearch =
      charity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (charity.description &&
        charity.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === "All" ||
      (charity.category || "General") === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#0b101e] text-white p-6 md:p-12 relative overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-rose-600/15 blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-yellow-500/10 blur-[120px] pointer-events-none"></div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Heart className="text-rose-400" size={24} />
            <span className="text-rose-400 font-semibold uppercase tracking-wider text-xs">
              Making an Impact
            </span>
          </div>
          <h1 className="text-4xl font-extrabold mb-3">Supported Charities</h1>
          <p className="text-slate-400 max-w-xl mx-auto text-sm">
            A minimum of 10% of all Fairshare memberships go directly to
            supporting these verified, high-impact organizations.
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="bg-[#111827]/85 border border-slate-800 rounded-3xl p-6 backdrop-blur-md shadow-xl mb-10 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <span className="absolute left-4 top-3.5 text-slate-400">
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="Search charities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0b101e] border border-slate-700 rounded-2xl pl-11 pr-4 py-3 text-white text-sm focus:outline-none focus:border-yellow-400 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1 shrink-0 mr-1">
              <Filter size={14} /> Filter:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  selectedCategory === cat
                    ? "bg-yellow-400 text-black shadow-[0_0_15px_rgba(251,191,36,0.2)]"
                    : "bg-[#0b101e] text-slate-400 border border-slate-800 hover:border-slate-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Charities Listing */}
        {loading ? (
          <p className="text-center text-slate-500 py-10">
            Loading charities...
          </p>
        ) : filteredCharities.length === 0 ? (
          <div className="text-center py-16 bg-[#111827]/40 border border-slate-800/60 rounded-3xl">
            <p className="text-slate-400 text-base mb-2">
              No charities found matching your criteria.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
              className="text-yellow-400 text-xs font-semibold hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {filteredCharities.map((charity) => (
              <div
                key={charity.id}
                className="bg-[#111827] border border-slate-800 rounded-3xl overflow-hidden flex flex-col justify-between shadow-xl transition-all hover:border-slate-700"
              >
                {charity.image_url ? (
                  <div className="h-48 overflow-hidden relative">
                    <img
                      src={charity.image_url}
                      alt={charity.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111827] to-transparent opacity-80"></div>
                  </div>
                ) : (
                  <div className="h-32 bg-gradient-to-br from-rose-500/10 to-yellow-500/10 flex items-center justify-center border-b border-slate-800">
                    <Heart className="text-rose-400/50" size={40} />
                  </div>
                )}

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {charity.name}
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed mb-6">
                      {charity.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                    <button
                      onClick={() => setActiveCharity(charity)}
                      className="text-xs font-bold text-yellow-400 hover:text-yellow-300 flex items-center gap-1 transition-colors"
                    >
                      View Profile & Events <ExternalLink size={12} />
                    </button>
                    <Link
                      to="/donate"
                      className="text-xs font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 px-3 py-1.5 rounded-xl border border-rose-500/20 transition-all"
                    >
                      Support
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Charity Profile & Events Modal */}
        {activeCharity && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-[#111827] border border-slate-800 rounded-3xl max-w-2xl w-full p-6 md:p-8 relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setActiveCharity(null)}
                className="absolute top-6 right-6 text-slate-400 hover:text-white bg-slate-800/80 p-2 rounded-full"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400">
                  <Heart size={20} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {activeCharity.name}
                  </h2>
                  <span className="text-xs text-teal-400 font-semibold flex items-center gap-1">
                    <MapPin size={12} /> Verified Partner Organization
                  </span>
                </div>
              </div>

              {activeCharity.image_url && (
                <div className="h-56 rounded-2xl overflow-hidden mb-6 border border-slate-800">
                  <img
                    src={activeCharity.image_url}
                    alt={activeCharity.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    About the Cause
                  </h4>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    {activeCharity.description}
                  </p>
                </div>

                {/* Upcoming Events Section */}
                <div className="bg-[#0b101e] border border-slate-800/80 rounded-2xl p-4">
                  <h4 className="text-xs font-semibold text-yellow-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Calendar size={14} /> Upcoming Golf Days & Events
                  </h4>
                  <p className="text-slate-300 text-sm">
                    {activeCharity.upcoming_events ||
                      "No upcoming community events scheduled at this moment. Check back soon for annual charity golf tournaments!"}
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    onClick={() => setActiveCharity(null)}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all"
                  >
                    Close
                  </button>
                  <Link
                    to="/donate"
                    className="px-6 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-black text-xs font-extrabold transition-all shadow-[0_0_15px_rgba(251,191,36,0.2)]"
                  >
                    Support This Cause Now
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
