import { Check, Crown } from "lucide-react";

export default function PlanCard({
  title,
  subtitle,
  price,
  period,
  originalPrice,
  features,
  isHighlighted,
  badge,
  onSubscribe,
}) {
  return (
    <div
      className={`relative p-8 rounded-3xl transition-transform hover:scale-105 duration-300 ${
        isHighlighted
          ? "bg-[#111827] border-[1.5px] border-[#fbbf24] shadow-[0_0_40px_rgba(251,191,36,0.15)]"
          : "bg-[#111827] border border-slate-700/70"
      }`}
    >
      {/* Floating Badge for Yearly Plan */}
      {isHighlighted && badge && (
        <div className="absolute -top-4 right-8 bg-[#fbbf24] text-yellow-950 px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-1.5">
          <Crown size={16} />
          {badge}
        </div>
      )}

      <div className="mb-8">
        <h3 className="text-2xl font-bold text-white mb-1">{title}</h3>
        <p className="text-slate-400 text-sm">{subtitle}</p>
      </div>

      {/* Fixed Price Layout */}
      <div className="mb-8 flex items-baseline gap-2">
        <span
          className={`text-5xl font-extrabold tracking-tight ${isHighlighted ? "text-[#fbbf24]" : "text-white"}`}
        >
          ${price}
        </span>
        <div className="flex items-baseline gap-2">
          <span className="text-slate-400">/ {period}</span>
          {originalPrice && (
            <span className="text-slate-500 line-through text-sm">
              ${originalPrice}
            </span>
          )}
        </div>
      </div>

      <ul className="space-y-4 mb-10">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3 text-slate-300">
            <Check className="text-teal-400 shrink-0 mt-0.5" size={18} />
            <span className="text-sm">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={onSubscribe}
        className={`w-full py-3.5 rounded-full font-bold text-sm transition-all ${
          isHighlighted
            ? "bg-[#fbbf24] text-black hover:bg-[#f5b000] shadow-[0_0_20px_rgba(251,191,36,0.3)]"
            : "bg-transparent border border-slate-600 text-white hover:bg-slate-800"
        }`}
      >
        {isHighlighted ? "Get Yearly Plan" : "Get Monthly Plan"}
      </button>
    </div>
  );
}
