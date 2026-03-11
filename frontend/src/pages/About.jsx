import React from 'react'
import AboutHero from '../commponent/AboutHero'
import AboutIntro from '../commponent/AboutIntro'
import OurMission from '../commponent/OurMission'
import ProductionProcess from '../commponent/ProductionProcess'
import WhyChooseUs from '../commponent/WhyChooseUs'
import FactoryStats from '../commponent/FactoryStats'
import AboutCTA from '../commponent/AboutCTA'

export default function About() {
  return (
    <div>
      <AboutHero/>
      <AboutIntro/>
      <OurMission/>
      <ProductionProcess/>
      <WhyChooseUs/>
      <FactoryStats/>
      <AboutCTA/>
    </div>
  )
}
