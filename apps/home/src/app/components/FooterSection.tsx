'use client';
import Link from "next/link"

const FooterSection = () => {
  return (
    <footer className="relative bg-background py-16 px-6 lg:py-20 lg:px-8">
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

      <div className="mx-auto max-w-7xl text-center relative z-10">
        <div className="flex justify-between items-center mb-8">
          {/* Left Side - Logo */}
          <div className="flex items-center space-x-4">
            <Link href="#" className="text-lg font-semibold text-textdark hover:text-primary">
              <span className="sr-only">Tiameds</span>
              Tiameds Technology
            </Link>
          </div>

          {/* Right Side - Social Links */}
          <div className="flex space-x-6 text-gray-600">
            <Link href="#" className="hover:text-tertiary text-primary">
              <svg className="w-6 h-6" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.655-2.828.774 1.016-.61 1.794-1.573 2.165-2.723-.951.564-2.007.975-3.127 1.199C19.818 2.318 18.235.5 16.268.5c-3.1 0-5.613 2.515-5.613 5.613 0 .44.051.872.14 1.285-4.67-.233-8.8-2.47-11.58-5.87C.637 2.628.191 4.068.191 5.567c0 1.944 1.055 3.649 2.656 4.657-1.378-.042-2.679-.419-3.818-1.049-.001.035-.001.068-.001.101 0 2.72 1.933 5.005 4.487 5.52-1.774 1.396-4.017 2.236-6.507 2.236-.423 0-.84-.025-1.25-.073 2.333 1.495 5.11 2.362 8.062 2.362 9.674 0 15.017-8.017 15.017-14.973 0-.23-.004-.461-.014-.69A10.786 10.786 0 0 0 24 4.557z"/></svg>
            </Link>
            <Link href="#" className="hover:text-tertiary text-primary">
              <svg className="w-6 h-6" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2C6.478 2 2 6.478 2 12s4.478 10 10 10 10-4.478 10-10S17.522 2 12 2zm-1 14.93v-4.69h2v4.69c0 .49-.39.89-.88.89s-.88-.39-.88-.89zM13 8.93c-1.103 0-2-.897-2-2s.897-2 2-2 2 .897 2 2-.897 2-2 2z"/></svg>
            </Link>
            <Link href="#" className="hover:text-tertiary text-primary">
              <svg className="w-6 h-6" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19 4h-2V2h-4v2H7v2h6v12H7v2h6v2h4v-2h2z"/></svg>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {/* Navigation Links */}
          <div className="text-left">
            <h3 className="text-xl font-semibold text-textdark mb-4">Company</h3>
            <ul className="space-y-4">
              <li><Link className="text-gray-600 hover:text-primary" href="/about">About Us</Link></li>
              <li><Link className="text-gray-600 hover:text-primary" href="/contact">Contact Us</Link></li>
              <li><Link className="text-gray-600 hover:text-primary" href="/careers">Careers</Link></li>
            </ul>
          </div>

          {/* Solutions Links */}
          <div className="text-left">
            <h3 className="text-xl font-semibold text-textdark mb-4">Solutions</h3>
            <ul className="space-y-4">
              <li><Link href="#" className="text-gray-600 hover:text-primary">Healthcare SaaS</Link></li>
              <li><Link href="#" className="text-gray-600 hover:text-primary">Patient Management</Link></li>
              <li><Link href="#" className="text-gray-600 hover:text-primary">Data Security</Link></li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className="text-left">
            <h3 className="text-xl font-semibold text-textdark mb-4">Contact Info</h3>
            <p className="text-gray-600">123 Health St, Suite 100</p>
            <p className="text-gray-600">City, Country</p>
            <p className="text-gray-600">
              Email: <a href="mailto:support@tiameds.com" className="text-primary">support@tiameds.com</a>
            </p>
            <p className="text-gray-600">
              Phone: <a href="tel:+1234567890" className="text-primary">+123-456-7890</a>
            </p>
          </div>
        </div>

        <div className="mt-16 border-t border-gray-200 pt-6 text-center">
          <p className="text-gray-600 text-sm">© 2025 Tiameds Technology. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
