import Sidebar from "../components/Sidebar";
import { useEffect, useRef, useState } from "react";
import { FaClock, FaVideo, FaVideoSlash, FaSave } from "react-icons/fa";
import API from "../api/api";

export default function InspectionLive() {
  const videoRef = useRef(null);
  const streamRef = useRef(null); 
  const [time, setTime] = useState("");
  const [user, setUser] = useState(null);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [length, setLength] = useState(0.00);
  const [width, setWidth] = useState(0.00);

  //  FETCH USER DATA
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

  //  START KAMERA
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraOn(true);
    } catch (err) {
      console.error("Gagal akses kamera:", err);
      alert("Pastikan izin kamera sudah diberikan ya beb!");
    }
  };

  //  FUNGSI STOP KAMERA (matiin hardware)
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraOn(false);
  };

  // Jalankan kamera saat pertama kali masuk halaman
  useEffect(() => {
    startCamera();
    return () => stopCamera(); // Stop kamera otomatis kalau pindah halaman
  }, []);

  return (
    <div className="flex bg-gray-100 min-h-screen font-poppins">
      <Sidebar user={user} />

      <div className="flex-1 p-10">
        {/* TOP BAR */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-800">INSPECTION MODE</h1>
            <p className="text-gray-500">Live quality checking via computer vision</p>
          </div>
          <div className="bg-white/80 px-4 py-2 rounded-full shadow-sm font-mono font-bold text-xl">
            <FaClock className="inline mr-2 text-blue-500" /> {time}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-8">
          {/* LEFT */}
          <div className="col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-gray-700 uppercase tracking-widest text-sm">Live Camera Feed</h2>
                
                {/* Tombol Toggle Kamera */}
                <button 
                  onClick={isCameraOn ? stopCamera : startCamera}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    isCameraOn ? "bg-red-100 text-red-600 hover:bg-red-200" : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                  }`}
                >
                  {isCameraOn ? <><FaVideoSlash /> Close Camera</> : <><FaVideo /> Open Camera</>}
                </button>
              </div>

              {/* Tampilan Video */}
              <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-video flex items-center justify-center border-4 border-gray-50 shadow-inner">
                {isCameraOn ? (
                  <video ref={videoRef} autoPlay className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center text-gray-500">
                    <FaVideoSlash className="text-6xl mx-auto mb-4 opacity-20" />
                    <p className="font-bold italic">Camera is currently turned off</p>
                  </div>
                )}
                
                {/* Overlay Measurement Mockup (Muncul cuma kalo kamera nyala) */}
                {isCameraOn && (
                  <div className="absolute border-2 border-yellow-400 w-40 h-20 animate-pulse flex flex-col justify-between p-1">
                    <span className="text-[10px] text-yellow-400 font-bold bg-black/40 px-1 w-fit">14.8mm</span>
                  </div>
                )}
              </div>
            </div>

            {/* Table History Singkat NANTI DISESUAIIN YA */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
               <h2 className="font-bold text-gray-700 mb-4 text-sm uppercase tracking-widest">Session Results</h2>
               <div className="text-center py-6 text-gray-300 italic font-medium">Ready to record new data...</div>
            </div>
          </div>

          {/* RIGHT */}
<div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-50 h-fit sticky top-10 font-poppins">
  <h2 className="text-xl font-black text-gray-800 mb-6 border-b pb-4 tracking-tight">Inspection Result</h2>
  
  <div className="space-y-5">
     {/* LENGTH DATA */}
     <div className="flex justify-between items-center border-b border-gray-50 pb-3">
        <span className="text-gray-400 text-sm font-bold uppercase tracking-wider">Length</span>
        <span className="font-mono font-black text-gray-700 text-lg">
          {length.toFixed(2)} <span className="text-[10px] text-gray-400 font-normal">mm</span>
        </span>
     </div>

     {/* WIDTH DATA */}
     <div className="flex justify-between items-center border-b border-gray-50 pb-3">
        <span className="text-gray-400 text-sm font-bold uppercase tracking-wider">Width</span>
        <span className="font-mono font-black text-gray-700 text-lg">
          {width.toFixed(2)} <span className="text-[10px] text-gray-400 font-normal">mm</span>
        </span>
     </div>

     {/* STATUS */}
     <div className="flex justify-between items-center border-b border-gray-50 pb-4">
        <span className="text-gray-400 text-sm font-bold uppercase tracking-wider">Status</span>
        <span className="bg-green-100 text-green-600 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter">
          OK
        </span>
     </div>
     
     {/* NOTES */}
     <div className="pt-2">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Analysis Notes</label>
        <textarea 
          placeholder="Input findings here..." 
          className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-100 outline-none h-32 transition-all resize-none"
        ></textarea>
     </div>

     {/* SAVE BUTTON */}
     <button className="w-full bg-[#2D3E50] text-white py-4 rounded-2xl font-black shadow-lg hover:bg-[#1A2530] transition-all flex items-center justify-center gap-3 mt-4 group">
        <FaSave className="group-hover:scale-110 transition-transform" /> 
        <span className="tracking-widest">SAVE INSPECTION</span>
     </button>
  </div>
</div>
        </div>
      </div>
    </div>
  );
}