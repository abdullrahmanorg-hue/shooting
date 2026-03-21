import React from "react";
import HeroSection from "../commponent/HeroSection";
import Footer from "../commponent/Footer";
import ProductShop from '../commponent/ProductShop'
export default function Home() {
  return (
    <div>
      <HeroSection />
      <ProductShop/>
      <Footer />
    </div>
  );
}
