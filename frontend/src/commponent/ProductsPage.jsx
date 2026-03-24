import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:5000";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const [formData, setFormData] = useState({
    id: "",
    category: "",
    title: "",
    availability: true,
    img: "", // keep this only for preview/edit existing image path
  });

  const fetchProducts = () => {
    axios
      .get(`${API_BASE}/api/products`, { withCredentials: true })
      .then((res) => setProducts(res.data))
      .catch((error) => console.error("Error fetching products:", error));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = products.filter((p) => {
    const query = filterText.trim().toLowerCase();
    if (!query) return true;
    return (
      (p.title || "").toLowerCase().includes(query) ||
      (p.category || "").toLowerCase().includes(query) ||
      (p.id || "").toString().toLowerCase().includes(query)
    );
  });

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete product?")) return;
    try {
      await axios.delete(`${API_BASE}/api/products/${id}`, {
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
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
  };

  const resetForm = () => {
    setFormData({
      id: "",
      category: "",
      title: "",
      availability: true,
      img: "",
    });
    setImageFile(null);
    setEditingProduct(null);
    setShowAddForm(false);
  };

  const buildPayload = () => {
    const data = new FormData();
    data.append("id", formData.id);
    data.append("category", formData.category);
    data.append("title", formData.title);
    data.append("availability", String(formData.availability));

    if (imageFile) {
      data.append("image", imageFile); // must match upload.single("image")
    }

    return data;
  };

  const addProduct = async (e) => {
    e.preventDefault();

    if (!imageFile) {
      alert("Please choose an image from your device");
      return;
    }

    try {
      await axios.post(`${API_BASE}/api/products`, buildPayload(), {
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
        `${API_BASE}/api/products/${editingProduct._id}`,
        buildPayload(),
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
    setImageFile(null);
    setFormData({
      id: product.id || "",
      category: product.category || "",
      title: product.title || "",
      availability:
        product.availability !== undefined ? product.availability : true,
      img: product.img || "",
    });
    setShowAddForm(true);
  };

  const getImageSrc = (img) => {
    if (!img) return "";
    if (img.startsWith("http")) return img;
    return `${API_BASE}${img}`;
  };

  return (
    <div className="p-6 ">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6 ">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Products Management
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Manage your product catalog, update inventory and preview changes
            instantly.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative">
            <input
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Search by title, category or ID"
              className="w-full max-w-xs rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm shadow-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            />
            {filterText && (
              <button
                onClick={() => setFilterText("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                ✕
              </button>
            )}
          </div>

          <button
            onClick={() => {
              if (showAddForm) {
                resetForm();
              } else {
                setEditingProduct(null);
                setShowAddForm(true);
              }
            }}
            className="inline-flex items-center justify-center rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700"
          >
            {showAddForm
              ? "Cancel"
              : editingProduct
                ? "Cancel Edit"
                : "Add Product"}
          </button>
        </div>
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

            <div>
              <label className="block mb-2 text-sm font-medium">
                Product Image
              </label>
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 dark:bg-gray-600 dark:border-gray-500"
                required={!editingProduct}
              />
            </div>
          </div>

          {(imageFile || formData.img) && (
            <div className="mb-4">
              <p className="text-sm font-medium mb-2">Preview</p>
              <img
                src={
                  imageFile
                    ? URL.createObjectURL(imageFile)
                    : getImageSrc(formData.img)
                }
                alt="Preview"
                className="w-24 h-24 object-cover rounded border"
              />
            </div>
          )}

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

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden ">
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
            {filteredProducts.map((p) => (
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
                      src={getImageSrc(p.img)}
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

        {filteredProducts.length === 0 && (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            {products.length === 0 ? (
              <>
                No products yet. Click "Add Product" to create your first
                product.
              </>
            ) : (
              <>No products match your search query.</>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
