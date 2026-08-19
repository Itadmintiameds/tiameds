import Image from "next/image";
import Link from "next/link";
import { MdEmail, MdPhone, MdLocationOn } from "react-icons/md";

const quickLinks = [
  { name: "Features", href: "/#features" },
  { name: "Support", href: "/#support" },
  { name: "Testimonials", href: "/#testimonials" },
  { name: "FAQ", href: "/#faq" },
  { name: "Contact", href: "/#contact" },
];

const FooterSection = () => {
  return (
    <footer className="relative bg-primary-800 border-t border-pneutral-200 px-6 py-10 overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 left-1/3 h-72 w-72 rounded-full bg-primary-100/40 blur-[120px]" />
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Logo and basic info */}
          <div>
            <Image
              src="/LOGO.svg"
              alt="Tiameds Technology Logo"
              width={140}
              height={80}
              className="w-auto h-12 bg-white"
            />
            <p className="mt-5 text-p3 text-white max-w-xs leading-relaxed">
              Lab management, powered by AI-assisted reporting.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-label-l4 font-heading font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-p3 text-white hover:text-white transition-colors duration-200">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Location */}
          <div>
            <h3 className="text-label-l4 font-heading font-semibold text-white mb-4">Our Location</h3>
            <div className="flex items-start gap-3 text-pneutral-600">
              <MdLocationOn className="text-white mt-1 shrink-0" />
              <p className="text-p3 text-white leading-relaxed">
                No. 59, 2nd Floor of Dakshina Murthy Towers
                Devanooru, <br />
                Rajeevnagara 2nd Stage, <br />
                Udayagiri,
                Mysore, Karnataka – 570019.
              </p>
            </div>
          </div>

          {/* Contact information */}
          <div>
            <h3 className="text-label-l4 font-heading font-semibold text-white mb-4">Get In Touch</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <MdEmail className="text-white" />
                <a href="mailto:support@tiameds.ai" className="text-p3 text-white hover:text-white">
                  support@tiameds.ai
                </a>
              </div>
              <div className="flex items-center gap-3">
                <MdPhone className="text-white" />
                <a href="tel:+917678325053" className="text-p3 text-white hover:text-white">
                  +91 7678325053
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-14 pt-6 border-t border-pneutral-200">
          <p className="text-p2 text-white text-center">
            &copy; {new Date().getFullYear()} TiaMeds Technologies Pvt. Ltd. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;











// code by abhishek .........do not delete this ...................

// import Image from "next/image";
// import { MdEmail, MdPhone, MdLocationOn } from "react-icons/md";

// const FooterSection = () => {
//   return (
//     <footer className="bg-gradient-to-b from-gray-50 to-gray-100 px-6 py-16">
//       <div className="max-w-6xl mx-auto">
//         <div className="flex flex-col lg:flex-row gap-12 items-start">
//           {/* Logo and basic info */}
//           <div className="flex-1">
//             <div className="mb-6">
//               <Image
//                 src="/LOGO.svg"
//                 alt="Tiameds Technology Logo"
//                 width={140}
//                 height={80}
//                 className="w-auto h-12"
//               />
//             </div>
//             <p className="text-gray-500 text-sm max-w-xs">
//               Innovating healthcare solutions through advanced technology.
//             </p>
//           </div>

//           {/* Contact information */}
//           <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
//             <div>
//               <h3 className="text-lg font-medium text-gray-800 mb-4">Our Location</h3>
//               <div className="flex items-start gap-3 text-gray-600 mb-4">
//                 <MdLocationOn className="text-purple-500 mt-1 flex-shrink-0" />
//                 <p className="text-sm">
//                   No. 59, 2nd Floor of Dakshina Murthy Towers 
//                   Devanooru, <br />
//                   Rajeevnagara 2nd Stage, <br />
//                   Udayagiri,
//                   Mysore, Karnataka – 570019.
//                 </p>
//               </div>
//             </div>

//             <div>
//               <h3 className="text-lg font-medium text-gray-800 mb-4">Get In Touch</h3>
//               <div className="space-y-3">
//                 <div className="flex items-center gap-3">
//                   <MdEmail className="text-purple-500" />
//                   <a href="mailto:support@tiameds.ai" className="text-gray-600 hover:text-purple-600 text-sm">
//                     support@tiameds.ai
//                   </a>
//                 </div>
//                 <div className="flex items-center gap-3">
//                   <MdPhone className="text-purple-500" />
//                   <a href="tel:+917678325053" className="text-gray-600 hover:text-purple-600 text-sm">
//                     +91 7678325053
//                   </a>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Copyright */}
//         <div className="mt-16 pt-6 border-t border-gray-200">
//           <p className="text-gray-500 text-sm text-center">
//             &copy; {new Date().getFullYear()} TiaMeds Technologies Pvt. Ltd. All rights reserved.
//           </p>
//         </div>
//       </div>
//     </footer>
//   );
// };

// export default FooterSection;