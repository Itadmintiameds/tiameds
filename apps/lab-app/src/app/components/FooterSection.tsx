import Image from "next/image";
import { MdEmail, MdPhone, MdLocationOn } from "react-icons/md";

const FooterSection = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 px-6 py-12 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Left: Logo */}
        <div className="flex justify-center md:justify-start">
          <Image
            src="/finallogo.svg"
            alt="Tiameds Technology Logo"
            width={120}
            height={150}
            className="w-auto h-auto"
          />
        </div>

        {/* Right: Contact Info */}
        <div className="text-center md:text-left text-gray-600 text-sm space-y-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Us</h3>
          
          <p className="flex items-center justify-center md:justify-start gap-2">
            <MdLocationOn className="text-purple-600" />
            #4754, Shivaji Road, NR Mohalla, Mysore-570007, Karnataka, India
          </p>

          <p className="flex items-center justify-center md:justify-start gap-2">
            <MdEmail className="text-purple-600" />
            <a href="mailto:support@tiameds.ai" className="hover:text-purple-600">
              support@tiameds.ai
            </a>
          </p>

          <p className="flex items-center justify-center md:justify-start gap-2">
            <MdPhone className="text-purple-600" />
            <a href="tel:+1234567890" className="hover:text-purple-600">
              +123-456-7890
            </a>
          </p>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="mt-12 border-t border-gray-200 pt-6 text-center">
        <p className="text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} Tiameds Technology. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default FooterSection;
