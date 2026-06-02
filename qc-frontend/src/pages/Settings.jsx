import Sidebar from "../components/Sidebar";
import { useEffect, useState } from "react";
import {
  FaClock,
  FaSearch,
  FaCamera,
  FaSave,
  FaBell,
  FaVolumeUp,
} from "react-icons/fa";
import API from "../api/api";

export default function Settings() {
  const [user, setUser] = useState(null);
  const [time, setTime] = useState("");
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState({
    live_camera: true,
    auto_save: false,
    ng_notification: true,
    sound_alert: true,
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await API.get("/me");
        setUser(res.data);
      } catch (err) {
        console.error("Fetch user error:", err.response?.data || err);
      }
    };

    const fetchSettings = async () => {
      try {
        const res = await API.get("/settings");
        setSettings(res.data);
      } catch (err) {
        console.error("Fetch settings error:", err.response?.data || err);
      }
    };

    fetchUser();
    fetchSettings();

    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString("en-GB"));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const updateSetting = async (key) => {
    try {
      setSaving(true);

      const updatedSettings = {
        ...settings,
        [key]: !settings[key],
      };

      setSettings(updatedSettings);

      const res = await API.put("/settings", updatedSettings);
      setSettings(res.data);
    } catch (err) {
      console.error("Update settings error:", err.response?.data || err);
      alert(err.response?.data?.detail || "Gagal memperbarui settings");
    } finally {
      setSaving(false);
    }
  };

  const avatarUrl = `https://api.dicebear.com/7.x/notionists/svg?seed=${
    user?.email || "default"
  }`;

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar user={user} />

      <div className="flex-1 p-10">
        {/* TOP BAR */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
            <p className="text-gray-500 mt-1">
              Manage system configuration and user preferences
            </p>
          </div>

          <div className="flex flex-col items-end gap-3">
            <div className="bg-white/80 px-4 py-2 rounded-full shadow-sm font-mono font-bold text-xl">
              <FaClock className="inline mr-2 text-blue-500" /> {time}
            </div>

            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search"
                className="pl-10 pr-4 py-1.5 border rounded-lg text-sm w-64 shadow-sm bg-white outline-none"
              />
            </div>
          </div>
        </div>

        {/* USER INFO CARD */}
        <div className="bg-white rounded-2xl shadow-sm mb-8 overflow-hidden border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 text-gray-400 font-bold text-[10px] uppercase tracking-widest">
            User Profile Information
          </div>

          <div className="p-8 flex items-center gap-8">
            <img
              src={avatarUrl}
              alt="User"
              className="w-28 h-28 rounded-full border-4 border-blue-50 bg-slate-100 shadow-md"
            />

            <div className="flex-1">
              <div className="mb-4">
                <h2 className="text-2xl font-black text-gray-800">
                  {user?.full_name || "Guest User"}
                </h2>

                <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest">
                  {user?.role || "Staff"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 max-w-2xl">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">
                    Email Address
                  </label>
                  <input
                    value={user?.email || "Email belum masuk..."}
                    disabled
                    className="w-full border border-gray-100 px-4 py-2.5 rounded-xl text-sm bg-gray-50 text-gray-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">
                    Account Status
                  </label>
                  <div className="px-4 py-2.5 rounded-xl text-sm bg-green-50 text-green-600 font-bold border border-green-100 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Verified Member
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SYSTEM SETTINGS */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 text-gray-400 font-bold text-[10px] uppercase tracking-widest flex justify-between">
            <span>System Preferences</span>
            {saving && <span className="text-blue-500">Saving...</span>}
          </div>

          <div className="divide-y divide-gray-50">
            <SettingItem
              icon={<FaCamera />}
              title="Live Camera Feed"
              description="Enable or disable live camera preview during inspection."
              active={settings.live_camera}
              onClick={() => updateSetting("live_camera")}
            />

            <SettingItem
              icon={<FaSave />}
              title="Auto Save Inspection"
              description="Automatically save inspection results after measurement."
              active={settings.auto_save}
              onClick={() => updateSetting("auto_save")}
            />

            <SettingItem
              icon={<FaBell />}
              title="NG Notification"
              description="Show notifications when inspection result is NG."
              active={settings.ng_notification}
              onClick={() => updateSetting("ng_notification")}
            />

            <SettingItem
              icon={<FaVolumeUp />}
              title="Sound Alert"
              description="Play sound alert for important inspection events."
              active={settings.sound_alert}
              onClick={() => updateSetting("sound_alert")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingItem({ icon, title, description, active, onClick }) {
  return (
    <div className="flex justify-between items-center px-8 py-6 hover:bg-gray-50/50 transition-colors">
      <div className="flex items-center gap-6">
        <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg text-gray-600 shadow-sm">
          {icon}
        </div>

        <div>
          <span className="font-bold text-gray-700 block">{title}</span>
          <span className="text-xs text-gray-400">{description}</span>
        </div>
      </div>

      <button
        onClick={onClick}
        type="button"
        className={`w-14 h-7 flex items-center rounded-full p-1 cursor-pointer transition-all duration-300 shadow-inner ${
          active ? "bg-blue-500" : "bg-gray-300"
        }`}
      >
        <div
          className={`bg-white w-5 h-5 rounded-full shadow transform transition-all duration-300 ${
            active ? "translate-x-7" : ""
          }`}
        ></div>
      </button>
    </div>
  );
}