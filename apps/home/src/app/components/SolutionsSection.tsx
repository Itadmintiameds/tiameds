'use client';

import { FaUsers, FaPhoneAlt, FaHeartbeat, FaBriefcaseMedical, FaMedkit, FaClipboardList } from 'react-icons/fa';

const SolutionsSection = () => {
  const solutions = [
    {
      title: 'Patient Management System',
      description:
        'Seamlessly manage patient records with real-time access, efficient workflows, and secure storage, empowering healthcare professionals.',
      icon: <FaUsers />,
    },
    {
      title: 'Telemedicine Platform',
      description:
        'Our telemedicine solution allows healthcare providers to offer consultations remotely, reducing patient wait times and improving convenience.',
      icon: <FaPhoneAlt />,
    },
    {
      title: 'Electronic Health Records (EHR)',
      description:
        'Our EHR solution enables seamless electronic documentation, enhancing accuracy and allowing for faster treatment and diagnosis.',
      icon: <FaHeartbeat />,
    },
    {
      title: 'Clinical Decision Support',
      description:
        'Leverage AI and machine learning to provide clinicians with actionable insights, reducing errors and improving patient outcomes.',
      icon: <FaBriefcaseMedical />,
    },
    {
      title: 'Medical Billing and Coding',
      description:
        'Our platform streamlines the billing process, integrating coding and payment workflows to reduce errors and ensure prompt payment.',
      icon: <FaMedkit />,
    },
    {
      title: 'Inventory Management',
      description:
        'Manage medical supplies with real-time tracking and automated reordering to ensure you never run out of essential items.',
      icon: <FaClipboardList />,
    },
  ];

  return (
    <section className="relative py-20 px-6 lg:py-28 lg:px-8 ">
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
        <h2 className="text-4xl font-semibold tracking-tight text-textdark sm:text-5xl animate-fade-in-up">
          Our Solutions for Healthcare Excellence
        </h2>
        <p className="mt-6 text-lg text-textmuted animate-fade-in">
          Empowering healthcare providers with advanced software to optimize patient care and streamline operations.
        </p>
      </div>

      {/* Continuous Carousel */}
      <div className="mt-16 overflow-hidden relative">
        <div className="solutions-carousel flex">
          {solutions.concat(solutions).map((solution, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-full sm:w-1/2 lg:w-1/3 xl:w-1/4 px-4 py-6"
            >
              <div className="flex flex-col items-center text-center space-y-4 p-6 shadow-lg rounded-lg transition-all duration-300 bg-cardbackground text-textwhite solution-card">
                <div className="rounded-full p-6 bg-primary text-textwhite shadow-md">
                  {solution.icon}
                </div>
                <h3 className="text-xl font-semibold text-textdark">{solution.title}</h3>
                <p className="text-sm text-textmuted">{solution.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SolutionsSection;





