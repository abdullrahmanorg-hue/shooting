import { useEffect, useState } from "react";
import axios from "axios";

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/customers`,
        {
          withCredentials: true,
        },
      );
      setCustomers(response.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load customers");
      console.error("Error fetching customers:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center p-6">
        <p className="text-gray-500 dark:text-gray-400">Loading customers...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold dark:text-white">Customers</h2>
        <button
          onClick={fetchCustomers}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition dark:bg-blue-600 dark:hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 mb-4 bg-red-100 text-red-700 rounded dark:bg-red-900 dark:text-red-200">
          {error}
        </div>
      )}

      {customers.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg dark:bg-gray-800">
          <p className="text-gray-500 dark:text-gray-400">No customers yet</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-xl shadow">
          <table className="w-full">
            <thead className="bg-gray-100 dark:bg-gray-700 border-b dark:border-gray-600">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Shop Name
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Address
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Submitted
                </th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr
                  key={c._id}
                  className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  <td className="px-6 py-4">{c.name}</td>
                  <td className="px-6 py-4">{c.shopName}</td>
                  <td className="px-6 py-4 text-blue-600 dark:text-blue-400">
                    {c.email}
                  </td>
                  <td className="px-6 py-4">{c.phone}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {c.address}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
