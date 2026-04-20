import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock } from "react-icons/fa";
import logo from "../assets/logo.png";

export default function Login() {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex items-center justify-center bg-slate-800">
      
      <div className="bg-white w-[400px] rounded shadow overflow-hidden">
        
        {/* HEADER */}
        <div className="bg-slate-600 text-white p-4 flex items-center gap-2">
        <img src={logo} alt="logo" className="w-8 h-8 rounded-full" />          
        <span className="font-medium">Epson QC</span>
        </div>

        {/* CONTENT */}
        <div className="p-6 text-center">
          <h2 className="text-lg font-semibold">Login</h2>
          <p className="text-sm text-gray-500 mb-4">Login to your account</p>

          <div className="space-y-3 text-left">

            <div className="flex items-center border rounded px-3 py-2">
              <FaEnvelope className="text-gray-400 mr-2" />
              <input placeholder="Email" className="outline-none w-full text-sm" />
            </div>

            <div className="flex items-center border rounded px-3 py-2">
              <FaLock className="text-gray-400 mr-2" />
              <input type="password" placeholder="Password" className="outline-none w-full text-sm" />
            </div>

          </div>

          <button
            onClick={() => navigate("/dashboard")}
            className="bg-slate-700 text-white w-full mt-5 py-2 rounded hover:bg-slate-800"
          >
            Sign In
          </button>

          <p className="text-xs mt-3">
            Don’t have an account?{" "}
            <span onClick={() => navigate("/register")} className="text-blue-500 cursor-pointer">
              Register here
            </span>
          </p>
        </div>

        <div className="bg-slate-600 h-6"></div>
      </div>
    </div>
  );
}