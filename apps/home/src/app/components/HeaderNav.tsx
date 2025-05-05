'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogPanel } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import Link from "next/link";
import Image from 'next/image';

const navigation = [
  // { name: 'About Us', href: '/about' },
  { name: 'Product', href: '/product' },
  { name: 'services', href: '/services' },
  { name: 'Careers', href: '/careers' },
  // { name: 'Events', href: '/events' },
  // { name: 'Blog', href: '/blog' },
  { name: 'Contact Us', href: '/contact' },
];

const HeaderNav = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Detect scroll to change header style
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 z-50 w-full transition-all duration-300 ${
          isScrolled ? 'bg-white shadow-md' : 'bg-transparent'
        }`}
      >
        <nav
          aria-label="Global"
          className="flex items-center justify-between p-3 lg:px-8 transition-colors duration-300"
        >
          <div className="flex lg:flex-1">
            <Link href="/" className="-m-1.5 p-1.5 ">
              <span className="sr-only">Tiameds</span>
              <Image
                alt="/TiamedsLogo.svg"
                src="/TiamedsLogo.svg"
                className="h-12 w-auto transition-transform duration-300 "
                width={100}
                height={100}
              />
            </Link>
          </div>
          <div className="flex lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
            >
              <span className="sr-only">Open main menu</span>
              <Bars3Icon aria-hidden="true" className="w-6 h-6 animate-pulse" />
            </button>
          </div>
          <div className="hidden lg:flex lg:gap-x-12">
            {navigation.map((item) => (
              <Link 
                key={item.name}
                href={item.href}
                className="text-sm font-semibold text-gray-900 hover:text-primary transition-colors duration-200 hover:underline "
              >
                {item.name}
              </Link>
            ))}
          </div>
          <div className="hidden lg:flex lg:flex-1 lg:justify-end">
            {/* <a
              href="#"
              className="text-sm font-semibold text-gray-900 hover:text-indigo-600 transition-colors duration-200"
            >
              Log in <span aria-hidden="true">&rarr;</span>
            </a> */}
          </div>
        </nav>
        <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
          <div className="fixed inset-0 z-50 bg-gray-800 bg-opacity-50" />
          <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
            <div className="flex items-center justify-between">
              <Link href="#" className="-m-1.5 p-1.5">
                <span className="sr-only">Tiameds</span>
                <Image
                alt="/tiamedfinallogo.png"
                src="/tiamedfinallogo.png"
                className="h-12 w-auto transition-transform duration-300 "
                width={100}
                height={100}
              />
              </Link>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="-m-2.5 rounded-md p-2.5 text-gray-700"
              >
                <span className="sr-only">Close menu</span>
                <XMarkIcon aria-hidden="true" className="w-6 h-6" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-gray-500/10">
                <div className="space-y-2 py-6">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold text-gray-900 hover:bg-gray-50 transition-all duration-200"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
                {/* <div className="py-6">
                  <a
                    href="#"
                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold text-gray-900 hover:bg-gray-50 transition-all duration-200"
                  >
                    Log in
                  </a>
                </div> */}
              </div>
            </div>
          </DialogPanel>
        </Dialog>
      </header>
    </>
  );
};

export default HeaderNav;







// 'use client';

// import React, { useState, useEffect } from 'react';
// import { Dialog, DialogPanel } from '@headlessui/react';
// import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
// import Link from "next/link";
// import Image from 'next/image';
// import { motion } from 'framer-motion';

// const navigation = [
//   { name: 'Product', href: '/product' },
//   { name: 'Careers', href: '/careers' },
//   { name: 'Contact Us', href: '/contact' },
// ];

// const HeaderNav = () => {
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const [isScrolled, setIsScrolled] = useState(false);
//   const [isHoveringLogo, setIsHoveringLogo] = useState(false);

//   useEffect(() => {
//     const handleScroll = () => {
//       setIsScrolled(window.scrollY > 10);
//     };
//     window.addEventListener('scroll', handleScroll);
//     return () => window.removeEventListener('scroll', handleScroll);
//   }, []);

//   return (
//     <header
//       className={`fixed top-0 z-50 w-full transition-all duration-500 ${
//         isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-0' : 'bg-transparent py-2'
//       }`}
//     >
//       <motion.nav
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//         aria-label="Global"
//         className={`flex items-center justify-between px-4 lg:px-8 mx-auto max-w-7xl ${
//           isScrolled ? 'h-16' : 'h-20'
//         } transition-all duration-500`}
//       >
//         <div className="flex lg:flex-1">
//           <Link 
//             href="/" 
//             className="-m-1.5 p-1.5"
//             onMouseEnter={() => setIsHoveringLogo(true)}
//             onMouseLeave={() => setIsHoveringLogo(false)}
//           >
//             <span className="sr-only">Tiameds</span>
//             <motion.div
//               animate={{
//                 scale: isHoveringLogo ? 1.05 : 1,
//                 rotate: isHoveringLogo ? [0, 5, -5, 0] : 0
//               }}
//               transition={{ duration: 0.5 }}
//             >
//               <Image
//                 alt="/TiamedsLogo.svg"
//                 src="/TiamedsLogo.svg"
//                 className={`transition-all duration-500 ${
//                   isScrolled ? 'h-10 w-auto' : 'h-12 w-auto'
//                 }`}
//                 width={100}
//                 height={100}
//               />
//             </motion.div>
//           </Link>
//         </div>

//         <div className="flex lg:hidden">
//           <button
//             type="button"
//             onClick={() => setMobileMenuOpen(true)}
//             className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700 hover:text-primary transition-colors"
//           >
//             <span className="sr-only">Open main menu</span>
//             <Bars3Icon 
//               aria-hidden="true" 
//               className={`w-6 h-6 ${isScrolled ? '' : 'text-white'}`}
//             />
//           </button>
//         </div>

//         <div className="hidden lg:flex lg:gap-x-8">
//           {navigation.map((item) => (
//             <Link 
//               key={item.name}
//               href={item.href}
//               className={`text-sm font-semibold transition-all duration-300 hover:text-primary ${
//                 isScrolled ? 'text-gray-900' : 'text-white hover:text-white/80'
//               } relative group`}
//             >
//               {item.name}
//               <span className={`absolute bottom-0 left-0 h-0.5 bg-primary transition-all duration-300 ${
//                 isScrolled ? 'w-0 group-hover:w-full' : 'w-0 group-hover:w-full bg-white'
//               }`} />
//             </Link>
//           ))}
//         </div>

//         <div className="hidden lg:flex lg:flex-1 lg:justify-end">
//           {/* Optional login/CTA can be added here */}
//         </div>
//       </motion.nav>

//       {/* Mobile menu */}
//       <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
//         <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
//         <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-gradient-to-b from-gray-900 to-gray-800 px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
//           <div className="flex items-center justify-between">
//             <Link href="/" className="-m-1.5 p-1.5" onClick={() => setMobileMenuOpen(false)}>
//               <span className="sr-only">Tiameds</span>
//               <Image
//                 alt="/tiamedfinallogo.png"
//                 src="/tiamedfinallogo.png"
//                 className="h-10 w-auto"
//                 width={100}
//                 height={100}
//               />
//             </Link>
//             <button
//               type="button"
//               onClick={() => setMobileMenuOpen(false)}
//               className="-m-2.5 rounded-md p-2.5 text-gray-200 hover:text-white transition-colors"
//             >
//               <span className="sr-only">Close menu</span>
//               <XMarkIcon aria-hidden="true" className="w-6 h-6" />
//             </button>
//           </div>
//           <div className="mt-6 flow-root">
//             <div className="-my-6 divide-y divide-gray-500/30">
//               <div className="space-y-4 py-6">
//                 {navigation.map((item) => (
//                   <Link
//                     key={item.name}
//                     href={item.href}
//                     onClick={() => setMobileMenuOpen(false)}
//                     className="-mx-3 block rounded-lg px-3 py-3 text-lg font-semibold text-white hover:bg-gray-800 transition-all duration-200"
//                   >
//                     {item.name}
//                   </Link>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </DialogPanel>
//       </Dialog>
//     </header>
//   );
// };

// export default HeaderNav;