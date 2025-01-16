'use client';
import { useEffect, useState } from 'react';

const TestimonialsSection = () => {
  const initialTestimonials = [
    {
      name: 'John Doe',
      position: 'CEO, HealthTech Corp',
      testimonial:
        'Tiameds has revolutionized our healthcare management processes. Their SaaS solutions are efficient, secure, and have drastically reduced our operational costs.',
      image: 'https://via.placeholder.com/150',
    },
    {
      name: 'Jane Smith',
      position: 'Product Manager, MediTech Solutions',
      testimonial:
        'The customer support and user experience of Tiameds software are second to none. The solutions provided have simplified complex processes and improved team collaboration.',
      image: 'https://via.placeholder.com/150',
    },
    {
      name: 'Michael Johnson',
      position: 'Director of Operations, HealthFirst',
      testimonial:
        'Working with Tiameds has been an absolute game-changer. Their medical software solutions have made a profound impact on our patient care and internal workflows.',
      image: 'https://via.placeholder.com/150',
    },
  ];

  const [testimonials, setTestimonials] = useState(initialTestimonials);

  // Shuffle testimonials for the center focus effect
  interface Testimonial {
    name: string;
    position: string;
    testimonial: string;
    image: string;
  }

  const shuffleArray = (array: Testimonial[]): Testimonial[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTestimonials((prevTestimonials) => shuffleArray(prevTestimonials));
    }, 7000); // Shuffle every 7 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative bg-background py-20 px-6 lg:py-28 lg:px-8">
      {/* Background Gradient */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 -z-10 transform-gpu overflow-hidden blur-3xl"
      >
        <div
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-secondary opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
        />
      </div>

      <div className="mx-auto max-w-6xl text-center">
        <h2 className="text-4xl font-bold tracking-tight text-textdark sm:text-5xl animate-fade-in-up">
          What Our Clients Say
        </h2>
        <p className="mt-6 text-lg text-textmuted animate-fade-in">
          Hear from our satisfied clients who have experienced the transformation with Tiameds&apos; cutting-edge healthcare solutions.
        </p>
      </div>

      <div className="mt-16 flex justify-center items-center gap-8">
        {testimonials.map((testimonial, index) => (
          <div
            key={index}
            className={`relative group transition-all duration-700 ease-out  ${
              index === 1
                ? 'lg:w-1/3 scale-110 shadow-2xl border border-primary z-10 hover:scale-115'
                : 'lg:w-1/4 scale-95 opacity-75 hover:opacity-100 hover:scale-105'
            } flex flex-col items-center text-center p-6 bg-cardbackground shadow-lg rounded-lg bg-primary text-textwhite `}
            style={{
              transformOrigin: 'center center',
            }}
          >
            {/* Animation on hover */}
            <div className="absolute inset-0 transform transition-transform duration-500 ease-in-out group-hover:rotate-[5deg] group-hover:scale-110"></div>
            <img
              src={testimonial.image}
              alt={testimonial.name}
              className={`${
                index === 1 ? 'w-32 h-32 mb-6 animate-bounce' : 'w-24 h-24 mb-4'
              } rounded-full border-4 border-primary object-cover shadow-md transition-transform duration-500 group-hover:scale-110 `}
            />
            <p className="text-lg font-semibold text-textwhite">{testimonial.name}</p>
            <p className="text-sm text-textmuted">{testimonial.position}</p>
            <p className="mt-4 text-base text-textwhite leading-relaxed">
              {testimonial.testimonial}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TestimonialsSection;
