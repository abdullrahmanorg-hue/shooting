import React, { useState } from "react";
import AboutHero from "../commponent/AboutHero";
import { useTranslation } from 'react-i18next';

export default function ContactPage() {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    name: "",
    shopName: "",
    address: "",
    phone: "",
    email: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Data:", formData);
    setSubmitted(true);
    // هنا ممكن تبعت البيانات لسيرفر أو API
  };

  return (
    <div className="max-w-3xl mx-auto p-12 bg-white shadow-lg rounded-lg mt-10 dark:bg-[#102c26]">
      <AboutHero />
      <h1 className="text-3xl pt-5 font-bold text-center mb-6 text-black dark:text-[#fff2e1]">
        {t("contactPageTitle")}
      </h1>

      {submitted ? (
        <div className="text-center p-6 bg-green-100 rounded dark:bg-black dark:text-[#fff2e1]">
          <h2 className="text-2xl font-semibold mb-2">{t("contactThanksTitle")}</h2>
          <p>{t("contactThanksDesc")}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium mb-1">{t("contactFullName")}</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-700"
              placeholder={t("contactFullNamePlaceholder")}
            />
          </div>

          <div>
            <label className="block font-medium mb-1">{t("contactShopName")}</label>
            <input
              type="text"
              name="shopName"
              value={formData.shopName}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-700"
              placeholder={t("contactShopNamePlaceholder")}
            />
          </div>

          <div>
            <label className="block font-medium mb-1">{t("contactAddress")}</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-700"
              placeholder={t("contactAddressPlaceholder")}
            />
          </div>

          <div>
            <label className="block font-medium mb-1">{t("contactPhone")}</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-700"
              placeholder={t("contactPhonePlaceholder")}
            />
          </div>

          <div>
            <label className="block font-medium mb-1">{t("contactEmail")}</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-700"
              placeholder={t("contactEmailPlaceholder")}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gray-500 text-white font-semibold py-2 rounded hover:bg-black transition dark:bg-[#fff2e1] dark:text-[#102c26] dark:hover:bg-gray-50"
          >
            {t("contactSubmit")}
          </button>
        </form>
      )}
    </div>
  );
}