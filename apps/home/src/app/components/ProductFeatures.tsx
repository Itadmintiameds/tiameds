'use client';

import { FaArrowAltCircleRight, FaLock, FaCloud, FaBrain, FaHeadset, FaPuzzlePiece } from 'react-icons/fa';

const ProductFeatures = () => {
  const features = [
    {
      title: 'Streamlined Workflow',
      description:
        'Simplify medical operations with intelligent tools that reduce administrative overhead and allow professionals to focus on patient care.',
      icon: <FaArrowAltCircleRight className="h-8 w-8 text-textwhite" />,
      color: 'bg-cardbackground hover:bg-cardhover',
    },
    {
      title: 'Data Security & Compliance',
      description:
        'Protect sensitive medical data with robust encryption, HIPAA compliance, and multi-layered security measures.',
      icon: <FaLock className="h-8 w-8 text-textwhite" />,
      color: 'bg-cardbackground hover:bg-cardhover',
    },
    {
      title: 'Cloud Scalability',
      description:
        'Effortlessly scale your operations with our cloud-based solutions, tailored to grow with your organization.',
      icon: <FaCloud className="h-8 w-8 text-textwhite" />,
      color: 'bg-cardbackground hover:bg-cardhover',
    },
    {
      title: 'AI-Powered Insights',
      description:
        'Leverage advanced analytics and machine learning to gain actionable insights, optimize care, and improve outcomes.',
      icon: <FaBrain className="h-8 w-8 text-textwhite" />,
      color: 'bg-cardbackground hover:bg-cardhover',
    },
    {
      title: '24/7 Support',
      description:
        'Access expert assistance anytime with our dedicated support team, ensuring uninterrupted operations.',
      icon: <FaHeadset className="h-8 w-8 text-textwhite" />,
      color: 'bg-cardbackground hover:bg-cardhover',
    },
    {
      title: 'Custom Integrations',
      description:
        'Seamlessly integrate with existing systems for a tailored and cohesive digital experience.',
      icon: <FaPuzzlePiece className="h-8 w-8 text-textwhite" />,
      color: 'bg-cardbackground hover:bg-cardhover',
    },
  ];

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
        <h2
          className="text-4xl font-bold tracking-tight text-textdark sm:text-5xl animate-fade-in-up"
        >
          Why Choose Our SaaS Solutions
        </h2>
        <p className="mt-6 text-lg text-textmuted animate-fade-in">
          Empowering healthcare professionals with tools to achieve excellence.
        </p>
      </div>

      <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => (
          <div
            key={index}
            className={`flex flex-col items-center text-center space-y-4 p-6 shadow-lg rounded-lg transition-all duration-300 ${feature.color}`}
          >
            <div className="rounded-full p-4 shadow-md bg-primary">{feature.icon}</div>
            <h3 className="text-xl font-semibold text-textdark">{feature.title}</h3>
            <p className="text-sm text-textmuted">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProductFeatures;
