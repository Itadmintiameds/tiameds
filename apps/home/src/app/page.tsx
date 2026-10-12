import About from './components/AboutSection'
import ContactUsSection from './components/ContactUsSection'
import DemoTrialSection from './components/DemoTrialSection'
import EcosystemSection from './components/EcosystemSection'
import Herosection from './components/Herosection'

// Header and footer now live in the root layout.
const page = () => {
  return (
    <>
      <Herosection />
      <About />
      <DemoTrialSection />
      <EcosystemSection />
      <ContactUsSection />
    </>
  )
}

export default page
