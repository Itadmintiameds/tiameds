import Link from 'next/link';

export default function CTASection() {
  return (
    <div className="bg-gradient-to-r from-primary to-secondary py-20 sm:py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center text-white">
        <h2 className="text-3xl font-bold sm:text-4xl">
          Ready to Transform Your Lab Operations?
        </h2>
        <p className="mt-4 text-lg sm:text-xl">
          Join hundreds of labs already streamlining their operations with our comprehensive software solution.
        </p>

        <div className="mt-10 flex justify-center gap-x-6">
          <Link
            href="/onboarding"
            className="inline-block rounded-md bg-white px-12 py-3 text-sm font-semibold text-primary shadow-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Get Started
          </Link>
          <Link
            href="/contact-us"
            className="inline-block rounded-md px-12 py-3 text-sm font-semibold text-white border-2 border-white hover:bg-white hover:text-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}
