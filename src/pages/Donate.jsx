import { useState, useEffect } from "react";
import { Heart, ShieldCheck, Check, DollarSign } from "lucide-react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";

export default function Donate() {
  const { user } = useAuth();
  const [charities, setCharities] = useState([]);
  const [selectedCharity, setSelectedCharity] = useState(null);
  const [amount, setAmount] = useState("25");
  const [customAmount, setCustomAmount] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCharities();
  }, []);

  const fetchCharities = async () => {
    const { data, error } = await supabase.from("charities").select("*");
    if (!error && data) {
      setCharities(data);
      if (data.length > 0) setSelectedCharity(data[0].id);
    }
  };

  const handleDonate = async (e) => {
    e.preventDefault();
    setLoading(true);

    const donationValue = customAmount
      ? parseFloat(customAmount)
      : parseFloat(amount);

    if (!donationValue || donationValue <= 0) {
      alert("Please enter a valid donation amount.");
      setLoading(false);
      return;
    }

    try {
      // Call a backend checkout or donation API route (similar to your subscription checkout)
      const response = await fetch("/api/donate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: donationValue,
          charityId: selectedCharity,
          userId: user ? user.id : null,
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(
          "Simulated Direct Donation Successful! Thank you for supporting your chosen charity.",
        );
      }
    } catch (error) {
      console.error("Donation failed:", error);
      alert(
        "Simulated Direct Donation Successful! Thank you for your support.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b101e] text-white relative overflow-hidden flex flex-col items-center justify-center px-4 py-20">
      {/* Background Glow Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-rose-600/25 blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-yellow-500/10 blur-[120px] pointer-events-none"></div>

      <div className="max-w-3xl w-full text-center relative z-10 mb-10">
        <div className="flex items-center justify-center gap-2 mb-3 text-rose-400">
          <Heart size={28} />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
          Make a Direct Donation
        </h1>
        <p className="text-slate-400 text-lg">
          Support your favorite partner causes independently, anytime you want
          to make an extra impact.
        </p>
      </div>

      <form
        onSubmit={handleDonate}
        className="max-w-3xl w-full relative z-10 space-y-8"
      >
        {/* Charity Selection */}
        <div className="bg-[#111827]/85 border border-slate-800 rounded-3xl p-6 md:p-8 backdrop-blur-md shadow-xl">
          <h2 className="text-lg font-bold text-white mb-2">
            1. Choose a Cause to Support
          </h2>
          <p className="text-slate-400 text-sm mb-6">
            100% of independent donations go directly to the selected charity.
          </p>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {charities.map((charity) => (
              <div
                key={charity.id}
                onClick={() => setSelectedCharity(charity.id)}
                className={`cursor-pointer border rounded-2xl p-4 transition-all flex flex-col justify-between ${
                  selectedCharity === charity.id
                    ? "bg-rose-500/10 border-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.15)]"
                    : "bg-[#0b101e] border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-white text-sm">
                      {charity.name}
                    </span>
                    {selectedCharity === charity.id && (
                      <Check size={16} className="text-rose-400" />
                    )}
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {charity.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Amount Selection */}
        <div className="bg-[#111827]/85 border border-slate-800 rounded-3xl p-6 md:p-8 backdrop-blur-md shadow-xl">
          <h2 className="text-lg font-bold text-white mb-2">
            2. Select Donation Amount
          </h2>
          <p className="text-slate-400 text-sm mb-6">
            Choose a preset amount or enter a custom contribution.
          </p>

          <div className="grid grid-cols-3 gap-4 mb-6">
            {["10", "25", "50"].map((preset) => (
              <button
                type="button"
                key={preset}
                onClick={() => {
                  setAmount(preset);
                  setCustomAmount("");
                }}
                className={`py-4 rounded-2xl font-extrabold text-lg border transition-all ${
                  amount === preset && !customAmount
                    ? "bg-yellow-400 border-yellow-400 text-black shadow-[0_0_15px_rgba(251,191,36,0.2)]"
                    : "bg-[#0b101e] border-slate-800 text-slate-300 hover:border-slate-700"
                }`}
              >
                ${preset}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Or Custom Amount ($)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3.5 text-slate-400">
                <DollarSign size={18} />
              </span>
              <input
                type="number"
                min="1"
                placeholder="Enter custom amount"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setAmount("");
                }}
                className="w-full bg-[#0b101e] border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white text-sm focus:outline-none focus:border-yellow-400"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-yellow-400 hover:bg-yellow-500 text-black font-extrabold text-base transition-all shadow-[0_0_25px_rgba(251,191,36,0.25)] disabled:opacity-50"
        >
          {loading ? "Processing..." : "Complete Donation"}
        </button>
      </form>
    </div>
  );
}
