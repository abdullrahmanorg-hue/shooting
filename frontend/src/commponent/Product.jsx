import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Product({ addToCart }) {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get("https://fakestoreapi.com/products")
      .then(res => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError("Failed to load products");
        setLoading(false);
      });
  }, []);

  if (loading) return <h2 className="text-center p-10">{t("loading")}</h2>;
  if (error) return <h2 className="text-center p-10 text-red-500">{t("error")}</h2>;

  return (
    <div className="max-w-7xl mx-auto px-6 pb-20 grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 ">
      {products.map(product => (
        <div
          key={product.id}
          className="group h-100 bg-white dark:bg-[#102c26] dark:text-[#f7e7ce] rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition duration-500 relative"
        >
          <div className="overflow-hidden w-full h-[50%]">
            <img
              src={product.image}
              alt={product.title}
              className="h-64 w-full  group-hover:scale-110 transition duration-500 object-contain"
            />
          </div>

          <div className="p-4 bottom-1.5 absolute w-full ">
            <h2 className="font-semibold text-lg mb-2 ">{product.title}</h2>

            <Link to="./contact  ">
              <button className="w-full py-2 bg-black text-white dark:bg-[#f7e7ce] dark:text-[#102c26] font-bold rounded-lg hover:scale-105 transition  ">
                {t("contactMe")}
              </button>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}