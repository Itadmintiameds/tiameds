import React from 'react';
import {
  Herosection, FeaturesSection,
  CTASection, TestimonialsSection,
  Footer,
} from './components/Component';

import AboutSection from './components/AboutSection';
import FAQSection from './components/FAQSection';
import ContactSection from './components/ContactSection';
import PartnersSection from './components/PartnersSection';

import Header from './components/Header';

type NavigationItem = {
  name: string;
  href: string;
};

const navigation: NavigationItem[] = [
  { name: 'Features', href: '#features' },
  { name: 'Support', href: '#support' },
  { name: 'Testimonials', href: '#testimonials' },
  { name: 'FAQ', href: '#faq' },
  { name: 'Contact', href: '#contact' },
  { name: 'Partners', href: '#partners' },
];

const Page = () => {
  return (
    <>
      <Header navigation={navigation} />
      <Herosection />
      <div id="features">
        <FeaturesSection />
      </div>
      <AboutSection />

      <div id="support">
        <CTASection />
      </div>
      <div id="testimonials">
        <TestimonialsSection />
      </div>
      <div id="faq">
        <FAQSection />
      </div>
      <div id="contact">
        <ContactSection />
      </div>
      <div id="partners">
        <PartnersSection />
      </div>
      <Footer />
    </>
  );
};

export default Page;
