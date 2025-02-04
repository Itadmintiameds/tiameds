import React from 'react'
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react";
import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ChevronRightIcon } from "lucide-react";
import { navigation } from "./Navigation";
import Button from '../common/Button';

interface SideBarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const SideBar = ({isOpen,setIsOpen}: SideBarProps) => {
  return (
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
      <Button
        text=''
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
        className="p-1 hover:bg-secondary rounded-md bg-primarylight transition-colors duration-200 "
      >
        {isOpen ? <ArrowLeft size={8} /> : <ArrowRight size={8} />}
      </Button>
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
  )
}

export default SideBar