import React from 'react'
import hero1 from '../assets/hero1.png'
import hero2 from '../assets/hero2.jpg'
import hero22 from '../assets/hero22.jpg'
import hero4 from '../assets/hero4.jpg'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import 'swiper/css/pagination'
import { Autoplay, Pagination } from 'swiper/modules'
import { useTranslation } from 'react-i18next'
import i18n from '../pages/i18n'

export default function HeroSection() {
  const { t } = useTranslation();

  return (
    <div className=''>
      <div className="h-dvh bg-gray-300 dark:bg-black">
        <Swiper
          modules={[Autoplay, Pagination]}
          autoplay={{ delay: 5000 }}
          pagination={{ clickable: true }}
          loop={true}
          className="w-full h-full"
        >
          <SwiperSlide className='flex justify-between '>
            <img
              src={hero2}
              alt={t("hero2Alt")}
              className="w-[50%] h-full object-cover"
            />

          </SwiperSlide>

          <SwiperSlide>
            <img
              src={hero22}
              alt={t("hero22Alt")}
              className="w-1/2 h-full object-cover"
            />

          </SwiperSlide>

          <SwiperSlide>
            <img
              src={hero4}
              alt={t("hero4Alt")}
              className="w-full h-full object-contain"
            />

          </SwiperSlide>
        </Swiper>
      </div>

      <marquee behavior="" direction="" className="bg-black text-white p-3 font-semibold dark:text-[#fff2e1]">
        <span>{t("heroMarquee")}</span>
        <span>{t("heroMarquee")}</span>
        <span>{t("heroMarquee")}</span>
        <span>{t("heroMarquee")}</span>
      </marquee>
    </div>
  )
}