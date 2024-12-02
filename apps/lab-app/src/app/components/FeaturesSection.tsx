import { FaUserMd, FaFileAlt, FaTasks, FaUpload, FaLock, FaShieldAlt, FaUsersCog } from 'react-icons/fa';

interface Feature {
  title: string;
  description: string;
  icon: JSX.Element;
}

const features: Feature[] = [
  {
    title: 'Patient and Doctor Integration',
    description: 'Maintain a central database for patient histories, doctor referrals, and test prescriptions.',
    icon: <FaUserMd className="text-3xl" />,
  },
  {
    title: 'Test Workflow Automation',
    description: 'Streamline the test booking process, automate sample tracking, and ensure timely results.',
    icon: <FaTasks className="text-3xl" />,
  },
  {
    title: 'Bulk Data Management',
    description: 'Upload and manage large volumes of test data with ease, supporting multiple file formats like CSV or Excel.',
    icon: <FaUpload className="text-3xl" />,
  },
  {
    title: 'Report and Billing Generation',
    description: 'Automatically generate professional, detailed reports and itemized bills, ensuring accuracy and compliance with GST.',
    icon: <FaFileAlt className="text-3xl" />,
  },
  {
    title: 'Role-Based Access Control',
    description: 'Secure sensitive information by limiting access based on user roles, ensuring patient privacy.',
    icon: <FaLock className="text-3xl" />,
  },
  {
    title: 'Insurance Management',
    description: 'Incorporate insurance claims processing directly into lab workflows, reducing delays and errors.',
    icon: <FaShieldAlt className="text-3xl" />,
  },
  {
    title: 'Technician Management',
    description: 'Assign and manage technician roles, ensuring accountability and optimized task delegation.',
    icon: <FaUsersCog className="text-3xl" />,
  },
  {
    title: 'Customizable Workflows',
    description: 'Tailor workflows to your lab’s unique requirements, ensuring efficient operations and quality results.',
    icon: <FaTasks className="text-3xl" />,
  }
];

const FeaturesSection: React.FC = () => {
  return (
    <section className="py-16 bg-gradient-to-r from-indigo-100 via-indigo-200 to-indigo-300">
      <div className="max-w-7xl mx-auto px-6 sm:px-12">
        <h2 className="text-4xl font-extrabold text-gray-900 text-center mb-12">
          Key Features
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col items-center bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:scale-105"
            >
              <div className="flex items-center justify-center w-16 h-16 bg-indigo-600 text-white rounded-full mb-4 transition-all duration-300 transform hover:scale-110">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-center">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
