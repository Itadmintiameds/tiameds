
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
        <div className="flex items-center justify-between p-4 border-b border-gray-300 bg-white shadow-md rounded-lg">
          <div className="flex items-center space-x-4">
            {/* Profile Icon with Initial */}
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-500">
              <span className="text-lg font-semibold text-white">A</span>
            </span>
            <div className="flex flex-col space-y-1">
              <h1 className="text-xl font-bold text-gray-900">Abhishek Kumar</h1>
              <h2 className="flex items-center text-sm text-gray-700">
                <MailIcon className="h-4 w-4 mr-1 text-gray-500" aria-hidden="true" />
                abhishek@tiamed.com
              </h2>
              <h3 className="flex items-center text-sm font-medium text-gray-600">
                <UserGroupIcon className="h-4 w-4 mr-1 text-gray-500" aria-hidden="true" />
                Role: Admin
              </h3>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-100 rounded-md hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition duration-200 ease-in-out">
              <CogIcon className="h-4 w-4 mr-1" aria-hidden="true" />
              Edit Profile
            </button>
            <button className="flex items-center px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition duration-200 ease-in-out">
              <ArrowRight className="h-4 w-4 mr-1" aria-hidden="true" />
              Logout
            </button>
          </div>
        </div>

        <div className="mt-6 ">
          {children}
        </div>
      </main>
    </div>
  );
}
export default Layout;