import { useEffect, useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { FiUsers, FiBox, FiLayers, FiRefreshCw } from "react-icons/fi";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Dashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState({ products: 0, customers: 0, categories: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStats = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.get(`${API_BASE}/api/admin/stats`, {
        withCredentials: true, // حرج جداً لأن الـ API محمي بـ requireAdmin
      });
      setStats(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load real-time stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  if (loading) {
    return <div className="p-6 text-gray-500 animate-pulse">Loading real-time data...</div>;
  }

  const cards = [
    { title: t("products"), value: stats.products, icon: <FiBox className="text-blue-500 text-3xl" /> },
    { title: t("customers"), value: stats.customers, icon: <FiUsers className="text-green-500 text-3xl" /> },
    { title: t("categories"), value: stats.categories, icon: <FiLayers className="text-purple-500 text-3xl" /> },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold dark:text-white">Admin Dashboard</h1>
        <button onClick={fetchStats} className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 dark:text-white rounded-lg text-sm">
          <FiRefreshCw /> Refresh
        </button>
      </div>

      {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>}

      <div className="grid md:grid-cols-3 gap-6">
        {cards.map((card, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm flex items-center justify-between border dark:border-gray-700">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{card.title}</p>
              <p className="text-3xl font-bold mt-1 dark:text-white">{card.value}</p>
            </div>
            {card.icon}
          </div>
        ))}
      </div>
    </div>
  );
}