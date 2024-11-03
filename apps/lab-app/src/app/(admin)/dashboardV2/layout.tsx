
// "use client";

// import {
//   Disclosure,
//   DisclosureButton,
//   DisclosurePanel,
// } from "@headlessui/react";
// import {
//   ChevronRightIcon,
//   CogIcon,
//   DocumentTextIcon,
//   FolderIcon,
//   HomeIcon,
//   ShoppingCartIcon,
//   UserGroupIcon
// } from "@heroicons/react/24/outline";
// import clsx from "clsx";
// import {
//   ArrowLeft,
//   ArrowRight,
//   ClipboardListIcon,
//   CreditCardIcon,
//   FlaskConical,
//   MailIcon,
//   UserIcon,
// } from "lucide-react";
// import Image from "next/image";
// import React, { useState } from "react";
// import { ArrowRightIcon } from "@heroicons/react/24/outline";


// interface NavigationItem {
//   name: string;
//   href?: string;
//   icon?: React.ElementType;
//   current: boolean;
//   children?: (Omit<NavigationItem, "children"> & { icon?: React.ElementType })[];
// }

// // Navigation items definition
// const navigation: NavigationItem[] = [
//   { name: "Dashboard", href: "#", icon: HomeIcon, current: true },
//   {
//     name: "Lab Management",
//     icon: FlaskConical,
//     current: false,
//     children: [
//       { name: "Experiments", href: "#", current: false, icon: ClipboardListIcon },
//       { name: "Results", href: "#", current: false, icon: ClipboardListIcon },
//       { name: "Observations", href: "#", current: false, icon: FolderIcon },
//       { name: "Tests", href: "#", current: false, icon: ClipboardListIcon },
//       { name: "Packages", href: "#", current: false, icon: CreditCardIcon },
//     ],
//   },
//   {
//     name: "Technicians",
//     icon: UserGroupIcon,
//     current: false,
//     children: [
//       { name: "Add Technician", href: "#", current: false, icon: UserIcon },
//       { name: "Manage Technicians", href: "#", current: false, icon: ClipboardListIcon },
//     ],
//   },
//   {
//     name: "Inventory",
//     icon: ShoppingCartIcon,
//     current: false,
//     children: [
//       { name: "Supplies", href: "#", current: false, icon: FolderIcon },
//       { name: "Equipment", href: "#", current: false, icon: ClipboardListIcon },
//     ],
//   },
//   {
//     name: "Reports",
//     icon: DocumentTextIcon,
//     current: false,
//     children: [
//       { name: "Daily Reports", href: "#", current: false, icon: ClipboardListIcon },
//       { name: "Monthly Reports", href: "#", current: false, icon: ClipboardListIcon },
//       { name: "Annual Reports", href: "#", current: false, icon: ClipboardListIcon },
//     ],
//   },
//   {
//     name: "Billing",
//     icon: CreditCardIcon,
//     current: false,
//     children: [
//       { name: "Invoices", href: "#", current: false, icon: ClipboardListIcon },
//       { name: "Payments", href: "#", current: false, icon: ClipboardListIcon },
//     ],
//   },
//   {
//     name: "Settings",
//     icon: CogIcon,
//     current: false,
//     children: [
//       { name: "Profile", href: "#", current: false, icon: UserIcon },
//       { name: "Preferences", href: "#", current: false, icon: ClipboardListIcon },
//     ],
//   },
//   {
//     name: "Profile",
//     icon: UserIcon,
//     current: false,
//     children: [
//       { name: "Edit Profile", href: "#", current: false, icon: UserIcon },
//       { name: "Logout", href: "#", current: false, icon: ArrowRight }
//     ],
//   },

//   { name: "Logout", href: "#", icon: ArrowRight, current: false },

// ];


// interface LayoutProps {
//   children: React.ReactNode;
// }

// const Layout = ({ children }: LayoutProps) => {
//   const [isOpen, setIsOpen] = useState(true);

//   return (
//     <div className="flex h-screen bg-gray-50">
//       <aside
//         className={`fixed inset-y-0 left-0 z-30 bg-indigo-950 text-white shadow-lg transform transition-transform duration-300 ease-in-out ${isOpen ? "w-64" : "w-20"}`}
//       >
//         <div className="flex items-center justify-between px-4 py-4">
//           {isOpen ? (
//             <span className="text-lg font-semibold">
//               <Image src="/tiamed2.svg" alt="Company Logo" width={70} height={32} className="invert brightness-400" />
//             </span>
//           ) : (
//             <Image src="/tiamed2.svg" alt="Company Logo" width={50} height={32} className="invert brightness-400" />

//           )}
//           <button
//             onClick={() => setIsOpen(!isOpen)}
//             aria-label={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
//             className="p-2 hover:bg-indigo-900 rounded-md  bg-indigo-950"
//           >
//             {isOpen ? <ArrowLeft size={12} /> : <ArrowRight size={12} />}
//           </button>
//         </div>
//         <nav className="mt-4">
//           <ul className="space-y-2">
//             {navigation.map((item) => (
//               <li key={item.name}>
//                 {!item.children ? (
//                   <a
//                     href={item.href}
//                     className={clsx(
//                       item.current ? "bg-indigo-900" : "hover:bg-indigo-900",
//                       "flex items-center gap-x-4 px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200"
//                     )}
//                   >
//                     {item.icon && (
//                       <item.icon className="h-5 w-5" aria-hidden="true" />
//                     )}
//                     {isOpen && <span>{item.name}</span>}
//                   </a>
//                 ) : (
//                   <Disclosure as="div">
//                     {({ open }) => (
//                       <>
//                         <DisclosureButton
//                           className={clsx(
//                             item.current ? "bg-indigo-900" : "hover:bg-indigo-900",
//                             "flex items-center gap-x-4 px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200"
//                           )}
//                         >
//                           {item.icon && (
//                             <item.icon className="h-5 w-5" aria-hidden="true" />
//                           )}
//                           {isOpen && <span>{item.name}</span>}
//                           {isOpen && (
//                             <ChevronRightIcon
//                               className={clsx(
//                                 "ml-auto h-4 w-4 transition-transform duration-200",
//                                 { "rotate-90": open }
//                               )}
//                             />
//                           )}
//                         </DisclosureButton>
//                         {isOpen && open && (
//                           <DisclosurePanel as="ul" className="mt-1 ml-6 space-y-1">
//                             {item.children?.map((subItem) => (
//                               <li key={subItem.name}>
//                                 <a
//                                   href={subItem.href}
//                                   className="flex items-center gap-x-3 px-2 py-1 text-sm font-medium rounded-md hover:bg-indigo-900 transition-colors duration-200"
//                                 >
//                                   {subItem.icon && (
//                                     <subItem.icon className="h-4 w-4" aria-hidden="true" />
//                                   )}
//                                   <span>{subItem.name}</span>
//                                 </a>
//                               </li>
//                             ))}
//                           </DisclosurePanel>
//                         )}
//                       </>
//                     )}
//                   </Disclosure>
//                 )}
//               </li>
//             ))}
//           </ul>
//         </nav>
//       </aside>

//       {/* Main Content */}
//       <main className={`flex-1 px-6 mt-2 transition-all duration-400 ${isOpen ? "ml-64" : "ml-20"}`}>

//         <nav className="flex items-center justify-between p-4 border border-gray-300 bg-gradient-to-r from-white via-gray-100 to-gray-50 shadow-lg rounded-xl hover:shadow-2xl transition-all duration-300">
//           <div className="flex items-center space-x-4">
//             <div className="relative group">
//               <img
//                 src="/path/to/avatar.jpg"
//                 alt="Profile"
//                 className="h-12 w-12 rounded-full border-2 border-indigo-500 object-cover shadow-sm group-hover:shadow-md transition duration-300"
//               />
//               <div className="absolute -bottom-2 -right-2 h-4 w-4 bg-green-500 border-2 border-white rounded-full"></div>
//             </div>
//             <div className="flex flex-col space-y-1">
//               <h1 className="text-xl font-extrabold text-gray-900">Abhishek Kumar</h1>
//               <h2 className="flex items-center text-sm text-gray-600">
//                 <MailIcon className="h-4 w-4 mr-1 text-gray-500" aria-hidden="true" />
//                 abhishek@tiamed.com
//               </h2>
//               <h3 className="flex items-center text-sm font-medium text-gray-600">
//                 <UserGroupIcon className="h-4 w-4 mr-1 text-gray-500" aria-hidden="true" />
//                 Role: Admin
//               </h3>
//             </div>
//           </div>
//           <div className="flex gap-3">
//             <a href="/edit-profile" className="flex items-center px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition transform hover:scale-105">
//               <CogIcon className="h-5 w-5 mr-1" aria-hidden="true" />
//               Edit Profile
//             </a>
//             <a href="/logout" className="flex items-center px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-red-600 to-red-400 rounded-full hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition transform hover:scale-105">
//               <ArrowRightIcon className="h-5 w-5 mr-1" aria-hidden="true" />
//               Logout
//             </a>
//           </div>
//         </nav>

//         <div className="mt-6">
//           {children}
//         </div>


//       </main>
//     </div>
//   );
// }
// export default Layout;













"use client";

import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import {
  ChevronRightIcon,
  CogIcon,
  DocumentTextIcon,
  FolderIcon,
  HomeIcon,
  ShoppingCartIcon,
  UserGroupIcon
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import {
  ArrowLeft,
  ArrowRight,
  ClipboardListIcon,
  CreditCardIcon,
  FlaskConical,
  MailIcon,
  PowerIcon,
  UserIcon,
} from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";


interface NavigationItem {
  name: string;
  href?: string;
  icon?: React.ElementType;
  current: boolean;
  children?: (Omit<NavigationItem, "children"> & { icon?: React.ElementType })[];
}

// Navigation items definition
const navigation: NavigationItem[] = [
  { name: "Dashboard", href: "#", icon: HomeIcon, current: true },
  {
    name: "Lab Management",
    icon: FlaskConical,
    current: false,
    children: [
      { name: "Experiments", href: "#", current: false, icon: ClipboardListIcon },
      { name: "Results", href: "#", current: false, icon: ClipboardListIcon },
      { name: "Observations", href: "#", current: false, icon: FolderIcon },
      { name: "Tests", href: "#", current: false, icon: ClipboardListIcon },
      { name: "Packages", href: "#", current: false, icon: CreditCardIcon },
    ],
  },
  {
    name: "Technicians",
    icon: UserGroupIcon,
    current: false,
    children: [
      { name: "Add Technician", href: "#", current: false, icon: UserIcon },
      { name: "Manage Technicians", href: "#", current: false, icon: ClipboardListIcon },
    ],
  },
  {
    name: "Inventory",
    icon: ShoppingCartIcon,
    current: false,
    children: [
      { name: "Supplies", href: "#", current: false, icon: FolderIcon },
      { name: "Equipment", href: "#", current: false, icon: ClipboardListIcon },
    ],
  },
  {
    name: "Reports",
    icon: DocumentTextIcon,
    current: false,
    children: [
      { name: "Daily Reports", href: "#", current: false, icon: ClipboardListIcon },
      { name: "Monthly Reports", href: "#", current: false, icon: ClipboardListIcon },
      { name: "Annual Reports", href: "#", current: false, icon: ClipboardListIcon },
    ],
  },
  {
    name: "Billing",
    icon: CreditCardIcon,
    current: false,
    children: [
      { name: "Invoices", href: "#", current: false, icon: ClipboardListIcon },
      { name: "Payments", href: "#", current: false, icon: ClipboardListIcon },
    ],
  },
  {
    name: "Settings",
    icon: CogIcon,
    current: false,
    children: [
      { name: "Profile", href: "#", current: false, icon: UserIcon },
      { name: "Preferences", href: "#", current: false, icon: ClipboardListIcon },
    ],
  },
  {
    name: "Profile",
    icon: UserIcon,
    current: false,
    children: [
      { name: "Edit Profile", href: "#", current: false, icon: UserIcon },
      { name: "Logout", href: "#", current: false, icon: ArrowRight }
    ],
  },

  { name: "Logout", href: "#", icon: ArrowRight, current: false },

];

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gray-50">
      <aside
        className={`fixed inset-y-0 left-0 z-30 bg-indigo-950 text-white shadow-lg transform transition-transform duration-300 ease-in-out ${isOpen ? "w-64" : "w-20"}`}
      >
        <div className="flex items-center justify-between px-4 py-4">
          {isOpen ? (
            <span className="text-lg font-semibold">
              <Image src="/tiamed2.svg" alt="Company Logo" width={70} height={32} className="invert brightness-400" />
            </span>
          ) : (
            <Image src="/tiamed2.svg" alt="Company Logo" width={50} height={32} className="invert brightness-400" />
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
            className="p-2 hover:bg-indigo-900 rounded-md  bg-indigo-950"
          >
            {isOpen ? <ArrowLeft size={12} /> : <ArrowRight size={12} />}
          </button>
        </div>
        <nav className="mt-4 overflow-y-auto h-full">
          <ul className="space-y-2">
            {navigation.map((item) => (
              <li key={item.name}>
                {!item.children ? (
                  <a
                    href={item.href}
                    className={clsx(
                      item.current ? "bg-indigo-900" : "hover:bg-indigo-900",
                      "flex items-center gap-x-4 px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200"
                    )}
                  >
                    {item.icon && (
                      <item.icon className="h-5 w-5" aria-hidden="true" />
                    )}
                    {isOpen && <span>{item.name}</span>}
                  </a>
                ) : (
                  <Disclosure as="div">
                    {({ open }) => (
                      <>
                        <DisclosureButton
                          className={clsx(
                            item.current ? "bg-indigo-900" : "hover:bg-indigo-900",
                            "flex items-center gap-x-4 px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200"
                          )}
                        >
                          {item.icon && (
                            <item.icon className="h-5 w-5" aria-hidden="true" />
                          )}
                          {isOpen && <span>{item.name}</span>}
                          {isOpen && (
                            <ChevronRightIcon
                              className={clsx(
                                "ml-auto h-4 w-4 transition-transform duration-200",
                                { "rotate-90": open }
                              )}
                            />
                          )}
                        </DisclosureButton>
                        {isOpen && open && (
                          <DisclosurePanel as="ul" className="mt-1 ml-6 space-y-1">
                            {item.children?.map((subItem) => (
                              <li key={subItem.name}>
                                <a
                                  href={subItem.href}
                                  className="flex items-center gap-x-3 px-2 py-1 text-sm font-medium rounded-md hover:bg-indigo-900 transition-colors duration-200"
                                >
                                  {subItem.icon && (
                                    <subItem.icon className="h-4 w-4" aria-hidden="true" />
                                  )}
                                  <span>{subItem.name}</span>
                                </a>
                              </li>
                            ))}
                          </DisclosurePanel>
                        )}
                      </>
                    )}
                  </Disclosure>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 ml-20 transition-all duration-400 ${isOpen ? "ml-64" : "ml-20"}`}>

        {/* Top Navigation Bar */}
        {/* <nav className="flex items-center justify-between py-4 px-6 border-b border-gray-200 bg-white shadow-md rounded-lg">
          <div className="flex items-center space-x-4">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600">
              <span className="text-lg font-bold text-white">A</span>
            </span>
            <div className="flex flex-col">
              <h1 className="text-xl font-semibold text-gray-800">Abhishek Kumar</h1>
              <h2 className="flex items-center text-sm text-gray-500">
                <MailIcon className="h-4 w-4 mr-1 text-gray-400" aria-hidden="true" />
                abhishek@tiamed.com
              </h2>
              <h3 className="flex items-center text-sm text-gray-500">
                <UserIcon className="h-4 w-4 mr-1 text-gray-400" aria-hidden="true" />
                Role: Admin
              </h3>
            </div>
          </div>

          <div className="flex space-x-4">
            <button className="relative flex items-center justify-center w-10 h-10 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition duration-200">
              <UserIcon className="h-5 w-5" aria-hidden="true" />
              <span className="absolute left-1/2 transform -translate-x-1/2 -translate-y-full bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                Profile
              </span>
            </button>

            <button className="relative flex items-center justify-center w-10 h-10 text-white bg-red-600 rounded-md hover:bg-red-700 transition duration-200">
              <PowerIcon className="h-5 w-5" aria-hidden="true" />
              <span className="absolute left-1/2 transform -translate-x-1/2 -translate-y-full bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                Logout
              </span>
            </button>
          </div>
        </nav> */}



        <nav className="flex items-center justify-between py-2 px-6 border-b border-gray-200 bg-white shadow-md rounded">
          <div className="flex items-center space-x-4">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600">
              <span className="text-lg font-bold text-white">A</span>
            </span>
            <h1 className="text-xl font-semibold text-gray-800">Abhishek Kumar</h1>
            <h2 className="flex items-center text-sm text-gray-500">
              <MailIcon className="h-4 w-4 mr-1 text-gray-400" aria-hidden="true" />
              abhishek@tiamed.com
            </h2>
            <h3 className="flex items-center text-sm text-gray-500">
              <UserIcon className="h-4 w-4 mr-1 text-gray-400" aria-hidden="true" />
              Role: Admin
            </h3>
          </div>

          <div className="flex space-x-4 ml-auto">
            <button className="relative flex items-center text-white justify-center w-10 h-10 text-gray-700 bg-indigo-950 rounded-md hover:bg-indigo-900 transition duration-200">
              <UserIcon className="h-3 w-3" aria-hidden="true" />
              <span className="absolute left-1/2 transform -translate-x-1/2 -translate-y-full bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                Profile
              </span>
            </button>

            <button className="relative flex items-center justify-center w-10 h-10 text-white bg-red-600 rounded-md hover:bg-red-700 transition duration-200">
              <PowerIcon className="h-3 w-3" aria-hidden="true" />
              <span className="absolute left-1/2 transform -translate-x-1/2 -translate-y-full bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                Logout
              </span>
            </button>
          </div>
        </nav>



        {/* Main Content Area */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: "calc(100vh - 64px)" }}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
