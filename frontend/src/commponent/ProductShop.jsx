import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { Navigate, useNavigate } from "react-router-dom";

export default function ProductShop() {
  const { t } = useTranslation();
  const [productsData, setProductsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState("All");
  const Navigate = useNavigate(); 

  const API_BASE = "http://localhost:5000";

  const getImageSrc = (img) => {
    if (!img) return "";
    if (img.startsWith("http")) return img;
    return `${API_BASE}${img}`;
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/products");
      setProductsData(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load products");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Get unique categories from products
  const categories = [
    "All",
    ...new Set(productsData.map((product) => product.category).filter(Boolean)),
  ];

  const filteredProducts =
    selectedCategory === "All"
      ? productsData
      : productsData.filter((product) => product.category === selectedCategory);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-800 dark:text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto mb-4"></div>
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-800 dark:text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-800 dark:text-white transition-all duration-500">
      {/* Header */}
      <div className="text-center py-16">
        <h1 className="text-4xl font-bold mb-4">{t("shopCollection")}</h1>
        <p className="text-gray-500 dark:text-gray-400">{t("shopDesc")}</p>
      </div>

      {/* Categories */}
      <div className="flex justify-center gap-4 mb-12 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-5 py-2 rounded-full border transition 
              ${
                selectedCategory === cat
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
              }`}
          >
            {t(cat)}
          </button>
        ))}
      </div>

      {/* Products */}
      <div className="max-w-7xl mx-auto px-6 pb-20 grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {selectedCategory === "All"
                ? "No products available"
                : `No products in ${selectedCategory} category`}
            </p>
          </div>
        ) : (
          filteredProducts.map((product) => (
            <div
              key={product._id || product.id}
              className="group bg-white dark:bg-[#102c26] rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition duration-500"
            >
              <div className="overflow-hidden">
                <img
                  src={getImageSrc(product.img || product.image)}
                  alt={product.title || product.name}
                  className="h-64 w-full object-cover group-hover:scale-110 transition duration-500"
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/400x400?text=No+Image";
                  }}
                />
              </div>

              <div className="p-4">
                <h2 className="font-semibold text-lg mb-2">
                  {product.title || product.name}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mb-2">
                  {product.category}
                </p>
                {!product.availability && (
                  <p className="text-red-500 text-sm mb-2">Out of Stock</p>
                )}
                

                <button 
                    onClick={()=> Navigate("./contact")}
                  className={`w-full py-2 font-bold rounded-lg hover:scale-105 transition ${
                    product.availability !== false
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "bg-gray-400 text-gray-600 cursor-not-allowed"
                  }`}
                  disabled={product.availability === false}
                  >
                  {product.availability !== false
                    ? t("Contact Me")
                    : "Out of Stock"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
