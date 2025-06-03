import Image from "next/image";
import { MdEmail, MdPhone, MdLocationOn } from "react-icons/md";

const FooterSection = () => {
  return (
    <footer className="bg-gradient-to-b from-gray-50 to-gray-100 px-6 py-16">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* Logo and basic info */}
          <div className="flex-1">
            <div className="mb-6">
              <Image
                src="/LOGO.svg"
                alt="Tiameds Technology Logo"
                width={140}
                height={80}
                className="w-auto h-12"
              />
            </div>
            <p className="text-gray-500 text-sm max-w-xs">
              Innovating healthcare solutions through advanced technology.
            </p>
          </div>

          {/* Contact information */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">Our Location</h3>
              <div className="flex items-start gap-3 text-gray-600 mb-4">
                <MdLocationOn className="text-purple-500 mt-1 flex-shrink-0" />
                <p className="text-sm">
                  No. 59, 2nd Floor of Dakshina Murthy Towers 
                  Devanooru, <br />
                  Rajeevnagara 2nd Stage, <br />
                  Udayagiri,
                  Mysore, Karnataka – 570019.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">Get In Touch</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <MdEmail className="text-purple-500" />
                  <a href="mailto:support@tiameds.ai" className="text-gray-600 hover:text-purple-600 text-sm">
                    support@tiameds.ai
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <MdPhone className="text-purple-500" />
                  <a href="tel:+917678325053" className="text-gray-600 hover:text-purple-600 text-sm">
                    +91 7678325053
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-16 pt-6 border-t border-gray-200">
          <p className="text-gray-500 text-sm text-center">
            &copy; {new Date().getFullYear()} TiaMeds Technologies Pvt. Ltd. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;