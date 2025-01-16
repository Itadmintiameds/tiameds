// 'use client';

import { FaLightbulb, FaRegHandshake, FaUserAlt } from 'react-icons/fa';

const About = () => {
  return (
    <section className="relative bg-background py-16 px-6 lg:py-24 lg:px-8">
      {/* Background Gradient */}
      <div className="absolute inset-x-0 top-0 -z-10 transform-gpu overflow-hidden blur-3xl">
        <div
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
        />
      </div>

      <div className="mx-auto max-w-4xl text-center">
        <h2
          className="text-3xl font-bold text-textdark sm:text-4xl animate-fade-in-up"
          data-aos="fade-in-up"
        >
          About Tiameds Technology Private Limited
        </h2>
        <p className="mt-6 text-lg text-textmuted animate-fade-in" data-aos="fade-in">
          At Tiameds, we revolutionize healthcare by crafting innovative software
          and SaaS solutions tailored to the medical industry. With a focus on
          cutting-edge technologies and seamless user experiences, we empower
          healthcare providers to deliver exceptional care.
        </p>
      </div>

      <div className="mt-12 flex flex-col gap-y-8 sm:flex-row sm:justify-center sm:gap-x-8">
        <div className="flex flex-col items-center text-center animate-slide-in">
          <div className="rounded-full bg-primary p-4 shadow-md">
            <FaLightbulb className="h-8 w-8 text-white" />
          </div>
          <h3 className="mt-4 text-xl font-semibold text-textdark">Innovative Solutions</h3>
          <p className="mt-2 text-sm text-textmuted">
            Delivering technology-driven solutions that address real-world
            healthcare challenges.
          </p>
        </div>

        <div className="flex flex-col items-center text-center animate-slide-in">
          <div className="rounded-full bg-secondary p-4 shadow-md">
            <FaRegHandshake className="h-8 w-8 text-white" />
          </div>
          <h3 className="mt-4 text-xl font-semibold text-textdark">Trusted Expertise</h3>
          <p className="mt-2 text-sm text-textmuted">
            Backed by years of experience in software development for the
            medical sector.
          </p>
        </div>

        <div className="flex flex-col items-center text-center animate-slide-in">
          <div className="rounded-full bg-tertiary p-4 shadow-md">
            <FaUserAlt className="h-8 w-8 text-white" />
          </div>
          <h3 className="mt-4 text-xl font-semibold text-textdark">Client-Centric</h3>
          <p className="mt-2 text-sm text-textmuted">
            Putting our clients first to create impactful, tailor-made
            solutions.
          </p>
        </div>
      </div>
    </section>
  );
};

export default About;

