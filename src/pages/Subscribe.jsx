import { useState, useEffect } from "react";
import { ShieldCheck, Heart, Check } from "lucide-react";
import PlanCard from "../components/subscription/PlanCard";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabaseClient";

export default function Subscribe() {
  const { user } = useAuth(); // Get the logged-in user
  const [charities, setCharities] = useState([]);
  const [selectedCharity, setSelectedCharity] = useState(null);

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

  // Connect to Stripe Checkout
  const handleSubscribe = async (planType) => {
    // Determine which API ID to use based on the button clicked
    const priceId =
      planType === "yearly"
        ? import.meta.env.VITE_STRIPE_PRICE_YEARLY
        : import.meta.env.VITE_STRIPE_PRICE_MONTHLY;

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId: priceId,
          userId: user.id, // Pass the Supabase User ID securely
          charityId: selectedCharity, // Pass the selected charity ID along to checkout
        }),
      });

      const data = await response.json();

      // Redirect the user to the secure Stripe-hosted checkout page
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("No URL returned:", data);
      }
    } catch (error) {
      console.error("Checkout failed:", error);
    }
  };

  const monthlyFeatures = [
    "Track your 5-score Stableford handicap",
    "Enter monthly prize draws",
    "Support verified charities",
    "Access to exclusive challenges",
    "Cancel anytime",
  ];

  const yearlyFeatures = [
    "Everything in Monthly Plan",
    "12 monthly prize draw entries",
    "Extra bonus draws",
    "Priority access to new features",
    "Make an even bigger impact",
  ];

  return (
    <div className="min-h-screen bg-[#0b101e] text-white relative overflow-hidden flex flex-col items-center justify-center px-4 py-20">
      {/* Stronger Background Glow Effects to match the image */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-rose-600/20 blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-yellow-500/15 blur-[120px] pointer-events-none"></div>

      {/* Header Section */}
      <div className="text-center max-w-3xl mb-12 relative z-10">
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="h-px bg-slate-700 w-12"></div>
          <p className="text-slate-400 uppercase tracking-[0.2em] text-xs font-semibold">
            A Healthier You • A Brighter Tomorrow
          </p>
          <div className="h-px bg-slate-700 w-12"></div>
        </div>

        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
          Track Your Progress.
          <br />
          Win Amazing Prizes.
          <br />
          <span className="text-yellow-400">Make a Real Difference.</span>
        </h1>

        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto">
          Stay consistent, join monthly prize draws, and help support meaningful
          causes — all with one membership.
        </p>
      </div>

      {/* Charity Selection Section (Matched to app's dark theme aesthetic) */}
      <div className="max-w-5xl w-full mb-12 relative z-10">
        <div className="bg-[#111827]/80 border border-slate-800 rounded-3xl p-6 md:p-8 backdrop-blur-md shadow-xl">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="text-rose-400" size={20} />
            <h2 className="text-lg font-bold text-white">Select Your Cause</h2>
          </div>
          <p className="text-slate-400 text-sm mb-6">
            Choose a partner charity to support with your membership
            contribution.
          </p>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {charities.map((charity) => (
              <div
                key={charity.id}
                onClick={() => setSelectedCharity(charity.id)}
                className={`cursor-pointer border rounded-2xl p-4 transition-all flex flex-col justify-between ${
                  selectedCharity === charity.id
                    ? "bg-yellow-400/10 border-yellow-400 text-white shadow-[0_0_15px_rgba(251,191,36,0.15)]"
                    : "bg-[#0b101e] border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-white text-sm">
                      {charity.name}
                    </span>
                    {selectedCharity === charity.id && (
                      <Check size={16} className="text-yellow-400" />
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
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-2 gap-8 max-w-5xl w-full relative z-10 mb-16">
        <PlanCard
          title="Monthly Plan"
          subtitle="Start your journey today"
          price="9.99"
          period="month"
          features={monthlyFeatures}
          isHighlighted={false}
          onSubscribe={() => handleSubscribe("monthly")}
        />

        <PlanCard
          title="Yearly Plan"
          subtitle="More value. A bigger impact."
          price="99.99"
          period="year"
          originalPrice="119.99"
          features={yearlyFeatures}
          isHighlighted={true}
          badge="Save $20"
          onSubscribe={() => handleSubscribe("yearly")}
        />
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
