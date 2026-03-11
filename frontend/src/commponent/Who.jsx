import React from 'react';
import { useTranslation } from 'react-i18next';

export default function Who() {
  const { t } = useTranslation();

  return (
    <div>
      {/* Why Us */}
      <div className="py-20 bg-gray-100 dark:bg-black">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10 text-center px-6">

          <div className="p-6">
            <h3 className="text-xl font-semibold mb-3">{t("freeShipping")}</h3>
            <p className="text-gray-500 dark:text-gray-400">
              {t("freeShippingDesc")}
            </p>
          </div>

          <div className="p-6">
            <h3 className="text-xl font-semibold mb-3">{t("securePayment")}</h3>
            <p className="text-gray-500 dark:text-gray-400">
              {t("securePaymentDesc")}
            </p>
          </div>

          <div className="p-6">
            <h3 className="text-xl font-semibold mb-3">{t("easyReturns")}</h3>
            <p className="text-gray-500 dark:text-gray-400">
              {t("easyReturnsDesc")}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}