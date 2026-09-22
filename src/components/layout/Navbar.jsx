import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Trophy, LayoutDashboard, Settings, LogOut } from "lucide-react";
import { supabase } from "../../supabaseClient";

export default function Navbar() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkUserRole() {
      if (!user) {
        setIsAdmin(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching user role:", error);
        setIsAdmin(false);
        return;
      }

      // Explicit check: only show admin if role is strictly 'admin'
      if (data && data.role === "admin") {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    }

    checkUserRole();
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <nav className="bg-[#111827] border-b border-slate-800 p-4 text-white sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link
          to="/"
          className="text-xl font-bold flex items-center gap-2 text-white hover:text-yellow-400 transition-colors"
        >
          <Trophy className="text-yellow-400" size={24} />
          Fairshare
        </Link>

        <div className="flex items-center gap-6">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="text-sm font-medium text-slate-300 hover:text-white flex items-center gap-2 transition-colors"
              >
                <LayoutDashboard size={16} /> Dashboard
              </Link>

              {/* Renders ONLY if role is explicitly 'admin' */}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="text-sm font-medium text-yellow-400 hover:text-yellow-300 flex items-center gap-2 transition-colors"
                >
                  <Settings size={16} /> Admin
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="text-sm font-medium text-slate-400 hover:text-rose-400 flex items-center gap-2 transition-colors"
              >
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="bg-yellow-400 hover:bg-yellow-500 text-black px-5 py-2 rounded-full text-sm font-bold transition-colors"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
