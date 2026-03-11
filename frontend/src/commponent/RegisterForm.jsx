import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function RegisterForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (!form.name.trim()) {
      return "Please enter your name";
    }
    if (!form.email.includes("@")) {
      return "Please enter a valid email";
    }
    if (form.password.length < 6) {
      return "Password must be at least 6 characters";
    }
    if (form.password !== form.confirmPassword) {
      return "Passwords do not match";
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Registration failed");
      }

      setLoading(false);

      Swal.fire({
        position: "top",
        icon: "success",
        title: "Registration Successful",
        text: "Please login with your credentials",
        showConfirmButton: false,
        timer: 2000,
      });

      // Redirect to login page
      navigate("/login");
    } catch (err) {
      setLoading(false);
      setError(err.message || "Something went wrong");
    }
  };

  return (
    <div className="flex items-center justify-center p-8 bg-gray-50 dark:bg-black dark:text-[#fff2e1]">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg dark:bg-[#102c26]">
        <h2 className="text-2xl font-semibold mb-6 text-center">Register</h2>

        {error && (
          <div className="bg-red-100 text-red-600 p-3 mb-4 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-2 text-sm font-medium hover:scale-105">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium hover:scale-105">
              Email
            </label>
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
            <label className="block mb-2 text-sm font-medium hover:scale-105">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="******"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium hover:scale-105">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
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
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>

        <p className="text-sm text-center mt-6 text-gray-500">
          Already have an account?{" "}
          <Link to="/login">
            <span className="text-green-500 cursor-pointer">Login</span>
          </Link>
        </p>
      </div>
    </div>
  );
}
