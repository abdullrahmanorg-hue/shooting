import { useEffect, useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";

const API_BASE = import.meta.env.VITE_API_URL || "https://shootingstar-two.vercel.app";

export default function CustomersPage() {
  const { t } = useTranslation();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");

  useEffect(() => { fetchCustomers(); }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_BASE}/api/customers`, {
        withCredentials: true,
      });
      setCustomers(data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || t("failedToLoadCustomers"));
      console.error("Error fetching customers:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t("loadingCustomers")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">

      {/* ── Header ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
            {t("customers")}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {customers.length > 0 && `${customers.length} ${t("customers")}`}
          </p>
        </div>
        <button
          onClick={fetchCustomers}
          className="w-full sm:w-auto px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition dark:bg-blue-600 dark:hover:bg-blue-700"
        >
          {t("refresh")}
        </button>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="p-4 mb-4 bg-red-100 text-red-700 rounded-lg dark:bg-red-900/40 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* ── Empty ── */}
      {customers.length === 0 ? (
        <div className="text-center p-12 bg-white dark:bg-gray-800 rounded-xl shadow">
          <p className="text-gray-400 dark:text-gray-500 text-sm">
            {t("noCustomers")}
          </p>
        </div>
      ) : (
        <>
          {/* ── Desktop Table (md+) ── */}
          <div className="hidden md:block bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-175">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                  <tr>
                    {[
                      t("name"),
                      t("shopName"),
                      t("email"),
                      t("phone"),
                      t("address"),
                      t("submitted"),
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {customers.map((c) => (
                    <tr
                      key={c._id}
                      className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                    >
                      <td className="px-5 py-4 font-medium text-gray-800 dark:text-gray-100">
                        {c.name}
                      </td>
                      <td className="px-5 py-4 text-gray-600 dark:text-gray-300">
                        {c.shopName}
                      </td>
                      <td className="px-5 py-4 text-blue-600 dark:text-blue-400 text-sm">
                        <a href={`mailto:${c.email}`} className="hover:underline">
                          {c.email}
                        </a>
                      </td>
                      <td className="px-5 py-4 text-gray-600 dark:text-gray-300 text-sm">
                        {c.phone}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-45 truncate">
                        {c.address}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Mobile Cards (below md) ── */}
          <div className="md:hidden flex flex-col gap-3">
            {customers.map((c) => (
              <div
                key={c._id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex flex-col gap-2"
              >
                {/* Name + date */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-white">
                      {c.name}
                    </p>
                    {c.shopName && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        🏪 {c.shopName}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Divider */}
                <div className="border-t dark:border-gray-700" />

                {/* Details */}
                <div className="grid grid-cols-1 gap-1.5 text-sm">
                  <a
                    href={`mailto:${c.email}`}
                    className="text-blue-600 dark:text-blue-400 hover:underline truncate"
                  >
                    ✉️ {c.email}
                  </a>
                  <p className="text-gray-600 dark:text-gray-300">
                    📞 {c.phone}
                  </p>
                  {c.address && (
                    <p className="text-gray-500 dark:text-gray-400 text-xs">
                      📍 {c.address}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}