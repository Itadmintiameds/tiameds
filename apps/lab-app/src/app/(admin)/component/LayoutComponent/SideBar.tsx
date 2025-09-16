import React from 'react';
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react";
import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, ArrowRight, ChevronRightIcon, Sparkles } from "lucide-react";
import { getNavigation } from "./Navigation";
import Button from '../common/Button';

interface SideBarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const SideBar = ({ isOpen, setIsOpen }: SideBarProps) => {
  const pathname = usePathname();
  const navigation = getNavigation(pathname);
  
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 bg-[#E1C4F8] shadow-2xl transform transition-all duration-300 ease-in-out flex flex-col ${isOpen ? "w-64" : "w-24"
        }`}
      style={{
        background: `linear-gradient(160deg, #E1C4F8 0%, #d1a8f5 100%)`
      }}
    >
      {/* Sidebar Header with Floating Effect */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-white/20 bg-[#E1C4F8] relative overflow-hidden">
        {/* Floating particles background */}
        <div className="absolute inset-0 opacity-10">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: `${Math.random() * 6 + 2}px`,
                height: `${Math.random() * 6 + 2}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animation: `float ${Math.random() * 10 + 10}s linear infinite`,
                animationDelay: `${Math.random() * 5}s`
              }}
            />
          ))}
        </div>

                {isOpen ? (
          <Link href="/" className="flex items-center space-x-2 group relative z-10">
            <div className="relative">
              <Image
                src="/LOGO.svg"
                alt="Company Logo"
                width={140}
                height={40}
                className="transition-all duration-300 group-hover:opacity-90 drop-shadow-lg"
              />
              <div className="absolute inset-0 bg-white mix-blend-overlay opacity-0 group-hover:opacity-10 rounded-md transition-opacity duration-300"></div>
            </div>
          </Link>
                 ) : (
                        <Link href="/" className="mx-auto group relative z-10 mr-2">
               <Image
                 src="/tiamed1.svg"
                 alt="TiaMeds"
                 width={56}
                 height={56}
                 className="transition-all duration-300 group-hover:scale-110 drop-shadow-sm"
               />
             </Link>
          )}
        <Button
          text=""
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          className="p-2 hover:bg-white/30 rounded-full transition-all duration-200 shadow-lg backdrop-blur-sm z-10 group relative overflow-hidden"
        // tooltip={!isOpen ? "Expand" : undefined}
        >
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-15 transition-opacity duration-300"></div>
          {isOpen ? (
            <ArrowLeft size={18} className="text-purple-950 group-hover:text-purple-800 transition-colors" />
          ) : (
            <ArrowRight size={18} className="text-purple-950 group-hover:text-purple-800 transition-colors" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 mt-2 overflow-y-auto overflow-x-hidden custom-scrollbar">
        <ul className="space-y-2 px-3 py-4">
          {navigation.map((item) => (
            <li key={item.name}>
              {!item.children ? (
                <Link
                  href={item.href ?? "#"}
                  className={clsx(
                    item.current
                      ? "bg-white/20 text-purple-900 shadow-md ring-1 ring-white/30"
                      : "text-purple-800 hover:bg-white/20 hover:text-purple-900",
                    "flex items-center gap-x-3 px-4 py-3 rounded-xl transition-all duration-200 group relative",
                    isOpen ? "justify-start" : "justify-center"
                  )}
                >
                  {item.current && (
                    <div className="absolute -left-1 top-0 w-1 h-full bg-gradient-to-b from-white to-purple-300 rounded-r-full"></div>
                  )}
                  {item.icon && (
                    <div className={clsx(
                      "p-1.5 rounded-lg transition-all duration-200 relative",
                      item.current
                        ? "bg-white/30 text-purple-900"
                        : "text-purple-700 group-hover:text-purple-900",
                      item.current && "shadow-white-glow"
                    )}>
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {item.current && (
                        <Sparkles className="absolute -right-1 -top-1 h-3 w-3 text-white animate-pulse" />
                      )}
                    </div>
                  )}
                  {isOpen && (
                    <span className="truncate font-medium transition-opacity duration-200">
                      {item.name}
                    </span>
                  )}
                  {!isOpen && (
                    <div className="absolute left-full ml-3 px-3 py-1.5 bg-white text-purple-900 text-sm font-medium rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-xl z-50 whitespace-nowrap">
                      {item.name}
                      <div className="absolute w-2 h-2 bg-white rotate-45 -left-1 top-1/2 -translate-y-1/2"></div>
                    </div>
                  )}
                </Link>
              ) : (
                <Disclosure as="div">
                  {({ open }) => (
                    <>
                      <DisclosureButton
                        className={clsx(
                          item.current
                            ? "bg-white/20 text-purple-900"
                            : "text-purple-800 hover:bg-white/20 hover:text-purple-900",
                          "flex items-center w-full gap-x-3 px-4 py-3 rounded-xl transition-all duration-200 group relative",
                          isOpen ? "justify-between" : "justify-center"
                        )}
                      >
                        {item.current && (
                          <div className="absolute -left-1 top-0 w-1 h-full bg-gradient-to-b from-white to-purple-300 rounded-r-full"></div>
                        )}
                        <div className="flex items-center gap-x-3">
                          {item.icon && (
                            <div className={clsx(
                              "p-1.5 rounded-lg transition-all duration-200",
                              item.current
                                ? "bg-white/30 text-purple-900"
                                : "text-purple-700 group-hover:text-purple-900"
                            )}>
                              <item.icon className="h-5 w-5 flex-shrink-0" />
                            </div>
                          )}
                          {isOpen && (
                            <span className="truncate font-medium">
                              {item.name}
                            </span>
                          )}
                          {!isOpen && (
                            <div className="absolute left-full ml-3 px-3 py-1.5 bg-white text-purple-900 text-sm font-medium rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-xl z-50 whitespace-nowrap">
                              {item.name}
                              <div className="absolute w-2 h-2 bg-white rotate-45 -left-1 top-1/2 -translate-y-1/2"></div>
                            </div>
                          )}
                        </div>
                        {isOpen && (
                          <ChevronRightIcon
                            className={clsx(
                              "h-4 w-4 flex-shrink-0 transition-transform duration-200",
                              open ? "rotate-90 transform text-purple-900" : "text-purple-700"
                            )}
                          />
                        )}
                      </DisclosureButton>
                      {isOpen && (
                        <DisclosurePanel
                          as="ul"
                          className="mt-2 ml-3 space-y-2 pl-7 border-l border-white/30"
                        >
                          {item.children?.map((subItem) => (
                            <li key={subItem.name}>
                              <Link
                                href={subItem.href ?? "#"}
                                className={clsx(
                                  subItem.current
                                    ? "text-purple-900 bg-white/20 ring-1 ring-white/30"
                                    : "text-purple-700 hover:text-purple-900 hover:bg-white/20",
                                  "flex items-center gap-x-3 px-3 py-2.5 text-sm rounded-lg transition-all duration-200 group"
                                )}
                              >
                                {subItem.icon && (
                                  <subItem.icon className="h-4 w-4 flex-shrink-0 text-purple-800/80 group-hover:text-purple-900" />
                                )}
                                <span className="truncate">{subItem.name}</span>
                                {subItem.current && (
                                  <Sparkles className="ml-auto h-3 w-3 text-white animate-pulse" />
                                )}
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

      {/* Sidebar Footer */}
      <div className={clsx(
        "p-4 border-t border-white/20 bg-[#E1C4F8]/80 transition-all duration-300 backdrop-blur-sm",
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )}>
        <div className="flex flex-col items-center">
          <div className="text-xs text-purple-900/80 mb-1 font-mono flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-purple-900 animate-pulse"></span>
            v2.0.0
          </div>
          <div className="text-[10px] text-purple-900/60 tracking-wider">
            © {new Date().getFullYear()} TiaMeds Labs
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.4);
          border-radius: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.6);
        }
        .shadow-white-glow {
          box-shadow: 0 0 10px rgba(255, 255, 255, 0.4);
        }
        @keyframes float {
          0% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-20px) translateX(5px); }
          100% { transform: translateY(0) translateX(0); }
        }
      `}</style>
    </aside>
  );
};

export default SideBar;


