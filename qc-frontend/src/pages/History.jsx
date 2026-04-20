import Sidebar from "../components/Sidebar";
import { useState, useEffect } from "react";
import { FaClock, FaSearch, FaFilter } from "react-icons/fa";

export default function History() {
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [time, setTime] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-GB'));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  //  DUMMY DATA : INI TOLONG DISESUAIIN DATANYA
  const initialData = [
    { time: "12:06", id: "S003", length: "32.5 mm", width: "13.5 mm", status: "NG" },
    { time: "12:05", id: "S004", length: "31.5 mm", width: "12.4 mm", status: "OK" },
    { time: "12:01", id: "S003", length: "32.6 mm", width: "12.8 mm", status: "NG" },
    { time: "11:59", id: "S002", length: "32.4 mm", width: "12.5 mm", status: "OK" },
    { time: "10:30", id: "S001", length: "30.2 mm", width: "11.2 mm", status: "OK" },
    { time: "09:15", id: "S005", length: "35.1 mm", width: "14.1 mm", status: "NG" },
  ];

  // LOGIC FILTERNYA
  const filteredData = initialData.filter((item) => {
    const matchesFilter = activeFilter === "ALL" || item.status === activeFilter;
    const matchesSearch = item.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="flex bg-gray-100 min-h-screen">
      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <div className="flex-1 p-10">
        
        {/* TOP BAR */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">History</h1>
            <p className="text-gray-500 mt-1">
              Browse and filter previous inspection data for tracking and analysis
            </p>
          </div>

          {/* RIGHT SIDE*/}
          <div className="flex flex-col items-end gap-4">
            <div className="bg-white/80 px-4 py-2 rounded-full shadow-sm font-mono font-bold text-xl">
              <FaClock className="inline mr-2 text-blue-500" /> {time}
            </div>
            
            <div className="relative group">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="Search by ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-72 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* FILTER SECTION */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2 text-gray-600 font-bold text-sm uppercase tracking-wider">
            <FaFilter /> Filter Status:
          </div>
          <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-200">
            {["ALL", "OK", "NG"].map((item) => (
              <button
                key={item}
                onClick={() => setActiveFilter(item)}
                className={`px-6 py-2 rounded-lg text-xs font-bold transition-all duration-300
                ${
                  activeFilter === item
                    ? "bg-[#2D3E50] text-white shadow-md"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* TABLE CONTAINER */}
        {/* DISESUAIIN JUGA DATANYA */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Time / Date</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Inspection ID</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Length</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Width</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredData.length > 0 ? (
                filteredData.map((item, index) => (
                  <tr key={index} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-4 text-sm text-gray-500 font-medium">{item.time}</td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-800">{item.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 text-center font-mono">{item.length}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 text-center font-mono">{item.width}</td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-block px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm
                        ${
                          item.status === "OK"
                            ? "bg-green-100 text-green-600 border border-green-200"
                            : "bg-red-100 text-red-600 border border-red-200"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <button className="text-blue-500 hover:text-blue-700 text-xs font-bold underline">
                          Details
                       </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-20 text-center text-gray-400 italic">
                    No data found for the selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        <div className="mt-6 flex justify-between items-center px-2">
          <p className="text-xs text-gray-500 font-medium">
            Showing {filteredData.length} entries
          </p>
          <div className="flex gap-2">
             <button className="px-3 py-1 bg-white border border-gray-300 rounded text-xs disabled:opacity-50" disabled>Prev</button>
             <button className="px-3 py-1 bg-[#2D3E50] text-white border border-[#2D3E50] rounded text-xs">1</button>
             <button className="px-3 py-1 bg-white border border-gray-300 rounded text-xs">Next</button>
          </div>
        </div>

      </div>
    </div>
  );
}