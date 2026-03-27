import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function LoginForm({ setUser }) {
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (!form.email.includes("@")) return "Please enter a valid email";
    if (form.password.length < 6) return "Password must be at least 6 characters";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setError("");
    setLoading(true);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      // ✅ الباك بيرجع { message, role, name } مش { user: {...} }
      const user = { role: data.role, name: data.name };
      setUser(user);
      setLoading(false);

      Swal.fire({
        position: "top",
        icon: "success",
        title: `Login Successful (${data.role})`,
        showConfirmButton: false,
        timer: 1500,
      });

      if (data.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err) {
      setLoading(false);
      setError(err.message || "Something went wrong");
    }
  };

  return (
    <div className="flex items-center justify-center p-8 bg-gray-50 dark:bg-black dark:text-[#fff2e1]">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg dark:bg-[#102c26]">
        <h2 className="text-2xl font-semibold mb-6 text-center">Login</h2>

        {error && (
          <div className="bg-red-100 text-red-600 p-3 mb-4 rounded">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-2 text-sm font-medium hover:scale-105">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="example@email.com"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium hover:scale-105">Password</label>
            <input
              type="password"
              name="password"
              value={form.value}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="******"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-500 text-white py-3 rounded-lg hover:bg-green-500 transition disabled:opacity-50 dark:bg-[#fff2e1] dark:text-[#102c26] font-bold"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="text-sm text-center mt-6 text-gray-500">
          Don't have an account?{" "}
          <Link to="/register" className="hover:underline">
            <span className="text-green-500 cursor-pointer">Register</span>
          </Link>
        </p>
      </div>
    </div>
  );
}