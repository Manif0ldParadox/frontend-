import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { FaClock, FaSearch, FaCheckCircle } from "react-icons/fa";
import { useState, useEffect } from "react";

export default function InspectionStart() {
  const navigate = useNavigate();
  const [time, setTime] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-GB'));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />

      <div className="flex-1 p-10">
        {/* TOP BAR */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Start New Inspection</h1>
            <p className="text-gray-500 mt-1">Prepare inspection details before starting</p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <div className="bg-white/80 px-4 py-2 rounded-full shadow-sm font-mono font-bold text-xl">
            <FaClock className="inline mr-2 text-blue-500" /> {time}
          </div>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search" className="pl-10 pr-4 py-1.5 border rounded-lg text-sm w-64 shadow-sm outline-none" />
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm max-w-4xl">
          <div className="grid grid-cols-2 gap-6">
            
            <div className="col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">Inspection Title</label>
              <input type="text" defaultValue="Nail quality check" className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none transition-all" />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Worker Name</label>
              <input type="text" defaultValue="John Doe" className="w-full border border-gray-300 p-3 rounded-xl outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Product Line / Machine</label>
              <select className="w-full border border-gray-300 p-3 rounded-xl outline-none">
                <option>Line A</option>
                <option>Line B</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Product Id</label>
              <input type="text" defaultValue="Batch 231" className="w-full border border-gray-300 p-3 rounded-xl outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Date / Time</label>
              <input type="text" defaultValue="20/04/2026 22:38" className="w-full border border-gray-300 p-3 rounded-xl outline-none" />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">Inspection Type</label>
              <input type="text" defaultValue="Visual Check" className="w-full border border-gray-300 p-3 rounded-xl outline-none" />
            </div>
          </div>

          {/* FOOTER ACTIONS */}
          <div className="flex justify-between items-center mt-10">
            <div className="flex items-center gap-2 text-gray-600 bg-gray-100 px-4 py-2 rounded-lg">
              <span className="text-sm">Camera Status: <span className="font-semibold">Connected</span></span>
              <FaCheckCircle className="text-green-500" />
            </div>

            <div className="flex gap-4">
              <button className="px-8 py-3 border border-gray-300 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition">Cancel</button>
              <button 
                onClick={() => navigate("/inspection/live")}
                className="px-10 py-3 bg-[#2D3E50] text-white rounded-xl font-bold hover:bg-[#1A2530] transition shadow-lg"
              >
                Start Inspection
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}