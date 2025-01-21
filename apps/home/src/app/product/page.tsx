// import clsx from 'clsx';
// import { FaCheckCircle } from 'react-icons/fa';
// import { Feature } from '../types/feature';
// import Link from 'next/link';

// const features: Feature[] = [
//   {
//     name: 'Lab Management Software',
//     description:
//       'Streamline your lab operations with a powerful software solution for managing samples, tests, and results.',
//     points: [
//       'Sample tracking and management',
//       'Test scheduling and automation',
//       'Result reporting and analysis',
//       'Inventory and supply chain management',
//       'Compliance and quality control',
//       'Data security and privacy',
//       'Customizable workflows and templates',
//       'Integration with lab equipment and devices',
//       'User-friendly interface and dashboard',
//       '24/7 customer support',
//       'Scalable and flexible pricing plans',
//       'Cloud-based and on-premises deployment options',
//     ],
//     imageSrc: '/tiamed.svg',
//     imageAlt: 'Lab management software interface showing sample tracking and test results.',
//     link: 'https://tiameds-lab-app.vercel.app'
//   },
//   {
//     name: 'Billing and Invoicing Software',
//     description:
//       'Automate your billing and invoicing processes with a solution that simplifies payment collection and tracking.',
//     points: [
//       'Invoice generation and customization',
//       'Payment processing and reminders',
//       'Recurring billing and subscriptions',
//       'Client and customer management',
//       'Financial reporting and analytics',
//       'Tax calculation and reporting',
//       'Integration with accounting software',
//       'User-friendly interface and dashboard',
//       '24/7 customer support',
//       'Scalable and flexible pricing plans',
//       'Cloud-based and on-premises deployment options',
//     ],
//     imageSrc: 'https://via.placeholder.com/600x400',
//     imageAlt: 'Billing and invoicing software interface showing invoice tracking.',
//     link: '#'
//   },
//   {
//     name: 'Ecommerce Platform',
//     description:
//       'Launch and grow your online store with a comprehensive ecommerce platform that offers a range of features and tools.',
//     points: [
//       'Product catalog and inventory management',
//       'Order processing and fulfillment',
//       'Payment gateway integration',
//       'Customer relationship management',
//       'Marketing and promotional tools',
//       'Analytics and reporting',
//       'Mobile-responsive design',
//       'SEO optimization',
//       'Security and fraud prevention',
//       'Scalable and flexible pricing plans',
//       '24/7 customer support',
//       'Cloud-based and on-premises deployment options',
//     ],
//     imageSrc: 'https://via.placeholder.com/600x400',
//     imageAlt: 'Ecommerce platform interface showing online store management.',
//     link: '#'
//   },
// ];

// const ProductFeaturesPage = () => {
//   return (
//     <div className="relative isolate bg-white py-24 sm:py-32">
//       <div
//         aria-hidden="true"
//         className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80 animate-gradient-flow"
//       >
//         <div
//           style={{
//             clipPath:
//               'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
//           }}
//           className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
//         />
//       </div>

//       <div className="mx-auto max-w-3xl text-center">
//         <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
//           Explore Our Professional Solutions
//         </h2>
//         <p className="mt-6 text-lg text-gray-600">
//           Enhance your productivity and efficiency with cutting-edge software solutions tailored to your business needs.
//         </p>
//       </div>

//       <div className="mt-16 space-y-16 px-24">
//         {features.map((feature, index) => (
//           <div
//             key={feature.name}
//             className="flex flex-col-reverse lg:grid lg:grid-cols-12 lg:items-center lg:gap-x-8"
//           >
//             <div
//               className={clsx(
//                 index % 2 === 0 ? 'lg:col-start-1' : 'lg:col-start-8 xl:col-start-9',
//                 'mt-6 lg:col-span-5 lg:row-start-1 lg:mt-0 xl:col-span-4'
//               )}
//             >
//               <h3 className="text-2xl font-bold text-gray-800">{feature.name}</h3>
//               <p className="mt-4 text-gray-600">{feature.description}</p>
//               <ul className="mt-4 space-y-2">
//                 {feature.points.map((point) => (
//                   <li key={point} className="flex items-center">
//                     <FaCheckCircle className="text-primary mr-2" />
//                     <span className="text-gray-700">{point}</span>
//                   </li>
//                 ))}
//               </ul>
//               <div className='mt-6'>
//               <Link
//                 href={feature.link}
//                className="rounded-md bg-gradient-to-r from-primary to-secondary px-3.5 py-2.5 my-2 text-sm font-semibold text-white shadow-sm hover:bg-gradient-to-r hover:from-secondary hover:to-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 animate-bounce"
//                >
//                 View {feature.name}
//               </Link>
//               </div>
//             </div>
//             <div
//               className={clsx(
//                 index % 2 === 0 ? 'lg:col-start-6 xl:col-start-5' : 'lg:col-start-1',
//                 'flex-auto lg:col-span-7 lg:row-start-1 xl:col-span-8'
//               )}
//             >
//               <div className="relative">
//                 <img
//                   alt={feature.imageAlt}
//                   src={feature.imageSrc}
//                   className="w-full h-full rounded-lg bg-gray-100 object-cover shadow-lg"
//                   style={{
//                     height: 'auto',
//                   }}
//                 />
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default ProductFeaturesPage;













import clsx from 'clsx';
import { FaCheckCircle } from 'react-icons/fa';
import { Feature } from '../types/feature';
import Link from 'next/link';

const features: Feature[] = [
  {
    name: 'Lab Management Software',
    description:
      'Streamline your lab operations with a powerful software solution for managing samples, tests, and results.',
    points: [
      'Sample tracking and management',
      'Test scheduling and automation',
      'Result reporting and analysis',
      'Inventory and supply chain management',
      'Compliance and quality control',
      'Data security and privacy',
      'Customizable workflows and templates',
      'Integration with lab equipment and devices',
      'User-friendly interface and dashboard',
      '24/7 customer support',
      'Scalable and flexible pricing plans',
      'Cloud-based and on-premises deployment options',
    ],
    imageSrc: '/tiamed.svg',
    imageAlt: 'Lab management software interface showing sample tracking and test results.',
    link: 'https://tiameds-lab-app.vercel.app'
  },
  {
    name: 'Billing and Invoicing Software',
    description:
      'Automate your billing and invoicing processes with a solution that simplifies payment collection and tracking.',
    points: [
      'Invoice generation and customization',
      'Payment processing and reminders',
      'Recurring billing and subscriptions',
      'Client and customer management',
      'Financial reporting and analytics',
      'Tax calculation and reporting',
      'Integration with accounting software',
      'User-friendly interface and dashboard',
      '24/7 customer support',
      'Scalable and flexible pricing plans',
      'Cloud-based and on-premises deployment options',
    ],
    imageSrc: 'https://via.placeholder.com/600x400',
    imageAlt: 'Billing and invoicing software interface showing invoice tracking.',
    link: '#'
  },
  {
    name: 'Ecommerce Platform',
    description:
      'Launch and grow your online store with a comprehensive ecommerce platform that offers a range of features and tools.',
    points: [
      'Product catalog and inventory management',
      'Order processing and fulfillment',
      'Payment gateway integration',
      'Customer relationship management',
      'Marketing and promotional tools',
      'Analytics and reporting',
      'Mobile-responsive design',
      'SEO optimization',
      'Security and fraud prevention',
      'Scalable and flexible pricing plans',
      '24/7 customer support',
      'Cloud-based and on-premises deployment options',
    ],
    imageSrc: 'https://via.placeholder.com/600x400',
    imageAlt: 'Ecommerce platform interface showing online store management.',
    link: '#'
  },
];

const ProductFeaturesPage = () => {
  return (
    <div className="relative isolate bg-white py-24 sm:py-32">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80 animate-gradient-flow"
      >
        <div
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
        />
      </div>

      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
          Explore Our Professional Solutions
        </h2>
        <p className="mt-6 text-lg text-gray-600">
          Enhance your productivity and efficiency with cutting-edge software solutions tailored to your business needs.
        </p>
      </div>

      <div className="mt-16 space-y-16 px-4 md:px-24">
        {features.map((feature, index) => (
          <div
            key={feature.name}
            className="flex flex-col-reverse lg:grid lg:grid-cols-12 lg:items-center lg:gap-x-8"
          >
            <div
              className={clsx(
                index % 2 === 0 ? 'lg:col-start-1' : 'lg:col-start-8 xl:col-start-9',
                'mt-6 lg:col-span-5 lg:row-start-1 lg:mt-0 xl:col-span-4'
              )}
            >
              <h3 className="text-2xl font-bold text-gray-800">{feature.name}</h3>
              <p className="mt-4 text-gray-600">{feature.description}</p>
              <ul className="mt-4 space-y-2">
                {feature.points.map((point) => (
                  <li key={point} className="flex items-center">
                    <FaCheckCircle className="text-primary mr-2" />
                    <span className="text-gray-700">{point}</span>
                  </li>
                ))}
              </ul>
              <div className='mt-6'>
              <Link
                href={feature.link}
               className="rounded-md bg-gradient-to-r from-primary to-secondary px-3.5 py-2.5 my-2 text-sm font-semibold text-white shadow-sm hover:bg-gradient-to-r hover:from-secondary hover:to-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 animate-bounce"
               >
                View {feature.name}
              </Link>
              </div>
            </div>
            <div
              className={clsx(
                index % 2 === 0 ? 'lg:col-start-6 xl:col-start-5' : 'lg:col-start-1',
                'flex-auto lg:col-span-7 lg:row-start-1 xl:col-span-8'
              )}
            >
              <div className="relative">
                <img
                  alt={feature.imageAlt}
                  src={feature.imageSrc}
                  className="w-full h-full rounded-lg bg-gray-100 object-cover shadow-lg"
                  style={{
                    height: 'auto',
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductFeaturesPage;

