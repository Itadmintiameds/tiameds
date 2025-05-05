// import { FaUserMd, FaFileAlt, FaTasks, FaUpload, FaLock, FaShieldAlt, FaUsersCog } from 'react-icons/fa';

// interface Feature {
//   title: string;
//   description: string;
//   icon: JSX.Element;
// }

// const features: Feature[] = [
//   {
//     title: 'Patient and Doctor Integration',
//     description: 'Maintain a central database for patient histories, doctor referrals, and test prescriptions.',
//     icon: <FaUserMd className="text-4xl" />,
//   },
//   {
//     title: 'Test Workflow Automation',
//     description: 'Streamline the test booking process, automate sample tracking, and ensure timely results.',
//     icon: <FaTasks className="text-4xl" />,
//   },
//   {
//     title: 'Bulk Data Management',
//     description: 'Upload and manage large volumes of test data with ease, supporting multiple file formats like CSV or Excel.',
//     icon: <FaUpload className="text-4xl" />,
//   },
//   {
//     title: 'Report and Billing Generation',
//     description: 'Automatically generate professional, detailed reports and itemized bills, ensuring accuracy and compliance with GST.',
//     icon: <FaFileAlt className="text-4xl" />,
//   },
//   {
//     title: 'Role-Based Access Control',
//     description: 'Secure sensitive information by limiting access based on user roles, ensuring patient privacy.',
//     icon: <FaLock className="text-4xl" />,
//   },
//   {
//     title: 'Insurance Management',
//     description: 'Incorporate insurance claims processing directly into lab workflows, reducing delays and errors.',
//     icon: <FaShieldAlt className="text-4xl" />,
//   },
//   {
//     title: 'Technician Management',
//     description: 'Assign and manage technician roles, ensuring accountability and optimized task delegation.',
//     icon: <FaUsersCog className="text-4xl" />,
//   },
//   {
//     title: 'Customizable Workflows',
//     description: 'Tailor workflows to your lab’s unique requirements, ensuring efficient operations and quality results.',
//     icon: <FaTasks className="text-4xl" />,
//   }
// ];

// const FeaturesSection: React.FC = () => {
//   return (
//     <section className="relative py-12 overflow-hidden">
//       {/* Background gradient with clip-path effect */}
//       <div
//         aria-hidden="true"
//         className="absolute inset-0 -z-10 transform-gpu overflow-hidden blur-3xl animate-gradient-flow"
//       >
//         <div
//           style={{
//             clipPath:
//               'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
//           }}
//           className="relative left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2 aspect-[1155/678] w-[36.125rem] rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[50%] sm:w-[72.1875rem]"
//         />
//       </div>

//       <div className="mx-auto max-w-7xl px-6 sm:px-12">
//         <h2 className="text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl text-center mb-12">
//           Key Features
//         </h2>
//         <p className="text-center text-lg text-gray-500 sm:text-xl mb-16">
//           Our platform is designed to streamline lab operations, ensuring efficiency, accuracy, and compliance across all workflows.
//         </p>
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
//           {features.map((feature, index) => (
//             <div
//               key={index}
//               className="flex flex-col items-center bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 transform hover:scale-105 hover:bg-gray-100"
//             >
//               <div className="flex items-center justify-center w-20 h-20 bg-primary text-white rounded-full mb-6 transition-all duration-300 transform hover:scale-110">
//                 {feature.icon}
//               </div>
//               <h3 className="text-2xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
//               <p className="text-gray-500 text-center text-lg">{feature.description}</p>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// };

// export default FeaturesSection;




import { FaUserMd, FaTasks, FaUpload, FaFileAlt, FaLock, FaShieldAlt, FaUsersCog } from 'react-icons/fa';

interface Feature {
  title: string;
  description: string;
  icon: JSX.Element;
}

const features: Feature[] = [
  {
    title: 'Patient and Doctor Integration',
    description: 'Maintain a central database for patient histories, doctor referrals, and test prescriptions.',
    icon: <FaUserMd className="text-4xl" />,
  },
  {
    title: 'Test Workflow Automation',
    description: 'Streamline the test booking process, automate sample tracking, and ensure timely results.',
    icon: <FaTasks className="text-4xl" />,
  },
  {
    title: 'Bulk Data Management',
    description: 'Upload and manage large volumes of test data with ease, supporting multiple file formats like CSV or Excel.',
    icon: <FaUpload className="text-4xl" />,
  },
  {
    title: 'Report and Billing Generation',
    description: 'Automatically generate professional, detailed reports and itemized bills, ensuring accuracy and compliance with GST.',
    icon: <FaFileAlt className="text-4xl" />,
  },
  {
    title: 'Role-Based Access Control',
    description: 'Secure sensitive information by limiting access based on user roles, ensuring patient privacy.',
    icon: <FaLock className="text-4xl" />,
  },
  {
    title: 'Insurance Management',
    description: 'Incorporate insurance claims processing directly into lab workflows, reducing delays and errors.',
    icon: <FaShieldAlt className="text-4xl" />,
  },
  {
    title: 'Technician Management',
    description: 'Assign and manage technician roles, ensuring accountability and optimized task delegation.',
    icon: <FaUsersCog className="text-4xl" />,
  },
  {
    title: 'Customizable Workflows',
    description: 'Tailor workflows to your lab’s unique requirements, ensuring efficient operations and quality results.',
    icon: <FaTasks className="text-4xl" />,
  },
];

export default function KeyFeaturesSection() {
  return (
    <div className="bg-gray-50 py-20 sm:py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Key Features
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Discover how our software enhances your lab operations with these powerful features.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-full bg-purple-900 text-white flex items-center justify-center">
                {feature.icon}
              </div>
              <h3 className="mt-6 text-xl font-semibold text-gray-900">{feature.title}</h3>
              <p className="mt-2 text-gray-500">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
