import React from 'react';
import { useTranslation } from 'react-i18next';

export default function HeroShop() {
  const { t } = useTranslation();

  return (
    <div
      className="h-[60vh] bg-cover bg-center flex items-center justify-center"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1541099649105-f69ad21f3246')",
      }}
    >
      <div className="text-center text-white">
        <h2 className="text-5xl font-bold mb-4 tracking-wide">
          {t("newSeason")}
        </h2>
        <p className="uppercase tracking-widest text-sm">
          {t("discoverCollection")}
        </p>
      </div>
    </div>
  );
}