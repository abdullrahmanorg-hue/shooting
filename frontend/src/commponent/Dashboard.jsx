import { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard() {
  const [stats, setStats] = useState({});

  useEffect(() => {
    axios.get("/api/admin/stats").then(res => setStats(res.data));
  }, []);

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
        <h3>Products</h3>
        <p className="text-2xl font-bold">{stats.products}</p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
        <h3>Customers</h3>
        <p className="text-2xl font-bold">{stats.customers}</p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
        <h3>Categories</h3>
        <p className="text-2xl font-bold">{stats.categories}</p>
      </div>
    </div>
  );
}