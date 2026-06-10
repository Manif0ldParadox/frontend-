import { Link, useLocation } from "react-router-dom";
import { FaTachometerAlt, FaCogs, FaHistory, FaWrench, FaSignOutAlt } from "react-icons/fa";

export default function Sidebar({ user }) {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  // 3D AVATAR
  const avatarUrl = user?.email 
    ? `https://api.dicebear.com/7.x/notionists/svg?seed=${user.email}` 
    : `https://api.dicebear.com/7.x/notionists/svg?seed=default`;

  return (
    <div className="w-64 h-screen bg-[#2D3E50] text-white flex flex-col justify-between sticky top-0 shadow-xl">
      
      {/* TOP: LOGO & NAV */}
      <div>
        <div className="flex items-center gap-3 p-6 mb-4">
          <div className="bg-white p-1 rounded-full shadow-sm">
            <img src="/logo.png" alt="logo" className="w-8 h-8 object-contain" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Epson QC</h1>
        </div>

        <nav className="space-y-1">
          <Link to="/dashboard" className={`flex items-center gap-4 px-6 py-4 transition-all font-medium ${isActive("/dashboard") ? "bg-gray-100 text-[#2D3E50] border-l-8 border-[#1A2530]" : "hover:bg-slate-600/50 text-gray-300"}`}>
            <FaTachometerAlt /> Dashboard
          </Link>
          <Link to="/inspection" className={`flex items-center gap-4 px-6 py-4 transition-all font-medium ${isActive("/inspection") ? "bg-gray-100 text-[#2D3E50] border-l-8 border-[#1A2530]" : "hover:bg-slate-600/50 text-gray-300"}`}>
            <FaWrench /> Inspection
          </Link>
          <Link to="/history" className={`flex items-center gap-4 px-6 py-4 transition-all font-medium ${isActive("/history") ? "bg-gray-100 text-[#2D3E50] border-l-8 border-[#1A2530]" : "hover:bg-slate-600/50 text-gray-300"}`}>
            <FaHistory /> History
          </Link>
          <Link to="/settings" className={`flex items-center gap-4 px-6 py-4 transition-all font-medium ${isActive("/settings") ? "bg-gray-100 text-[#2D3E50] border-l-8 border-[#1A2530]" : "hover:bg-slate-600/50 text-gray-300"}`}>
            <FaCogs /> Settings
          </Link>
        </nav>
      </div>

      {/* BOTTOM: PROFILE & LOGOUT */}
      <div className="p-6 bg-[#243342]">
        <div className="border-t border-slate-500/50 mb-6 w-full"></div>
        <div className="flex items-center gap-3 mb-6">
          <img
            src={avatarUrl}
            alt="profile"
            className="w-11 h-11 rounded-full border-2 border-blue-400 bg-slate-200 shadow-md"
          />
          <div className="overflow-hidden">
            <p className="text-sm font-bold truncate">{user?.full_name || "Loading..."}</p>
            <p className="text-[10px] text-blue-400 font-black uppercase">{user?.role || "User"}</p>
          </div>
        </div>

        <button
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/login";
          }}
          className="w-full flex items-center justify-center gap-3 bg-[#1A2530] py-3 rounded-xl hover:bg-red-900 transition-all font-semibold shadow-lg"
        >
          <FaSignOutAlt className="rotate-180" /> Log Out
        </button>
      </div>
    </div>
  );
}
