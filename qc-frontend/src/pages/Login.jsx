import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { useState } from "react";
import logo from "../assets/logo.png";
import API from "../api/api";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      alert("Email dan password wajib diisi");
      return;
    }

    try {
      setLoading(true);

      const response = await API.post("/login", {
        email: form.email,
        password: form.password,
      });

      console.log("LOGIN RESPONSE:", response.data);

      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      alert("Login berhasil!");
      navigate("/dashboard");
    } catch (err) {
      console.log("LOGIN ERROR:", err.response?.data || err);
      alert(err.response?.data?.detail || "Login gagal");
    } finally {
      setLoading(false);
    }
  };

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
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email"
                className="outline-none w-full text-sm"
              />
            </div>

            <div className="flex items-center border rounded px-3 py-2">
              <FaLock className="text-gray-400 mr-2" />
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Password"
                className="outline-none w-full text-sm"
              />
            </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="bg-slate-700 text-white w-full mt-5 py-2 rounded hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>

          <p className="text-xs mt-3">
            Don’t have an account?{" "}
            <span
              onClick={() => navigate("/register")}
              className="text-blue-500 cursor-pointer"
            >
              Register here
            </span>
          </p>
        </div>

        <div className="bg-slate-600 h-6"></div>
      </div>
    </div>
  );
}