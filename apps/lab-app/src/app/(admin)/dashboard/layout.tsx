"use client";

import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react";

import { ChevronRightIcon, CogIcon, DocumentTextIcon, FolderIcon, HomeIcon, ShoppingCartIcon, UserGroupIcon } from "@heroicons/react/24/outline";

import clsx from "clsx";

import { getUsersLab } from "@/../services/labServices";
import { useLabs } from '@/context/LabContext';
import { NavigationItem } from "@/types/NavigationItem";
import { ArrowLeft, ArrowRight, ClipboardListIcon, CreditCardIcon, FlaskConical, MailIcon, PowerIcon, UserIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { AiOutlineSafetyCertificate } from "react-icons/ai";
import { toast } from "react-toastify";
import useUserStore from "../../../context/userStore";
import CurrentTime from "../component/common/CurrentTime";
import Lab from "../component/lab/Lab";
import { FaUserDoctor } from "react-icons/fa6";
import { PiPackageFill } from "react-icons/pi";





const navigation: NavigationItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: HomeIcon, current: true },
  {
    name: "Lab Management",
    icon: FlaskConical,
    current: false,
    children: [
      { name: "Tests", href: "/dashboard/test", current: false, icon: ClipboardListIcon },
      { name: "Packages", href: "/dashboard/package", current: false, icon: PiPackageFill },
      { name: "Doctors", href: "/dashboard/doctor", current: false, icon: FaUserDoctor },
      { name: "Insurance", href: "/dashboard/insurance", current: false, icon: AiOutlineSafetyCertificate },
      { name: "Appointments", href: "#", current: false, icon: UserIcon },
      { name: "Reports", href: "#", current: false, icon: DocumentTextIcon },
      { name: "Sample Collection", href: "/dashboard/sample", current: false, icon: ClipboardListIcon },
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
      { name: "Profile", href: "dashboard/profile", current: false, icon: UserIcon },
      { name: "Preferences", href: "#", current: false, icon: ClipboardListIcon },
      { name: "Lab", href: "/dashboard/lab", current: false, icon: FlaskConical },
    ],
  },
  {
    name: "Profile",
    icon: UserIcon,
    current: false,
    children: [
      { name: "Edit Profile", href: "/dashboard/profile", current: false, icon: UserIcon },
      { name: "Logout", href: "#", current: false, icon: ArrowRight }
    ],
  },

  // { name: "Logout", href: "#", icon: ArrowRight, current: false },

];

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const { user, initializeUser } = useUserStore();
  const { labs, setLabs, currentLab, setCurrentLab } = useLabs();


  useEffect(() => {
    initializeUser();

    const fetchLabs = async () => {
      try {
        // const labs = await getLabs();
        // setLabs(labs);
        const data = await getUsersLab();
        setLabs(data);
        //by default set the first lab as current lab
        if (data.length > 0) {
          setCurrentLab(data[0]);
        }
      } catch (error) {
        toast.error("Failed to fetch labs", { position: "top-right", autoClose: 2000 });
      }
    };
    fetchLabs();
  }, []);


  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLabName = event.target.value;
    const selectedLab = labs.find((lab) => lab.name === selectedLabName);
    if (selectedLab) {
      setCurrentLab(selectedLab);
      toast.success(`Switched to ${selectedLab.name}`, { position: "top-right", autoClose: 2000 });
    }
  };

  return (
    <div className="flex h-screen ">
      <aside
        className={`fixed inset-y-0 left-0 z-30 bg-primary text-white shadow-lg transform transition-transform duration-300 ease-in-out ${isOpen ? "w-64" : "w-20"}`}
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
            className="p-2 hover:bg-secondary rounded-md bg-primarylight transition-colors duration-200"
          >
            {isOpen ? <ArrowLeft size={12} /> : <ArrowRight size={12} />}
          </button>
        </div>
        <nav className="mt-4 overflow-y-auto h-full">
          <ul className="space-y-2">
            {navigation.map((item) => (
              <li key={item.name}>
                {!item.children ? (
                  <Link
                    href={item.href ?? "#"}
                    className={clsx(
                      item.current ? "bg-primarylight" : "hover:bg-tertiary",
                      "flex items-center gap-x-4 px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200"
                    )}
                  >
                    {item.icon && (
                      <item.icon className="h-5 w-5" aria-hidden="true" />
                    )}
                    {isOpen && <span>{item.name}</span>}
                  </Link>
                ) : (
                  <Disclosure as="div">
                    {({ open }) => (
                      <>
                        <DisclosureButton
                          className={clsx(
                            item.current ? "bg-primary" : "hover:bg-primarylight w-full",
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
                                <Link
                                  href={subItem.href ?? "#"}
                                  className="flex items-center gap-x-3 px-2 py-1 text-sm font-medium rounded-md hover:bg-primarylight transition-colors duration-200"
                                >
                                  {subItem.icon && (
                                    <subItem.icon className="h-4 w-4" aria-hidden="true" />
                                  )}
                                  <span>{subItem.name}</span>
                                </Link>
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
        <nav className="flex items-center justify-between py-2 px-6 border-b border-gray-200 bg-white shadow-md rounded">
          <div className="flex items-center space-x-4">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
              <span className="text-lg font-bold text-white">{user?.firstName[0].toUpperCase()}</span>
            </span>
            <h1 className="text-sm font-semibold text-gray-800">
              {user?.firstName.toUpperCase()} {user?.lastName.toUpperCase()}
            </h1>
            <h2 className="flex items-center text-sm text-gray-500">
              <MailIcon className="h-4 w-4 mr-1 text-primary" aria-hidden="true" />
              <span className="text-xs font-semibold text-gray-100 ml-2 bg-primary rounded-full px-2 py-1">
                {user?.email}
              </span>
            </h2>
            <h3 className="flex items-center text-xs text-gray-500">
              <UserIcon className="h-4 w-4 mr-1 text-primary" aria-hidden="true" />

              <select className="text-xs font-semibold text-gray-100 bg-primary rounded-full px-2 py-1 ml-2">
                {user?.roles.map((role, index) => (
                  <option key={index} value={role} >
                    {role}
                  </option>
                ))}
              </select>

              {/* current lab */}
              <span className="text-xs font-semibold text-gray-100 ml-2 bg-primary rounded-full px-2 py-1">
                {currentLab?.name}
              </span>

              {/* current date */}
              <span className="text-xs font-semibold text-gray-100 ml-2 bg-primary rounded-full px-2 py-1">
                {new Date().toDateString()}
              </span>

              {/* current time  */}
              <CurrentTime />
            </h3>
          </div>

          <div className="flex items-center space-x-2 ml-auto">
            {labs && (
              <select
                className="text-sm text-gray-100 bg-primary border border-gray-700 px-12 py-1.5 rounded-md shadow-sm focus:ring-2 focus:ring-primary focus:outline-none transition duration-200 hover:bg-opacity-90"
                onChange={handleChange}
                defaultValue=""
              >
                <option value="" disabled>
                  Select Lab
                </option>
                {labs.map((lab) => (
                  <option key={lab.id} value={lab.name}>
                    {lab.name}
                  </option>
                ))}
              </select>
            )}
            <button
              className="relative group flex items-center justify-center w-10 h-10 text-white bg-red-500 rounded-full shadow-md hover:bg-red-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
              onClick={() => {
                toast.success("Logged out successfully", {
                  position: "top-right",
                  autoClose: 2000,
                });
                localStorage.removeItem("user");
                document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                window.location.href = "/login";
              }}
              aria-label="Logout"
            >
              <PowerIcon className="w-5 h-5" aria-hidden="true" />
              <span className="absolute left-1/2 bottom-full mb-1 transform -translate-x-1/2 whitespace-nowrap bg-gray-800 text-white text-xs rounded px-1.5 py-0.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100 shadow">
                Logout
              </span>
            </button>
          </div>


        </nav>

        <div className="p-6 overflow-y-auto" style={{ maxHeight: "calc(100vh - 64px)" }}>
          {
            labs == null ? (<Lab />)
              :
              (
                <div className="relative isolate bg-white h-screen ">
                  <div
                    aria-hidden="true"
                    className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80 animate-gradient-flow"
                  >
                    <div
                      style={{
                        clipPath:
                          'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                      }}
                      className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
                    />
                  </div>
                  <div className="relative z-10 max-w-full mx-auto ">
                    {children}
                  </div>
                </div>
              )
          }

        </div>
      </main>
    </div>
  );
};

export default Layout;
