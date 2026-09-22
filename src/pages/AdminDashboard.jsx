import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import {
  Users,
  Trophy,
  Heart,
  ShieldAlert,
  CheckCircle,
  Clock,
  DollarSign,
  Edit3,
  RefreshCw,
} from "lucide-react";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({
    usersCount: 0,
    charityCount: 0,
    drawsCount: 0,
  });
  const [drawHistory, setDrawHistory] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminMetrics();
    fetchDrawHistory();
    fetchUsersList();
  }, []);

  const fetchAdminMetrics = async () => {
    try {
      const { count: userCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });
      const { count: drawCount, error: drawError } = await supabase
        .from("draws")
        .select("*", { count: "exact", head: true });

      let charityCount = 0;
      const { count: cCount, error: charityError } = await supabase
        .from("charities")
        .select("*", { count: "exact", head: true });
      if (!charityError) {
        charityCount = cCount || 0;
      }

      setStats({
        usersCount: userCount || 0,
        charityCount: charityCount,
        drawsCount: drawError ? 0 : drawCount || 0,
      });
    } catch (err) {
      console.error("Error loading metrics:", err);
    }
  };

  const fetchDrawHistory = async () => {
    try {
      const { data, error } = await supabase
        .from("draws")
        .select(
          `
          *,
          profiles:winner_id (email)
        `,
        )
        .order("created_at", { ascending: false });

      if (!error && data) {
        setDrawHistory(data);
      }
    } catch (err) {
      console.error("Error loading draws:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsersList = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(`*, subscriptions (status)`)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setUsersList(data);
      }
    } catch (err) {
      console.error("Error fetching users list:", err);
    }
  };

  const triggerManualDraw = async () => {
    const res = await fetch("/api/draw", { method: "POST" });
    const data = await res.json();
    if (data.success) {
      alert(`Draw executed! Prize Pool: $${data.prizePool}`);
      fetchAdminMetrics();
      fetchDrawHistory();
    } else {
      alert(`Error: ${data.error}`);
    }
  };

  const markAsPaid = async (drawId) => {
    try {
      const { error } = await supabase
        .from("draws")
        .update({ status: "completed" })
        .eq("id", drawId);

      if (error) throw error;
      fetchDrawHistory();
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to mark as paid.");
    }
  };

  // Admin Override: Edit User Golf Score
  const handleAdminScoreOverride = async (userId) => {
    const newPoints = prompt(
      "Enter new Stableford points for this user's latest round (1–45):",
    );
    if (!newPoints) return;

    const pointsNum = parseInt(newPoints);
    if (isNaN(pointsNum) || pointsNum < 1 || pointsNum > 45) {
      alert("Invalid points. Stableford score must be between 1 and 45.");
      return;
    }

    const { error } = await supabase
      .from("scores")
      .update({ stableford_points: pointsNum })
      .eq("user_id", userId);

    if (error) {
      console.error("Error overriding score:", error);
      alert("Failed to update score.");
    } else {
      alert("User score successfully overridden by admin!");
    }
  };

  // Admin Override: Toggle Subscription Status with Instant UI Update
  const handleAdminSubscriptionOverride = async (userId, currentStatus) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    // 1. Check if a subscription row already exists for this user
    const { data: existingRows, error: fetchError } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("user_id", userId);

    if (fetchError) {
      console.error("Error checking subscription:", fetchError);
      alert(`Failed to check status: ${fetchError.message}`);
      return;
    }

    let error;
    if (existingRows && existingRows.length > 0) {
      const res = await supabase
        .from("subscriptions")
        .update({ status: newStatus })
        .eq("user_id", userId);
      error = res.error;
    } else {
      const res = await supabase
        .from("subscriptions")
        .insert([{ user_id: userId, status: newStatus }]);
      error = res.error;
    }

    if (error) {
      console.error("Error updating subscription override:", error);
      alert(`Failed to update subscription status: ${error.message}`);
    } else {
      // INSTANT UI UPDATE: Update local state so the table updates immediately
      setUsersList((prevUsers) =>
        prevUsers.map((u) => {
          if (u.id === userId) {
            return {
              ...u,
              subscriptions: [{ status: newStatus }],
            };
          }
          return u;
        }),
      );
      alert(`Subscription status changed to ${newStatus}.`);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b101e] text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        {/* Admin Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldAlert className="text-yellow-400" size={20} />
              <span className="text-yellow-400 font-bold uppercase tracking-wider text-xs">
                Admin Control Center
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-white">
              Fairshare Management
            </h1>
          </div>

          <button
            onClick={triggerManualDraw}
            className="px-5 py-2.5 rounded-full bg-yellow-400 hover:bg-yellow-500 text-black text-sm font-bold transition-all shadow-[0_0_20px_rgba(251,191,36,0.2)]"
          >
            Trigger Monthly Draw Now 🏆
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-8 border-b border-slate-800 pb-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all shrink-0 ${
              activeTab === "overview"
                ? "bg-slate-800 text-white border border-slate-700"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all shrink-0 ${
              activeTab === "users"
                ? "bg-slate-800 text-white border border-slate-700"
                : "text-slate-400 hover:text-white"
            }`}
          >
            User Management & Overrides
          </button>
          <button
            onClick={() => setActiveTab("draws")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all shrink-0 ${
              activeTab === "draws"
                ? "bg-slate-800 text-white border border-slate-700"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Draw Management & Payouts
          </button>
        </div>

        {/* Tab Content: Overview */}
        {activeTab === "overview" && (
          <div>
            <div className="grid md:grid-cols-3 gap-6 mb-10">
              <div className="bg-[#111827] border border-slate-800 p-6 rounded-3xl">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-slate-400 text-sm font-medium">
                    Total Registered Users
                  </span>
                  <Users className="text-teal-400" size={20} />
                </div>
                <div className="text-4xl font-extrabold text-white mb-2">
                  {stats.usersCount}
                </div>
                <p className="text-slate-500 text-xs">
                  Based on authenticated profiles
                </p>
              </div>

              <div className="bg-[#111827] border border-slate-800 p-6 rounded-3xl">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-slate-400 text-sm font-medium">
                    Executed Draws
                  </span>
                  <Trophy className="text-yellow-400" size={20} />
                </div>
                <div className="text-4xl font-extrabold text-yellow-400 mb-2">
                  {stats.drawsCount}
                </div>
                <p className="text-slate-500 text-xs">
                  Monthly prize pools completed
                </p>
              </div>

              <div className="bg-[#111827] border border-slate-800 p-6 rounded-3xl">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-slate-400 text-sm font-medium">
                    Partner Charities
                  </span>
                  <Heart className="text-rose-400" size={20} />
                </div>
                <div className="text-4xl font-extrabold text-white mb-2">
                  {stats.charityCount}
                </div>
                <p className="text-slate-500 text-xs">
                  Active causes supported
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: User Management & Overrides */}
        {activeTab === "users" && (
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6">
            <h3 className="text-lg font-bold text-white mb-2">
              User Profiles & Administrative Overrides
            </h3>
            <p className="text-slate-400 text-sm mb-6">
              View user accounts, override golf score entries, or modify
              subscription statuses manually.
            </p>

            {loading ? (
              <p className="text-slate-400 text-sm animate-pulse">
                Loading users...
              </p>
            ) : usersList.length === 0 ? (
              <div className="p-8 text-center border border-slate-800 border-dashed rounded-2xl bg-[#0b101e]">
                <p className="text-slate-400">No registered users found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-sm">
                      <th className="pb-3 font-semibold">User Email / ID</th>
                      <th className="pb-3 font-semibold">
                        Subscription Status
                      </th>
                      <th className="pb-3 font-semibold text-right">
                        Admin Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.map((u) => {
                      const subStatus =
                        u.subscriptions?.[0]?.status ||
                        u.subscription_status ||
                        "inactive";
                      return (
                        <tr
                          key={u.id}
                          className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-all"
                        >
                          <td className="py-4 text-white font-medium">
                            <p>{u.email || "No Email Provided"}</p>
                            <span className="text-xs text-slate-500 font-mono">
                              {u.id}
                            </span>
                          </td>
                          <td className="py-4">
                            <span
                              className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border ${
                                subStatus === "active"
                                  ? "bg-teal-500/10 text-teal-400 border-teal-500/20"
                                  : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                              }`}
                            >
                              {subStatus}
                            </span>
                          </td>
                          <td className="py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleAdminScoreOverride(u.id)}
                                className="px-3 py-1.5 rounded-xl bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 text-xs font-bold hover:bg-yellow-400/20 transition-all flex items-center gap-1"
                              >
                                <Edit3 size={12} /> Override Score
                              </button>
                              <button
                                onClick={() =>
                                  handleAdminSubscriptionOverride(
                                    u.id,
                                    subStatus,
                                  )
                                }
                                className="px-3 py-1.5 rounded-xl bg-teal-400/10 text-teal-400 border border-teal-400/20 text-xs font-bold hover:bg-teal-400/20 transition-all flex items-center gap-1"
                              >
                                <RefreshCw size={12} /> Toggle Sub
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab Content: Draws */}
        {activeTab === "draws" && (
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6">
            <h3 className="text-lg font-bold text-white mb-2">
              Draw History & Payouts
            </h3>
            <p className="text-slate-400 text-sm mb-6">
              Review past automated draws, verify winning profiles, and track
              payout status.
            </p>

            {loading ? (
              <p className="text-slate-400 text-sm animate-pulse">
                Loading draw records...
              </p>
            ) : drawHistory.length === 0 ? (
              <div className="p-8 text-center border border-slate-800 border-dashed rounded-2xl bg-[#0b101e]">
                <p className="text-slate-400">
                  No draws have been executed yet.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-sm">
                      <th className="pb-3 font-semibold">Draw Month</th>
                      <th className="pb-3 font-semibold">Prize Pool</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {drawHistory.map((draw) => (
                      <tr
                        key={draw.id}
                        className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-all"
                      >
                        <td className="py-4 text-white font-medium">
                          {draw.month || "N/A"}
                        </td>
                        <td className="py-4 text-green-400 font-bold">
                          ${draw.prize_amount}
                        </td>
                        <td className="py-4">
                          {draw.status === "completed" ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-500/10 text-teal-400 text-xs font-semibold rounded-full border border-teal-500/20">
                              <CheckCircle size={14} /> Completed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 text-yellow-400 text-xs font-semibold rounded-full border border-yellow-500/20">
                              <Clock size={14} /> Pending
                            </span>
                          )}
                        </td>
                        <td className="py-4 text-right flex flex-col items-end gap-2">
                          {draw.profiles?.email ? (
                            <span className="text-sm text-blue-400 font-semibold">
                              {draw.profiles.email}
                            </span>
                          ) : (
                            <span className="text-sm text-slate-500">
                              No winner data
                            </span>
                          )}

                          {draw.status !== "completed" && (
                            <button
                              onClick={() => markAsPaid(draw.id)}
                              className="text-xs bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/20 px-3 py-1 rounded-full transition-all"
                            >
                              Mark as Paid
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
