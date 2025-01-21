import {
  FaHospitalAlt,
  FaBriefcaseMedical,
  FaMedkit,
  FaShieldAlt,
  FaClipboardList,
  FaHeartbeat,
} from 'react-icons/fa';

const PartnersSection = () => {
  const partners = [
    {
      title: 'Healthcare Providers',
      description:
        'Streamline patient care with integrated tools for electronic health records, telemedicine, and more.',
      icon: <FaHospitalAlt />,
    },
    {
      title: 'Medical Institutions',
      description:
        'Enhance operational efficiency and reduce costs with our advanced hospital management solutions.',
      icon: <FaBriefcaseMedical />,
    },
    {
      title: 'Pharmaceutical Companies',
      description:
        'Simplify clinical trials and regulatory compliance with cutting-edge data management solutions.',
      icon: <FaMedkit />,
    },
    {
      title: 'Insurance Providers',
      description:
        'Deliver seamless insurance claims processing and improve patient satisfaction with our secure platforms.',
      icon: <FaShieldAlt />,
    },
    {
      title: 'Diagnostic Labs',
      description:
        'Automate workflows and improve diagnostics accuracy with AI-powered lab management tools.',
      icon: <FaClipboardList />,
    },
    {
      title: 'Telehealth Services',
      description:
        'Enable remote consultations and patient monitoring with scalable telehealth platforms.',
      icon: <FaHeartbeat />,
    },
  ];

  return (
    <section className="relative py-20 px-6 lg:py-28 lg:px-8">
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
          Trusted by Industry Leaders
        </h2>
        <p className="mt-6 text-lg text-textmuted animate-fade-in">
          Our innovative SaaS solutions empower healthcare providers, institutions, and organizations worldwide to deliver exceptional care and achieve operational excellence.
        </p>
      </div>

      {/* Partner Cards */}
      <div className="mt-16 overflow-hidden relative group">
        <div className="partners-carousel flex space-x-6 animate-scroll group-hover:animate-none">
          {partners.concat(partners).map((partner, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-full sm:w-1/2 lg:w-1/3 xl:w-1/4 px-4 py-6"
            >
              <div className="flex flex-col items-center text-center space-y-4 p-6 shadow-lg rounded-lg transition-all duration-300 bg-cardbackground text-textwhite partner-card">
                <div className="rounded-full p-6 bg-primary text-textwhite shadow-md">
                  {partner.icon}
                </div>
                <h3 className="text-xl font-semibold text-textdark">
                  {partner.title}
                </h3>
                <p className="text-sm text-textmuted">{partner.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;
