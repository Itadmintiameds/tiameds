import About from './components/AboutSection'
import ContactUsSection from './components/ContactUsSection'
import DemoTrialSection from './components/DemoTrialSection'
import FooterSection from './components/FooterSection'
import HeaderNav from './components/HeaderNav'
import Herosection from './components/Herosection'

const page = () => {
  return (
    <>
      <HeaderNav />
      <Herosection />
      <About />
      {/* <ProductFeatures /> */}
      {/* <SolutionsSection /> */}
      {/* <TestimonialsSection />
      // <CaseStudiesSection /> */}
      <DemoTrialSection />
      {/* <BlogInsightsSection /> */}
      <ContactUsSection />
      <FooterSection />
    </>
  )
}

export default page