
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
            className={`relative group transition-all duration-700 ease-out flex flex-col items-center text-center p-6 bg-cardbackground shadow-lg rounded-lg bg-background text-textwhite hover:scale-105 ${index === 1 ? 'lg:scale-110 shadow-2xl border border-primary z-10' : 'opacity-90 hover:opacity-100'}
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
            <p className="text-sm sm:text-lg font-semibold text-textdark">{testimonial.name}</p>
            <p className="text-xs sm:text-sm text-textdark">{testimonial.position}</p>
            <p className="mt-2 sm:mt-4 text-xs sm:text-base text-textdark leading-relaxed">
              {testimonial.testimonial}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TestimonialsSection;





// import clsx from 'clsx'

// const featuredTestimonial = {
//   body: 'Integer id nunc sit semper purus. Bibendum at lacus ut arcu blandit montes vitae auctor libero. Hac condimentum dignissim nibh vulputate ut nunc. Amet nibh orci mi venenatis blandit vel et proin. Non hendrerit in vel ac diam.',
//   author: {
//     name: 'Brenna Goyette',
//     handle: 'brennagoyette',
//     imageUrl:
//       'https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=1024&h=1024&q=80',
//     logoUrl: 'https://tailwindui.com/plus/img/logos/savvycal-logo-gray-900.svg',
//   },
// }

// const testimonials = [
//   [
//     [
//       {
//         body: 'Laborum quis quam. Dolorum et ut quod quia. Voluptas numquam delectus nihil. Aut enim doloremque et ipsam.',
//         author: {
//           name: 'Leslie Alexander',
//           handle: 'lesliealexander',
//           imageUrl:
//             'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
//         },
//       },
//       // More testimonials...
//     ],
//     [
//       {
//         body: 'Aut reprehenderit voluptatem eum asperiores beatae id. Iure molestiae ipsam ut officia rem nulla blanditiis.',
//         author: {
//           name: 'Lindsay Walton',
//           handle: 'lindsaywalton',
//           imageUrl:
//             'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
//         },
//       },
//       // More testimonials...
//     ],
//   ],
//   [
//     [
//       {
//         body: 'Voluptas quos itaque ipsam in voluptatem est. Iste eos blanditiis repudiandae. Earum deserunt enim molestiae ipsum perferendis recusandae saepe corrupti.',
//         author: {
//           name: 'Tom Cook',
//           handle: 'tomcook',
//           imageUrl:
//             'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
//         },
//       },
//       // More testimonials...
//     ],
//     [
//       {
//         body: 'Molestias ea earum quos nostrum doloremque sed. Quaerat quasi aut velit incidunt excepturi rerum voluptatem minus harum.',
//         author: {
//           name: 'Leonard Krasner',
//           handle: 'leonardkrasner',
//           imageUrl:
//             'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
//         },
//       },
//       // More testimonials...
//     ],
//   ],
// ]



// export default function Example() {
//   return (
//     <div className="relative isolate bg-white pb-32 pt-24 sm:pt-32">
//       <div
//         aria-hidden="true"
//         className="absolute inset-x-0 top-1/2 -z-10 -translate-y-1/2 transform-gpu overflow-hidden opacity-30 blur-3xl"
//       >
//         <div
//           style={{
//             clipPath:
//               'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
//           }}
//           className="ml-[max(50%,38rem)] aspect-[1313/771] w-[82.0625rem] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc]"
//         />
//       </div>
//       <div
//         aria-hidden="true"
//         className="absolute inset-x-0 top-0 -z-10 flex transform-gpu overflow-hidden pt-32 opacity-25 blur-3xl sm:pt-40 xl:justify-end"
//       >
//         <div
//           style={{
//             clipPath:
//               'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
//           }}
//           className="ml-[-22rem] aspect-[1313/771] w-[82.0625rem] flex-none origin-top-right rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] xl:ml-0 xl:mr-[calc(50%-12rem)]"
//         />
//       </div>
//       <div className="mx-auto max-w-7xl px-6 lg:px-8">
//         <div className="mx-auto max-w-2xl text-center">
//           <h2 className="text-base/7 font-semibold text-primary">Testimonials</h2>
//           <p className="mt-2 text-balance text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
//             What our customers are saying
//           </p>
//         </div>
//         <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 grid-rows-1 gap-8 text-sm/6 text-gray-900 sm:mt-20 sm:grid-cols-2 xl:mx-0 xl:max-w-none xl:grid-flow-col xl:grid-cols-4">
//           <figure className="rounded-2xl bg-white shadow-lg ring-1 ring-gray-900/5 sm:col-span-2 xl:col-start-2 xl:row-end-1">
//             <blockquote className="p-6 text-lg font-semibold tracking-tight text-gray-900 sm:p-12 sm:text-xl/8">
//               <p>{`“${featuredTestimonial.body}”`}</p>
//             </blockquote>
//             <figcaption className="flex flex-wrap items-center gap-x-4 gap-y-4 border-t border-gray-900/10 px-6 py-4 sm:flex-nowrap">
//               <img
//                 alt=""
//                 src={featuredTestimonial.author.imageUrl}
//                 className="size-10 flex-none rounded-full bg-gray-50"
//               />
//               <div className="flex-auto">
//                 <div className="font-semibold">{featuredTestimonial.author.name}</div>
//                 <div className="text-gray-600">{`@${featuredTestimonial.author.handle}`}</div>
//               </div>
//               <img alt="" src={featuredTestimonial.author.logoUrl} className="h-10 w-auto flex-none" />
//             </figcaption>
//           </figure>
//           {testimonials.map((columnGroup, columnGroupIdx) => (
//             <div key={columnGroupIdx} className="space-y-8 xl:contents xl:space-y-0">
//               {columnGroup.map((column, columnIdx) => (
//                 <div
//                   key={columnIdx}
//                   className={clsx(
//                     (columnGroupIdx === 0 && columnIdx === 0) ||
//                       (columnGroupIdx === testimonials.length - 1 && columnIdx === columnGroup.length - 1)
//                       ? 'xl:row-span-2'
//                       : 'xl:row-start-1',
//                     'space-y-8',
//                   )}
//                 >
//                   {column.map((testimonial) => (
//                     <figure
//                       key={testimonial.author.handle}
//                       className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-900/5"
//                     >
//                       <blockquote className="text-gray-900">
//                         <p>{`“${testimonial.body}”`}</p>
//                       </blockquote>
//                       <figcaption className="mt-6 flex items-center gap-x-4">
//                         <img alt="" src={testimonial.author.imageUrl} className="size-10 rounded-full bg-gray-50" />
//                         <div>
//                           <div className="font-semibold">{testimonial.author.name}</div>
//                           <div className="text-gray-600">{`@${testimonial.author.handle}`}</div>
//                         </div>
//                       </figcaption>
//                     </figure>
//                   ))}
//                 </div>
//               ))}
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   )
// }

