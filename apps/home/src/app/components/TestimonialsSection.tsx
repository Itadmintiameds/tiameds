// 'use client';
// import { useEffect, useState } from 'react';

// const TestimonialsSection = () => {
//   const initialTestimonials = [
//     {
//       name: 'John Doe',
//       position: 'CEO, HealthTech Corp',
//       testimonial:
//         'Tiameds has revolutionized our healthcare management processes. Their SaaS solutions are efficient, secure, and have drastically reduced our operational costs.',
//       image: 'https://via.placeholder.com/150',
//     },
//     {
//       name: 'Jane Smith',
//       position: 'Product Manager, MediTech Solutions',
//       testimonial:
//         'The customer support and user experience of Tiameds software are second to none. The solutions provided have simplified complex processes and improved team collaboration.',
//       image: 'https://via.placeholder.com/150',
//     },
//     {
//       name: 'Michael Johnson',
//       position: 'Director of Operations, HealthFirst',
//       testimonial:
//         'Working with Tiameds has been an absolute game-changer. Their medical software solutions have made a profound impact on our patient care and internal workflows.',
//       image: 'https://via.placeholder.com/150',
//     },
//   ];

//   const [testimonials, setTestimonials] = useState(initialTestimonials);

//   // Shuffle testimonials for the center focus effect
//   interface Testimonial {
//     name: string;
//     position: string;
//     testimonial: string;
//     image: string;
//   }

//   const shuffleArray = (array: Testimonial[]): Testimonial[] => {
//     const shuffled = [...array];
//     for (let i = shuffled.length - 1; i > 0; i--) {
//       const j = Math.floor(Math.random() * (i + 1));
//       [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
//     }
//     return shuffled;
//   };

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setTestimonials((prevTestimonials) => shuffleArray(prevTestimonials));
//     }, 7000); // Shuffle every 7 seconds

//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <section className="relative bg-background py-12 px-4 sm:py-16 sm:px-6 lg:py-20 lg:px-8">
//       {/* Background Gradient */}
//       <div
//         aria-hidden="true"
//         className="absolute inset-x-0 top-0 -z-10 transform-gpu overflow-hidden blur-3xl"
//       >
//         <div
//           className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-secondary opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
//           style={{
//             clipPath:
//               'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
//           }}
//         ></div>
//       </div>

//       <div className="mx-auto max-w-4xl lg:max-w-6xl text-center">
//         <h2 className="text-2xl font-bold tracking-tight text-textdark sm:text-4xl animate-fade-in-up">
//           What Our Clients Say
//         </h2>
//         <p className="mt-4 sm:mt-6 text-base sm:text-lg text-textmuted animate-fade-in">
//           Hear from our satisfied clients who have experienced the transformation with Tiameds' cutting-edge healthcare solutions.
//         </p>
//       </div>

//       <div className="mt-10 sm:mt-12 lg:mt-16 grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3 justify-center items-stretch">
//         {testimonials.map((testimonial, index) => (
//           <div
//             key={index}
//             className={`relative group transition-all duration-700 ease-out flex flex-col items-center text-center p-6 bg-cardbackground shadow-lg rounded-lg bg-primary text-textwhite hover:scale-105 ${index === 1 ? 'lg:scale-110 shadow-2xl border border-primary z-10' : 'opacity-90 hover:opacity-100'
//               }`}
//             style={{ transformOrigin: 'center center' }}
//           >
//             <div className="absolute inset-0 transform transition-transform duration-500 ease-in-out group-hover:rotate-3 group-hover:scale-105"></div>
//             <img
//               src={testimonial.image}
//               alt={testimonial.name}
//               className={`${index === 1 ? 'w-24 h-24 sm:w-28 sm:h-28 mb-4 animate-bounce' : 'w-20 h-20 sm:w-24 sm:h-24 mb-4'
//                 } rounded-full border-4 border-primary object-cover shadow-md transition-transform duration-500 group-hover:scale-110`}
//             />
//             <p className="text-sm sm:text-lg font-semibold text-textwhite">{testimonial.name}</p>
//             <p className="text-xs sm:text-sm text-textwhite">{testimonial.position}</p>
//             <p className="mt-2 sm:mt-4 text-xs sm:text-base text-textwhite leading-relaxed">
//               {testimonial.testimonial}
//             </p>
//           </div>
//         ))}
//       </div>
//     </section>


//   );
// };

// export default TestimonialsSection;



"use client";
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
    }, 7000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative bg-background py-12 px-4 sm:py-16 sm:px-6 lg:py-20 lg:px-8">
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
        ></div>
      </div>

      <div className="mx-auto max-w-4xl lg:max-w-6xl text-center">
        <h2 className="text-2xl font-bold tracking-tight text-textdark sm:text-4xl animate-fade-in-up">
          What Our Clients Say
        </h2>
        <p className="mt-4 sm:mt-6 text-base sm:text-lg text-textmuted animate-fade-in">
          Hear from our satisfied clients who have experienced the transformation with Tiameds&apos; cutting-edge healthcare solutions.
        </p>
      </div>

      <div className="mt-10 sm:mt-12 lg:mt-16 grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3 items-stretch">
        {testimonials.map((testimonial, index) => (
          <div
            key={index}
            className={`relative group transition-all duration-700 ease-out flex flex-col items-center text-center p-6 bg-cardbackground shadow-lg rounded-lg bg-primary text-textwhite hover:scale-105 ${index === 1 ? 'lg:scale-110 shadow-2xl border border-primary z-10' : 'opacity-90 hover:opacity-100'}
              sm:rounded-xl`}
            style={{ transformOrigin: 'center center' }}
          >
            <div className="absolute inset-0 transform transition-transform duration-500 ease-in-out group-hover:rotate-3 group-hover:scale-105"></div>
            <img
              src={testimonial.image}
              alt={testimonial.name}
              className={`${index === 1 ? 'w-24 h-24 sm:w-28 sm:h-28 mb-4 animate-bounce' : 'w-20 h-20 sm:w-24 sm:h-24 mb-4'}
              rounded-full border-4 border-primary object-cover shadow-md transition-transform duration-500 group-hover:scale-110`}
            />
            <p className="text-sm sm:text-lg font-semibold text-textwhite">{testimonial.name}</p>
            <p className="text-xs sm:text-sm text-textwhite">{testimonial.position}</p>
            <p className="mt-2 sm:mt-4 text-xs sm:text-base text-textwhite leading-relaxed">
              {testimonial.testimonial}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TestimonialsSection;
