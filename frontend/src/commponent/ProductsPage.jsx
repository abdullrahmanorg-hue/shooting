import { useEffect, useState } from "react";
import axios from "axios";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    id: "",
    category: "",
    img: "",
    title: "",
    availability: true,
  });

  const fetchProducts = () => {
    axios
      .get("http://localhost:5000/api/products", { withCredentials: true })
      .then((res) => setProducts(res.data))
      .catch((error) => console.error("Error fetching products:", error));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete product?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/products/${id}`, {
        withCredentials: true,
      });
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const resetForm = () => {
    setFormData({
      id: "",
      category: "",
      img: "",
      title: "",
      availability: true,
    });
    setEditingProduct(null);
    setShowAddForm(false);
  };

  const addProduct = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/products", formData, {
        withCredentials: true,
      });
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error("Error adding product:", error);
      alert(error.response?.data?.message || "Failed to add product");
    }
  };

  const updateProduct = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://localhost:5000/api/products/${editingProduct._id}`,
        formData,
        { withCredentials: true },
      );
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error("Error updating product:", error);
      alert(error.response?.data?.message || "Failed to update product");
    }
  };

  const startEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      id: product.id || "",
      category: product.category || "",
      img: product.img || "",
      title: product.title || "",
      availability:
        product.availability !== undefined ? product.availability : true,
    });
    setShowAddForm(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Products Management
        </h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
        >
          {showAddForm
            ? "Cancel"
            : editingProduct
              ? "Cancel Edit"
              : "Add Product"}
        </button>
      </div>

      {showAddForm && (
        <form
          onSubmit={editingProduct ? updateProduct : addProduct}
          className="bg-gray-100 dark:bg-gray-700 p-6 rounded-lg mb-6"
        >
          <h3 className="text-lg font-semibold mb-4">
            {editingProduct ? "Edit Product" : "Add New Product"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block mb-2 text-sm font-medium">ID</label>
              <input
                type="text"
                name="id"
                value={formData.id}
                onChange={handleInputChange}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 dark:bg-gray-600 dark:border-gray-500"
                required
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium">Category</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 dark:bg-gray-600 dark:border-gray-500"
                required
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium">
                Image URL
              </label>
              <input
                type="url"
                name="img"
                value={formData.img}
                onChange={handleInputChange}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 dark:bg-gray-600 dark:border-gray-500"
                required
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 dark:bg-gray-600 dark:border-gray-500"
                required
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="availability"
                checked={formData.availability}
                onChange={handleInputChange}
                className="mr-2"
              />
              <span className="text-sm font-medium">Available</span>
            </label>
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            {editingProduct ? "Update Product" : "Add Product"}
          </button>
        </form>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="p-4 text-left font-semibold">ID</th>
              <th className="p-4 text-left font-semibold">Title</th>
              <th className="p-4 text-left font-semibold">Category</th>
              <th className="p-4 text-left font-semibold">Image</th>
              <th className="p-4 text-left font-semibold">Availability</th>
              <th className="p-4 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr
                key={p._id || p.id}
                className="border-t border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <td className="p-4">{p.id || p._id}</td>
                <td className="p-4 font-medium">{p.title || p.name}</td>
                <td className="p-4">{p.category}</td>
                <td className="p-4">
                  {p.img && (
                    <img
                      src={p.img}
                      alt={p.title || p.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                </td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      p.availability
                        ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                        : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                    }`}
                  >
                    {p.availability ? "Available" : "Unavailable"}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => startEdit(p)}
                      className="text-blue-500 hover:text-blue-700 font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteProduct(p._id || p.id)}
                      className="text-red-500 hover:text-red-700 font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            No products found. Click "Add Product" to create your first product.
          </div>
        )}
      </div>
    </div>
  );
}
