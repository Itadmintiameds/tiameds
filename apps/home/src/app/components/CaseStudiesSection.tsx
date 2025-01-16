'use client';

const CaseStudiesSection = () => {
  const caseStudies = [
    {
      title: 'Streamlining Patient Management for HealthTech Corp',
      description:
        'We implemented a customized Patient Management System for HealthTech Corp, reducing patient data entry time by 50% and improving data accuracy.',
      image: 'https://via.placeholder.com/500', // Placeholder image URL
      link: '/case-studies/healthtech-corp', // Link to detailed case study
    },
    {
      title: 'Enhancing Telemedicine Capabilities for MediTech Solutions',
      description:
        'By integrating our telemedicine platform, MediTech Solutions saw a 30% increase in patient consultation efficiency and improved patient satisfaction.',
      image: 'https://via.placeholder.com/500', // Placeholder image URL
      link: '/case-studies/meditech-solutions', // Link to detailed case study
    },
    {
      title: 'Optimizing Healthcare Workflow for HealthFirst',
      description:
        'HealthFirst leveraged our Electronic Health Records system to streamline patient data management, improving response times and treatment accuracy.',
      image: 'https://via.placeholder.com/500', // Placeholder image URL
      link: '/case-studies/healthfirst', // Link to detailed case study
    },
  ];

  return (
    <section className="relative py-20 px-6 lg:py-28 lg:px-8 bg-background">
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
        <h2 className="text-4xl font-extrabold tracking-tight text-textdark sm:text-5xl animate-fade-in-up">
          Our Successful Case Studies
        </h2>
        <p className="mt-6 text-lg text-textmuted max-w-3xl mx-auto animate-fade-in">
          Discover how Tiameds has transformed healthcare operations through innovative software solutions.
        </p>
      </div>

      <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {caseStudies.map((caseStudy, index) => (
          <div
            key={index}
            className="relative flex flex-col items-center text-center p-6 bg-cardbackground shadow-xl rounded-xl transition-all duration-300 hover:bg-cardhover transform hover:scale-105"
          >
            <img
              src={caseStudy.image}
              alt={caseStudy.title}
              className="w-full h-64 object-cover rounded-lg mb-6 transition-transform duration-300"
            />
            <h3 className="text-xl font-semibold text-textdark">{caseStudy.title}</h3>
            <p className="text-sm text-textmuted mt-4">{caseStudy.description}</p>
            <a
              href={caseStudy.link}
              className="mt-6 inline-block text-primary font-semibold hover:text-textdark transition duration-200"
            >
              Read Full Case Study →
            </a>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CaseStudiesSection;
