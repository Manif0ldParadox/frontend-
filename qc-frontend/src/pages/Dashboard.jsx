import Sidebar from "../components/Sidebar";
import { useEffect, useState } from "react";
import { FaClock, FaSearch, FaChevronRight } from "react-icons/fa";
import API from "../api/api";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AnimatedNumber = ({ value, duration = 2000, isDecimal = false }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseFloat(value);
    const increment = end / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{isDecimal ? count.toFixed(1) : Math.floor(count)}</span>;
};

const SimplePieChart = ({ rate }) => {
  return (
    <div 
      className="w-16 h-16 rounded-full relative shadow-inner border-2 border-white"
      style={{
        background: `conic-gradient(#ef4444 0% ${rate}%, #22c55e ${rate}% 100%)`,
        transition: 'all 2s ease-in-out'
      }}
    >
      <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
        <span className="text-[8px] font-bold text-gray-400">{rate}%</span>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const [time, setTime] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await API.get("/me");
        setUser(res.data);
      } catch (err) { console.log(err); }
    };
    fetchUser();

    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-GB'));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // --- DATA UNTUK GRAFIK TREND ---
  // TOLONG NANTI INI DISESUAIIN YA DATANYA
  const lineData = {
    labels: ["Tue", "Wed", "Thu", "Fri", "Sat", "Sat", "Sun", "Mon"],
    datasets: [
      {
        fill: true,
        label: "NG Parts",
        data: [8, 12, 8, 13, 10, 12, 22, 28],
        borderColor: "#ef4444",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        tension: 0.4,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { display: false },
      x: { grid: { display: false } },
    },
  };

  // --- DATA RECENT INSPECTIONS ---
  // TOLONG NANTI INI DISESUAIIN YA DATANYA
  const recentData = [
    { id: "S003", time: "12:06", status: "NG", color: "bg-red-500" },
    { id: "S004", time: "12:05", status: "OK", color: "bg-green-500" },
    { id: "S003", time: "12:01", status: "NG", color: "bg-red-500" },
  ];

  return (
    <div className="flex bg-gray-100 min-h-screen font-poppins">
      <Sidebar user={user} />

      <div className="flex-1 p-10 overflow-y-auto">
        
        {/* TOP BAR */}
        <div className="flex justify-between items-start mb-10">
          <div>
            <h1 className="text-3xl font-black text-gray-800 tracking-tighter ">Dashboard</h1>
            <p className="text-gray-500 mt-1">Overview of inspection results and quality performance in real-time</p>
          </div>

          <div className="flex flex-col items-end gap-3 text-right">
            <div className="flex items-center gap-2 text-gray-800 bg-white/80 px-4 py-1 rounded-full shadow-sm border border-white">
              <FaClock className="text-blue-500" /> 
              <span className="font-mono font-bold text-xl">{time}</span>
            </div>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search" 
                className="pl-10 pr-4 py-1.5 border border-gray-200 rounded-lg text-sm w-64 shadow-sm outline-none bg-white" 
              />
            </div>
          </div>
        </div>

        {/* CARDS SECTION */}
        <div className="grid grid-cols-4 gap-6 mb-10">
          <div className="bg-white p-6 rounded-3xl shadow-sm border-b-8 border-blue-500">
            <p className="text-gray-400 text-[10px] font-bold uppercase mb-2">Total Inspections</p>
            <h2 className="text-5xl font-black text-blue-600">
              <AnimatedNumber value={1250} />
            </h2>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border-b-8 border-green-500">
            <p className="text-gray-400 text-[10px] font-bold uppercase mb-2">OK Parts</p>
            <h2 className="text-5xl font-black text-green-600">
              <AnimatedNumber value={1150} />
            </h2>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border-b-8 border-red-500">
            <p className="text-gray-400 text-[10px] font-bold uppercase mb-2">NG Parts</p>
            <h2 className="text-5xl font-black text-red-600">
              <AnimatedNumber value={10} />
            </h2>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border-b-8 border-orange-500 flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-[10px] font-bold uppercase mb-2">NG Rate</p>
              <h2 className="text-5xl font-black text-orange-600">
                <AnimatedNumber value={8.0} isDecimal={true} />%
              </h2>
            </div>
            <SimplePieChart rate={8} />
          </div>
        </div>

        {/*  TREND & RECENT SECTION */}
        <div className="space-y-8">
          
          {/* TREND CHART */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-50">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-black text-gray-800 tracking-tight">NG Trend</h2>
              <button className="text-blue-500 text-xs font-bold hover:underline flex items-center gap-1">
                1 - 6 Month <FaChevronRight className="text-[10px]" />
              </button>
            </div>
            <div className="h-64">
              <Line data={lineData} options={lineOptions} />
            </div>
          </div>

          {/* RECENT INSPECTIONS */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-50">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-black text-gray-800 tracking-tight">Recent Inspections</h2>
              <button className="text-blue-500 text-xs font-bold hover:underline flex items-center gap-1">
                View All <FaChevronRight className="text-[10px]" />
              </button>
            </div>
            <div className="space-y-4">
              {recentData.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-4 hover:bg-gray-50 rounded-2xl transition-all border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${item.color} animate-pulse`}></div>
                    <div>
                      <p className="font-bold text-gray-800">{item.id} - {item.status}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Today</p>
                    </div>
                  </div>
                  <p className="font-mono font-bold text-gray-700">{item.time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}