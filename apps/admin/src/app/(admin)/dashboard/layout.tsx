// "use client";

// import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react";
// import { ChevronRightIcon, UserGroupIcon } from "@heroicons/react/20/solid";
// import {
//   CalendarIcon,
//   ChartPieIcon,
//   DocumentDuplicateIcon,
//   HomeIcon
// } from "@heroicons/react/24/outline";
// import clsx from "clsx";
// import { ArrowLeft, ArrowRight, ClipboardListIcon, CreditCardIcon, FlaskConical, UserIcon } from "lucide-react";
// import React, { useState } from "react";

// interface NavigationItem {
//   name: string;
//   href?: string;
//   icon?: React.ElementType;
//   current: boolean;
//   children?: (Omit<NavigationItem, "children"> & { icon?: React.ElementType })[];
// }

// const navigation: NavigationItem[] = [
//   { name: "Dashboard", href: "#", icon: HomeIcon, current: true },
//   {
//     name: "Lab Management",
//     icon: FlaskConical,
//     current: false,
//     children: [
//       { name: "Experiments", href: "#", current: false, icon: ClipboardListIcon },
//       { name: "Results", href: "#", current: false, icon: DocumentDuplicateIcon },
//       { name: "Observations", href: "#", current: false, icon: CalendarIcon },
//       { name: "Tests", href: "#", current: false, icon: ClipboardListIcon },
//       { name: "Packages", href: "#", current: false, icon: DocumentDuplicateIcon },
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
//     name: "Doctors",
//     icon: UserIcon,
//     current: false,
//     children: [
//       { name: "Add Doctor", href: "#", current: false, icon: UserIcon },
//       { name: "Manage Doctors", href: "#", current: false, icon: ClipboardListIcon },
//     ],
//   },
//   {
//     name: "Reports",
//     icon: ChartPieIcon,
//     current: false,
//     children: [
//       { name: "Generate Report", href: "#", current: false, icon: DocumentDuplicateIcon },
//       { name: "View Reports", href: "#", current: false, icon: CalendarIcon },
//       { name: "Download Report", href: "#", current: false, icon: ClipboardListIcon },
//     ],
//   },
//   {
//     name: "Appointments",
//     icon: CalendarIcon,
//     current: false,
//     children: [
//       { name: "Schedule Appointment", href: "#", current: false, icon: ClipboardListIcon },
//       { name: "Manage Appointments", href: "#", current: false, icon: CalendarIcon },
//     ],
//   },
//   {
//     name: "Test Management",
//     icon: ClipboardListIcon,
//     current: false,
//     children: [
//       { name: "Add Test", href: "#", current: false, icon: ClipboardListIcon },
//       { name: "Manage Tests", href: "#", current: false, icon: DocumentDuplicateIcon },
//     ],
//   },
//   {
//     name: "Documents",
//     icon: DocumentDuplicateIcon,
//     current: false,
//     children: [
//       { name: "Upload Documents", href: "#", current: false, icon: ClipboardListIcon },
//       { name: "View Documents", href: "#", current: false, icon: DocumentDuplicateIcon },
//     ],
//   },
//   {
//     name: "Billing",
//     icon: CreditCardIcon,
//     current: false,
//     children: [
//       { name: "Generate Invoice", href: "#", current: false, icon: DocumentDuplicateIcon },
//       { name: "Payment History", href: "#", current: false, icon: CreditCardIcon },
//     ],
//   },
// ];

// export default function Sidebar() {
//   const [isOpen, setIsOpen] = useState(false); // State to manage sidebar visibility

//   return (
//     <div className="flex h-screen">
//       {/* Sidebar */}
//       <div
//         className={`fixed inset-y-0 left-0 z-30 w-64 bg-purple-950 border-r border-gray-200 shadow-lg transform transition-transform duration-300 ease-in-out ${
//           isOpen ? "translate-x-0" : "-translate-x-full"
//         }`}
//       >
//         <div className="flex h-16 items-center px-6">
//           {/* Placeholder for logo */}
//         </div>
//         <nav className="flex flex-1 flex-col">
//           <ul role="list" className="flex flex-1 flex-col gap-y-3">
//             {navigation.map((item) => (
//               <li key={item.name}>
//                 {!item.children ? (
//                   <a
//                     href={item.href}
//                     className={clsx(
//                       item.current ? "bg-purple-800" : "hover:bg-purple-900",
//                       "group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-zinc-100"
//                     )}
//                   >
//                     {item.icon && <item.icon aria-hidden="true" className="h-6 w-6 shrink-0 text-zinc-100" />}
//                     {item.name}
//                   </a>
//                 ) : (
//                   <Disclosure as="div">
//                     <DisclosureButton
//                       className={clsx(
//                         item.current ? "bg-gray-50" : "hover:bg-purple-900",
//                         "group flex w-full items-center gap-x-3 rounded-md p-2 text-left text-sm/6 font-semibold text-zinc-100"
//                       )}
//                     >
//                       {item.icon && <item.icon aria-hidden="true" className="h-6 w-6 shrink-0 text-zinc-100" />}
//                       {item.name}
//                       <ChevronRightIcon
//                         aria-hidden="true"
//                         className="ml-auto h-5 w-5 shrink-0 text-gray-400 group-data-[open]:rotate-90 group-data-[open]:text-gray-500"
//                       />
//                     </DisclosureButton>
//                     <DisclosurePanel as="ul" className="mt-1 px-2">
//                       {item.children.map((subItem) => (
//                         <li key={subItem.name}>
//                           <DisclosureButton
//                             as="a"
//                             href={subItem.href}
//                             className={clsx(
//                               subItem.current ? "bg-gray-50" : "hover:bg-purple-900",
//                               "flex items-center gap-x-3 block rounded-md py-2 pl-9 pr-2 text-sm/6 text-zinc-100"
//                             )}
//                           >
//                             {subItem.icon && (
//                               <subItem.icon aria-hidden="true" className="h-5 w-5 text-zinc-100 mr-2" />
//                             )}
//                             {subItem.name}
//                           </DisclosureButton>
//                         </li>
//                       ))}
//                     </DisclosurePanel>
//                   </Disclosure>
//                 )}
//               </li>
//             ))}
//           </ul>
//           <li className="-mx-6">
//             <a
//               href="#"
//               className="flex items-center gap-x-4 px-6 py-3 text-sm/6 font-semibold text-zinc-100 hover:bg-purple-900"
//             >
//               <span className="inline-block h-8 w-8 overflow-hidden rounded-full bg-gray-100">
//                 <svg fill="currentColor" viewBox="0 0 24 24" className="h-full w-full text-gray-300">
//                   <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
//                 </svg>
//               </span>
//               <span className="sr-only">Your profile</span>
//               <span aria-hidden="true">Tom Cook</span>
//             </a>
//           </li>
//         </nav>
//       </div>

//       {/* Main Content Area */}
//       <div className={`flex-1 p-6 transition-all duration-300 ease-in-out ${isOpen ? "ml-64" : "ml-0"}`}>
//         <button
//           onClick={() => setIsOpen(!isOpen)}
//           className="mb-4 p-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors duration-200"
//           aria-label={isOpen ? "Close Sidebar" : "Open Sidebar"}
//         >
//           {isOpen ? <ArrowLeft size={24} /> : <ArrowRight size={24} />}
//         </button>
//         <div className="flex-1 bg-white shadow-lg p-4 rounded-lg overflow-hidden">
//           <h1 className="text-xl font-bold">Main Content</h1>
//         </div>
//       </div>
//     </div>
//   );
// }

// ===========================================
// "use client";

// import {
//   Disclosure,
//   DisclosureButton,
//   DisclosurePanel,
// } from "@headlessui/react";
// import {
//   ChevronRightIcon,
//   UserGroupIcon,
//   HomeIcon,
//   CogIcon,
//   FolderIcon,
//   ShoppingCartIcon,
//   QuestionMarkCircleIcon,
// } from "@heroicons/react/24/outline";
// import {
//   ArrowLeft,
//   ArrowRight,
//   ClipboardListIcon,
//   CreditCardIcon,
//   FlaskConical,
//   UserIcon,
// } from "lucide-react";
// import React, { useState } from "react";
// import clsx from "clsx";

// interface NavigationItem {
//   name: string;
//   href?: string;
//   icon?: React.ElementType;
//   current: boolean;
//   children?: (Omit<NavigationItem, "children"> & { icon?: React.ElementType })[];
// }

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
//     icon: ChevronRightIcon,
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
//     name: "Help",
//     icon: QuestionMarkCircleIcon,
//     current: false,
//     href: "#",
//   },
// ];

// export default function Sidebar() {
//   const [isOpen, setIsOpen] = useState(true);

//   return (
//     <div className="flex h-screen bg-gray-50">
//       <aside
//         className={`fixed inset-y-0 left-0 z-30 bg-gray-800 text-white shadow-lg transform transition-transform duration-300 ease-in-out ${
//           isOpen ? "w-64" : "w-20"
//         }`}
//       >
//         <div className="flex items-center justify-between px-4 py-4">
//           {isOpen && <span className="text-lg font-semibold">Brand Logo</span>}
//           <button
//             onClick={() => setIsOpen(!isOpen)}
//             aria-label={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
//             className="p-2 hover:bg-gray-700 rounded-md"
//           >
//             {isOpen ? <ArrowLeft size={20} /> : <ArrowRight size={20} />}
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
//                       item.current ? "bg-gray-700" : "hover:bg-gray-600",
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
//                             item.current ? "bg-gray-700" : "hover:bg-gray-600",
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
//                             {item.children.map((subItem) => (
//                               <li key={subItem.name}>
//                                 <a
//                                   href={subItem.href}
//                                   className="flex items-center gap-x-3 px-2 py-1 text-sm font-medium rounded-md hover:bg-gray-600 transition-colors duration-200"
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
//       <main className={`flex-1 p-6 transition-all duration-300 ${isOpen ? "ml-64" : "ml-20"}`}>
//         <h1 className="text-2xl font-bold text-gray-800 mb-6">Main Content</h1>
//         {/* Main content goes here */}
//       </main>
//     </div>
//   );
// }


// ========================

"use client";

import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import {
  ChevronRightIcon,
  UserGroupIcon,
  HomeIcon,
  CogIcon,
  FolderIcon,
  ShoppingCartIcon,
  QuestionMarkCircleIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import {
  ArrowLeft,
  ArrowRight,
  ClipboardListIcon,
  CreditCardIcon,
  FlaskConical,
  UserIcon,
} from "lucide-react";
import React, { useState } from "react";
import clsx from "clsx";
import Image from "next/image";

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
    name: "Help",
    icon: QuestionMarkCircleIcon,
    current: false,
    href: "#",
  },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gray-50">
      <aside
        className={`fixed inset-y-0 left-0 z-30 bg-indigo-950 text-white shadow-lg transform transition-transform duration-300 ease-in-out ${isOpen ? "w-64" : "w-20"}`}
      >
        <div className="flex items-center justify-between px-4 py-4">
          {isOpen ? (
            <span className="text-lg font-semibold">
              <Image src="/tiamed.svg" alt="Company Logo" width={32} height={32} />
            </span>
          ) : (
            <Image src="/tiamed.svg" alt="Company Logo" width={32} height={32} />
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
            className="p-2 hover:bg-indigo-900 rounded-md"
          >
            {isOpen ? <ArrowLeft size={20} /> : <ArrowRight size={20} />}
          </button>
        </div>
        <nav className="mt-4">
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
      <main className={`flex-1 p-6 transition-all duration-300 ${isOpen ? "ml-64" : "ml-20"}`}>
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Main Content</h1>
        {/* Main content goes here */}
      </main>
    </div>
  );
}
