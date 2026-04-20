import { useNavigate } from "react-router-dom";
import { FaUser, FaEnvelope, FaLock, FaUserTag } from "react-icons/fa";
import logo from "../assets/logo.png";
import API from "../api/api";
import { useState } from "react";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: ""
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async () => {
  try {
    const res = await API.post("/register", {
      full_name: form.name,
      email: form.email,
      password: form.password,
      role: form.role
    });

    console.log(res.data); 
    alert("Register berhasil!");
    navigate("/login");

  } catch (err) {
    console.log("ERROR:", err.response?.data); 
    alert("Register gagal");
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
          <h2 className="text-lg font-semibold">Register</h2>
          <p className="text-sm text-gray-500 mb-4">Create a new account</p>

          {/* INPUT */}
          <div className="space-y-3 text-left">

            <div className="flex items-center border rounded px-3 py-2">
              <FaUser className="text-gray-400 mr-2" />
              <input
                name="name"
                onChange={handleChange}
                placeholder="Full Name"
                className="outline-none w-full text-sm"
              />
            </div>

            <div className="flex items-center border rounded px-3 py-2">
              <FaEnvelope className="text-gray-400 mr-2" />
              <input
                name="email"
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
                onChange={handleChange}
                placeholder="Password"
                className="outline-none w-full text-sm"
              />
            </div>

            <div className="flex items-center border rounded px-3 py-2">
              <FaUserTag className="text-gray-400 mr-2" />
              <input
                name="role"
                onChange={handleChange}
                placeholder="Role"
                className="outline-none w-full text-sm"
              />
            </div>

          </div>

          {/* BUTTON */}
          <button
            onClick={handleRegister}
            className="bg-slate-700 text-white w-full mt-5 py-2 rounded hover:bg-slate-800"
          >
            Sign Up
          </button>

          <p className="text-xs mt-3">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-blue-500 cursor-pointer"
            >
              Login here
            </span>
          </p>
        </div>

        {/* FOOTER */}
        <div className="bg-slate-600 h-6"></div>
      </div>
    </div>
  );
}