import { useEffect, useState } from "react";
import axios from "axios";

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    axios.get("/api/customers").then(res => setCustomers(res.data));
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Customers</h2>

      <table className="w-full bg-white dark:bg-gray-800 rounded-xl">
        <thead>
          <tr>
            <th>Name</th>
            <th>Shop</th>
            <th>Phone</th>
          </tr>
        </thead>
        <tbody>
          {customers.map(c => (
            <tr key={c._id}>
              <td>{c.name}</td>
              <td>{c.shopName}</td>
              <td>{c.phone}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}