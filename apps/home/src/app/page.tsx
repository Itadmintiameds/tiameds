import React from 'react'
import Herosection from './components/Herosection'
import HeaderNav from './components/HeaderNav'
import About from './components/AboutSection'
import ProductFeatures from './components/ProductFeatures'
import SolutionsSection from './components/SolutionsSection'
import TestimonialsSection from './components/TestimonialsSection'
import CaseStudiesSection from './components/CaseStudiesSection'
import DemoTrialSection from './components/DemoTrialSection'
import BlogInsightsSection from './components/BlogInsightsSection'
import ContactUsSection from './components/ContactUsSection'
import FooterSection from './components/FooterSection'

const page = () => {
  return (
    <>
      <HeaderNav />
      <Herosection />
      <About />
      <ProductFeatures />
      <SolutionsSection />
      <TestimonialsSection />
      <CaseStudiesSection />
      <DemoTrialSection />
      <BlogInsightsSection />
      <ContactUsSection />
      <FooterSection />
    </>
  )
}

export default page