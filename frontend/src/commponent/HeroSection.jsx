import React, { useCallback, useEffect, useMemo, useState } from "react";
import hero2 from "../assets/hero2.jpg";
import hero22 from "../assets/hero22.jpg";
import hero4 from "../assets/hero4.jpg";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Autoplay, Pagination } from "swiper/modules";
import { useTranslation } from "react-i18next";

const HERO_CONFIG_UPDATED_EVENT = "heroConfigUpdated";
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const getDefaultConfig = (t) => ({
  marquee:
    t("heroMarquee") || "✨ Discover Your Style — Shine Like a Shooting Star",
  slides: [
    { image: hero2, alt: t("hero2Alt") || "Hero 1" },
    { image: hero22, alt: t("hero22Alt") || "Hero 2" },
    { image: hero4, alt: t("hero4Alt") || "Hero 3" },
  ],
});

export default function HeroSection() {
  const { t } = useTranslation();
  const [config, setConfig] = useState(() => getDefaultConfig(t));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchConfig = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch(`${API_BASE}/api/hero`);
      if (!res.ok) throw new Error("Failed to load hero");
      const data = await res.json();
      setConfig({
        marquee: data.marquee || getDefaultConfig(t).marquee,
        slides: (data.slides || []).length
          ? data.slides.map((s) => ({
              image: s.image || "",
              alt: s.alt || "",
            }))
          : getDefaultConfig(t).slides,
      });
    } catch (err) {
      console.warn("Hero config fetch failed, using defaults", err);
      setError(err.message);
      setConfig(getDefaultConfig(t));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  useEffect(() => {
    const onHeroUpdated = () => fetchConfig();
    window.addEventListener(HERO_CONFIG_UPDATED_EVENT, onHeroUpdated);
    return () =>
      window.removeEventListener(HERO_CONFIG_UPDATED_EVENT, onHeroUpdated);
  }, [fetchConfig]);

  const slides = useMemo(() => {
    const list = config.slides || [];
    const withImages = list.filter((s) => s && s.image);
    return withImages.length > 0 ? withImages : getDefaultConfig(t).slides;
  }, [config.slides, t]);

  if (loading) {
    return (
      <div className="h-dvh bg-gray-300 dark:bg-black flex items-center justify-center">
        <span className="text-gray-500 dark:text-gray-400">Loading…</span>
      </div>
    );
  }

  return (
    <div className="">
      <div className="h-dvh bg-gray-300 dark:bg-black">
        <Swiper
          modules={[Autoplay, Pagination]}
          autoplay={{ delay: 5000 }}
          pagination={{ clickable: true }}
          loop={true}
          className="w-full h-full"
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={index} className="flex justify-between">
              <img
                src={slide.image}
                alt={slide.alt || "Hero slide"}
                className="w-full h-full object-cover"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <marquee
        behavior=""
        direction=""
        className="bg-black text-white p-3 font-semibold dark:text-[#fff2e1]"
      >
        <span>{config.marquee}</span>
        <span>{config.marquee}</span>
        <span>{config.marquee}</span>
        <span>{config.marquee}</span>
      </marquee>
    </div>
  );
}
