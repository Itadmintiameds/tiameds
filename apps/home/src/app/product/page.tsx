import clsx from 'clsx';
import { FaCheckCircle } from 'react-icons/fa';

const features = [
  {
    name: 'Project Management Tool',
    description:
      'Streamline your project planning, tracking, and collaboration with a comprehensive tool for teams of all sizes.',
    points: [
      'Task management and scheduling',
      'Real-time team collaboration',
      'Customizable project templates',
    ],
    imageSrc: 'https://via.placeholder.com/600x400',
    imageAlt: 'Project Management Tool dashboard showing task lists and schedules.',
    link: '/products/project-management-tool'
  },
  {
    name: 'Customer Relationship Management (CRM)',
    description:
      'Manage customer interactions, sales, and support effortlessly with an intuitive CRM software.',
    points: [
      'Comprehensive contact management',
      'Sales pipeline visualization',
      'Integrated customer support tools',
    ],
    imageSrc: 'https://via.placeholder.com/600x400',
    imageAlt: 'CRM tool showing customer data and sales metrics.',
    link: '/products/crm-tool'
  },
  {
    name: 'Accounting Software',
    description:
      'Automate your finances with a solution for invoicing, payroll, and financial tracking.',
    points: [
      'Automated bookkeeping',
      'Tax calculation and reporting',
      'Payroll processing and management',
    ],
    imageSrc: 'https://via.placeholder.com/600x400',
    imageAlt: 'Accounting software interface showing financial reports.',
    link: '/products/accounting-software'
  },
  
];



const ProductFeaturesPage = () => {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">Explore Our Professional Solutions</h2>
          <p className="mt-6 text-lg text-gray-600">
            Enhance your productivity and efficiency with cutting-edge software solutions tailored to your business needs.
          </p>
        </div>

        <div className="mt-16 space-y-16">
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
                <a
                  href={feature.link}
                  className="mt-6 inline-block rounded-md bg-primary px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  View {feature.name}
                </a>
              </div>
              <div
                className={clsx(
                  index % 2 === 0 ? 'lg:col-start-6 xl:col-start-5' : 'lg:col-start-1',
                  'flex-auto lg:col-span-7 lg:row-start-1 xl:col-span-8'
                )}
              >
                <img
                  alt={feature.imageAlt}
                  src={feature.imageSrc}
                  className="aspect-[5/2] w-full rounded-lg bg-gray-100 object-cover shadow-lg"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductFeaturesPage;
