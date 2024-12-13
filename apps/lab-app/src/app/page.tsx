import React from 'react';
import {
  Herosection, FeaturesSection,
  CTASection, TestimonialsSection,
  Footer
} from './components/Component';

type NavigationItem = {
  name: string;
  href: string;
};

const navigation: NavigationItem[] = [
  { name: 'Features', href: '#features' },
  // { name: 'Pricing', href: '#pricing' },
  { name: 'Support', href: '#support' },
  { name: 'Testimonials', href: '#testimonials' },
];

const Page = () => {
  return (
    <>
      <Herosection navigation={navigation} />
      <div id="features">
        <FeaturesSection />
      </div>
      {/* <div id="pricing">
        <PricingSection />
      </div> */}
      <div id="support">
        <CTASection />
      </div>
      <div id="testimonials"> 
        <TestimonialsSection />
      </div>
      <Footer />
    </>
  );
};

export default Page;
