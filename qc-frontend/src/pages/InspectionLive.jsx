import Sidebar from "../components/Sidebar";
import { useEffect, useRef, useState } from "react";
import {
  FaClock,
  FaVideo,
  FaVideoSlash,
  FaSave,
  FaImage,
} from "react-icons/fa";
import API from "../api/api";

const API_BASE_URL = "http://127.0.0.1:8000";

export default function InspectionLive() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [time, setTime] = useState("");
  const [user, setUser] = useState(null);
  const [isCameraOn, setIsCameraOn] = useState(true);

  const [length, setLength] = useState(0.0);
  const [width, setWidth] = useState(0.0);
  const [status, setStatus] = useState("OK");
  const [notes, setNotes] = useState("");
  const [sessionResults, setSessionResults] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [resultImage, setResultImage] = useState(null);

  // FETCH USER DATA + CLOCK
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await API.get("/me");
        setUser(res.data);
      } catch (err) {
        console.log("Fetch user error:", err.response?.data || err);
      }
    };

    fetchUser();

    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString("en-GB"));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // START KAMERA FRONTEND
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setIsCameraOn(true);
    } catch (err) {
      console.error("Gagal akses kamera:", err);
      alert("Pastikan izin kamera sudah diberikan.");
    }
  };

  // STOP KAMERA FRONTEND
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

  // JALANKAN KAMERA SAAT PERTAMA MASUK HALAMAN
  useEffect(() => {
    startCamera();

    return () => stopCamera();
  }, []);

  // SAVE INSPECTION KE BACKEND
  const handleSaveInspection = async () => {
    try {
      setIsSaving(true);

      // Matikan kamera browser sebentar agar kamera laptop bisa dipakai backend OpenCV.
      if (isCameraOn) {
        stopCamera();
        await new Promise((resolve) => setTimeout(resolve, 800));
      }

      const res = await API.post("/inspection/start", {
        inspection_title: "Inspection Box X1",
        worker_name: user?.full_name || "Arman Suhada",
        product_line: "Line A",
        product_id: "BOX-X1-001",
        inspection_type: "Dimension Check",
      });

      const result = res.data.inspection_result;

      setLength(Number(result.length_mm || 0));
      setWidth(Number(result.width_mm || 0));
      setStatus(result.status || "NG");
      setNotes(result.notes || "");

      // Tampilkan gambar hasil deteksi asli dari backend OpenCV.
      if (result.image_path) {
        setResultImage(`${API_BASE_URL}/${result.image_path}?t=${Date.now()}`);
      }

      setSessionResults((prev) => [result, ...prev]);

      alert("Inspection berhasil disimpan");
      console.log("Inspection result:", res.data);
    } catch (err) {
      console.log("Inspection error:", err.response?.data || err);
      alert(err.response?.data?.detail || "Inspection gagal");
    } finally {
      setIsSaving(false);

      // Delay supaya kamera frontend tidak langsung bentrok dengan backend.
      setTimeout(() => {
        startCamera();
      }, 700);
    }
  };

  return (
    <div className="flex bg-gray-100 min-h-screen font-poppins">
      <Sidebar user={user} />

      <div className="flex-1 p-10">
        {/* TOP BAR */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-800">
              INSPECTION MODE
            </h1>
            <p className="text-gray-500">
              Live quality checking via computer vision
            </p>
          </div>

          <div className="bg-white/80 px-4 py-2 rounded-full shadow-sm font-mono font-bold text-xl">
            <FaClock className="inline mr-2 text-blue-500" /> {time}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-8">
          {/* LEFT SECTION */}
          <div className="col-span-2 space-y-6">
            {/* LIVE CAMERA FEED */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-gray-700 uppercase tracking-widest text-sm">
                  Live Camera Feed
                </h2>

                <button
                  onClick={isCameraOn ? stopCamera : startCamera}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    isCameraOn
                      ? "bg-red-100 text-red-600 hover:bg-red-200"
                      : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                  }`}
                >
                  {isCameraOn ? (
                    <>
                      <FaVideoSlash /> Close Camera
                    </>
                  ) : (
                    <>
                      <FaVideo /> Open Camera
                    </>
                  )}
                </button>
              </div>

              <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-video flex items-center justify-center border-4 border-gray-50 shadow-inner">
                {isCameraOn ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center text-gray-500">
                    <FaVideoSlash className="text-6xl mx-auto mb-4 opacity-20" />
                    <p className="font-bold italic">
                      Camera is currently turned off
                    </p>
                  </div>
                )}

                {/* Overlay dummy 14.8mm sudah dihapus.
                    Preview kamera hanya untuk melihat posisi objek.
                    Deteksi asli muncul setelah SAVE INSPECTION. */}

                {isSaving && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="bg-white px-5 py-3 rounded-2xl shadow font-bold text-gray-700">
                      Processing inspection...
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* DETECTED RESULT IMAGE */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-gray-700 text-sm uppercase tracking-widest">
                  Detected Result Image
                </h2>

                <span className="text-xs text-gray-400 font-bold">
                  OpenCV output
                </span>
              </div>

              {resultImage ? (
                <img
                  src={resultImage}
                  alt="Inspection result"
                  className="w-full rounded-2xl border border-gray-100 shadow-sm"
                />
              ) : (
                <div className="text-center py-10 text-gray-300 italic font-medium">
                  <FaImage className="text-5xl mx-auto mb-3 opacity-30" />
                  Result image will appear after saving inspection.
                </div>
              )}
            </div>

            {/* SESSION RESULTS */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="font-bold text-gray-700 mb-4 text-sm uppercase tracking-widest">
                Session Results
              </h2>

              {sessionResults.length === 0 ? (
                <div className="text-center py-6 text-gray-300 italic font-medium">
                  Ready to record new data...
                </div>
              ) : (
                <div className="space-y-3">
                  {sessionResults.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center bg-gray-50 rounded-2xl px-4 py-3 text-sm"
                    >
                      <div>
                        <p className="font-bold text-gray-700">
                          {item.session_id}
                        </p>
                        <p className="text-gray-400">
                          {item.length_mm} mm × {item.width_mm} mm
                        </p>
                      </div>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-black ${
                          item.status === "OK"
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SECTION */}
          <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-50 h-fit sticky top-10 font-poppins">
            <h2 className="text-xl font-black text-gray-800 mb-6 border-b pb-4 tracking-tight">
              Inspection Result
            </h2>

            <div className="space-y-5">
              {/* LENGTH DATA */}
              <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                <span className="text-gray-400 text-sm font-bold uppercase tracking-wider">
                  Length
                </span>
                <span className="font-mono font-black text-gray-700 text-lg">
                  {length.toFixed(2)}{" "}
                  <span className="text-[10px] text-gray-400 font-normal">
                    mm
                  </span>
                </span>
              </div>

              {/* WIDTH DATA */}
              <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                <span className="text-gray-400 text-sm font-bold uppercase tracking-wider">
                  Width
                </span>
                <span className="font-mono font-black text-gray-700 text-lg">
                  {width.toFixed(2)}{" "}
                  <span className="text-[10px] text-gray-400 font-normal">
                    mm
                  </span>
                </span>
              </div>

              {/* STATUS */}
              <div className="flex justify-between items-center border-b border-gray-50 pb-4">
                <span className="text-gray-400 text-sm font-bold uppercase tracking-wider">
                  Status
                </span>
                <span
                  className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                    status === "OK"
                      ? "bg-green-100 text-green-600"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {status}
                </span>
              </div>

              {/* NOTES */}
              <div className="pt-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">
                  Analysis Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Input findings here..."
                  className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-100 outline-none h-32 transition-all resize-none"
                />
              </div>

              {/* SAVE BUTTON */}
              <button
                onClick={handleSaveInspection}
                disabled={isSaving}
                className="w-full bg-[#2D3E50] text-white py-4 rounded-2xl font-black shadow-lg hover:bg-[#1A2530] transition-all flex items-center justify-center gap-3 mt-4 group disabled:opacity-60"
              >
                <FaSave className="group-hover:scale-110 transition-transform" />
                <span className="tracking-widest">
                  {isSaving ? "SAVING..." : "SAVE INSPECTION"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
