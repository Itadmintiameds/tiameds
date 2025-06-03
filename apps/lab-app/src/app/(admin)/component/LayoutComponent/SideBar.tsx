// import React from 'react'
// import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react";
// import clsx from "clsx";
// import Image from "next/image";
// import Link from "next/link";
// import { ArrowLeft, ArrowRight, ChevronRightIcon } from "lucide-react";
// import { navigation } from "./Navigation";
// import Button from '../common/Button';

// interface SideBarProps {
//   isOpen: boolean;
//   setIsOpen: (isOpen: boolean) => void;
// }

// const SideBar = ({ isOpen, setIsOpen }: SideBarProps) => {
//   return (
//     <aside
//       className={`fixed inset-y-0 left-0 z-30 bg-primary text-textzinc shadow-lg transform transition-transform duration-300 ease-in-out ${isOpen ? "w-64" : "w-20"}`}
//     >
//       <div className="flex items-center justify-between px-4 py-4">
//         {isOpen ? (
//           <span className="text-lg font-semibold">
//             <Image src="/LOGO.svg" alt="Company Logo" width={140} height={100} />
//           </span>
//         ) : (
//           <Image src="/LOGO.svg" alt="Company Logo" width={40} height={100} />
//         )}
//         <Button
//           text=''
//           onClick={() => setIsOpen(!isOpen)}
//           aria-label={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
//           className="p-2 hover:bg-secondary rounded-md bg-primarylight transition-colors duration-200 "
//         >
//           {isOpen ? <ArrowLeft size={8} /> : <ArrowRight size={8} />}
//         </Button>
//       </div>
//       <nav className="mt-4 overflow-y-auto h-full">
//         <ul className="space-y-2">
//           {navigation.map((item) => (
//             <li key={item.name}>
//               {!item.children ? (
//                 <Link
//                   href={item.href ?? "#"}
//                   className={clsx(
//                     item.current ? "bg-primarylight" : "hover:bg-tertiary",
//                     "flex items-center gap-x-4 px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200"
//                   )}
//                 >
//                   {item.icon && (
//                     <item.icon className="h-5 w-5" aria-hidden="true" />
//                   )}
//                   {isOpen && <span>{item.name}</span>}
//                 </Link>
//               ) : (
//                 <Disclosure as="div">
//                   {({ open }) => (
//                     <>
//                       <DisclosureButton
//                         className={clsx(
//                           item.current ? "bg-primary" : "hover:bg-primarylight w-full",
//                           "flex items-center gap-x-4 px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200"
//                         )}
//                       >
//                         {item.icon && (
//                           <item.icon className="h-5 w-5" aria-hidden="true" />
//                         )}
//                         {isOpen && <span>{item.name}</span>}
//                         {isOpen && (
//                           <ChevronRightIcon
//                             className={clsx(
//                               "ml-auto h-4 w-4 transition-transform duration-200",
//                               { "rotate-90": open }
//                             )}
//                           />
//                         )}
//                       </DisclosureButton>
//                       {isOpen && open && (
//                         <DisclosurePanel as="ul" className="mt-1 ml-6 space-y-1">
//                           {item.children?.map((subItem) => (
//                             <li key={subItem.name}>
//                               <Link
//                                 href={subItem.href ?? "#"}
//                                 className="flex items-center gap-x-3 px-2 py-1 text-sm font-medium rounded-md hover:bg-primarylight transition-colors duration-200"
//                               >
//                                 {subItem.icon && (
//                                   <subItem.icon className="h-4 w-4" aria-hidden="true" />
//                                 )}
//                                 <span>{subItem.name}</span>
//                               </Link>
//                             </li>
//                           ))}
//                         </DisclosurePanel>
//                       )}
//                     </>
//                   )}
//                 </Disclosure>
//               )}
//             </li>
//           ))}
//         </ul>
//       </nav>
//     </aside>
//   )
// }

// export default SideBar







// import React from 'react';
// import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react";
// import clsx from "clsx";
// import Image from "next/image";
// import Link from "next/link";
// import { ArrowLeft, ArrowRight, ChevronRightIcon } from "lucide-react";
// import { navigation } from "./Navigation";
// import Button from '../common/Button';

// interface SideBarProps {
//   isOpen: boolean;
//   setIsOpen: (isOpen: boolean) => void;
// }

// const SideBar = ({ isOpen, setIsOpen }: SideBarProps) => {
//   return (
//     <aside
//       className={`fixed inset-y-0 left-0 z-30 bg-primary shadow-xl transform transition-all duration-300 ease-in-out ${
//         isOpen ? "w-64" : "w-20"
//       }`}
//     >
//       {/* Sidebar Header */}
//       <div className="flex items-center justify-between px-4 py-5 border-b border-white/10">
//         {isOpen ? (
//           <div className="flex items-center space-x-2">
//             <Image 
//               src="/LOGO.svg" 
//               alt="Company Logo" 
//               width={140} 
//               height={40} 
//               className="transition-opacity duration-300"
//             />
//           </div>
//         ) : (
//           <Image 
//             src="/LOGO.svg" 
//             alt="Company Logo" 
//             width={40} 
//             height={40} 
//             className="mx-auto transition-opacity duration-300"
//           />
//         )}
//         <Button
//           text=""
//           onClick={() => setIsOpen(!isOpen)}
//           aria-label={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
//           className="p-2 hover:bg-white/10 rounded-full transition-all duration-200 shadow-md"
//           // tooltip={isOpen ? "Collapse" : "Expand"}
//         >
//           {isOpen ? (
//             <ArrowLeft size={16} className="text-zinc-900" />
//           ) : (
//             <ArrowRight size={16} className="text-zinc-900" />
//           )}
//         </Button>
//       </div>

//       {/* Navigation */}
//       <nav className="mt-6 overflow-y-auto h-[calc(100vh-80px)]">
//         <ul className="space-y-1 px-2">
//           {navigation.map((item) => (
//             <li key={item.name}>
//               {!item.children ? (
//                 <Link
//                   href={item.href ?? "#"}
//                   className={clsx(
//                     item.current 
//                       ? "bg-white/10 text-zinc-900 shadow-md" 
//                       : "text-zinc-950/80 hover:bg-white/5 hover:text-zinc-950",
//                     "flex items-center gap-x-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200",
//                     isOpen ? "justify-start" : "justify-center"
//                   )}
//                 >
//                   {item.icon && (
//                     <item.icon 
//                       className={clsx(
//                         "h-5 w-5 flex-shrink-0",
//                         item.current ? "text-zinc-950" : "text-zinc-950/80"
//                       )} 
//                       aria-hidden="true" 
//                     />
//                   )}
//                   {isOpen && (
//                     <span className="truncate transition-opacity duration-200">
//                       {item.name}
//                     </span>
//                   )}
//                 </Link>
//               ) : (
//                 <Disclosure as="div">
//                   {({ open }) => (
//                     <>
//                       <DisclosureButton
//                         className={clsx(
//                           item.current 
//                             ? "bg-white/10 text-zinc-950" 
//                             : "text-zinc-950/80 hover:bg-white/5 hover:text-zinc-950",
//                           "flex items-center w-full gap-x-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200",
//                           isOpen ? "justify-between" : "justify-center"
//                         )}
//                       >
//                         <div className="flex items-center gap-x-3">
//                           {item.icon && (
//                             <item.icon 
//                               className={clsx(
//                                 "h-5 w-5 flex-shrink-0",
//                                 item.current ? "text-zinc-950" : "text-zinc-950/80"
//                               )} 
//                               aria-hidden="true" 
//                             />
//                           )}
//                           {isOpen && (
//                             <span className="truncate transition-opacity duration-200">
//                               {item.name}
//                             </span>
//                           )}
//                         </div>
//                         {isOpen && (
//                           <ChevronRightIcon
//                             className={clsx(
//                               "h-4 w-4 flex-shrink-0 transition-transform duration-200 text-zinc-950/80",
//                               { "rotate-90 transform": open }
//                             )}
//                           />
//                         )}
//                       </DisclosureButton>
//                       {isOpen && open && (
//                         <DisclosurePanel 
//                           as="ul" 
//                           className="mt-1 ml-2 space-y-1 pl-7 border-l border-white/10"
//                         >
//                           {item.children?.map((subItem) => (
//                             <li key={subItem.name}>
//                               <Link
//                                 href={subItem.href ?? "#"}
//                                 className={clsx(
//                                   subItem.current 
//                                     ? "bg-white/10 text-zinc-950" 
//                                     : "text-zinc-950/60 hover:bg-white/5 hover:text-zinc-950",
//                                   "flex items-center gap-x-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200"
//                                 )}
//                               >
//                                 {subItem.icon && (
//                                   <subItem.icon 
//                                     className="h-4 w-4 flex-shrink-0 text-zinc-950/60" 
//                                     aria-hidden="true" 
//                                   />
//                                 )}
//                                 <span className="truncate">{subItem.name}</span>
//                               </Link>
//                             </li>
//                           ))}
//                         </DisclosurePanel>
//                       )}
//                     </>
//                   )}
//                 </Disclosure>
//               )}
//             </li>
//           ))}
//         </ul>
//       </nav>

//       {/* Sidebar Footer (optional) */}
//       {isOpen && (
//         <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
//           <div className="text-xs text-zinc-950/60 text-center">
//             v1.0.0
//           </div>
//         </div>
//       )}
//     </aside>
//   );
// };

// export default SideBar;









// import React from 'react';
// import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react";
// import clsx from "clsx";
// import Image from "next/image";
// import Link from "next/link";
// import { ArrowLeft, ArrowRight, ChevronRightIcon } from "lucide-react";
// import { navigation } from "./Navigation";
// import Button from '../common/Button';

// interface SideBarProps {
//   isOpen: boolean;
//   setIsOpen: (isOpen: boolean) => void;
// }

// const SideBar = ({ isOpen, setIsOpen }: SideBarProps) => {
//   return (
//     <aside
//       className={`fixed inset-y-0 left-0 z-30 bg-primary shadow-xl transform transition-all duration-300 ease-in-out flex flex-col ${
//         isOpen ? "w-64" : "w-20"
//       }`}
//     >
//       {/* Sidebar Header */}
//       <div className="flex items-center justify-between px-4 py-5 border-b border-white/20">
//         {isOpen ? (
//           <Link href="/" className="flex items-center space-x-2 group">
//             <Image 
//               src="/LOGO.svg" 
//               alt="Company Logo" 
//               width={140} 
//               height={40} 
//               className="transition-all duration-300 group-hover:opacity-90"
//             />
//           </Link>
//         ) : (
//           <Link href="/" className="mx-auto group">
//             <Image 
//               src="/LOGO.svg" 
//               alt="Company Logo" 
//               width={40} 
//               height={40} 
//               className="transition-all duration-300 group-hover:opacity-90"
//             />
//           </Link>
//         )}
//         <Button
//           text=""
//           onClick={() => setIsOpen(!isOpen)}
//           aria-label={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
//           className="p-2 hover:bg-white/10 rounded-full transition-all duration-200 shadow-md group"
//           tooltip={!isOpen ? "Expand" : undefined}
//         >
//           {isOpen ? (
//             <ArrowLeft size={16} className="text-white group-hover:text-white/80 transition-colors" />
//           ) : (
//             <ArrowRight size={16} className="text-white group-hover:text-white/80 transition-colors" />
//           )}
//         </Button>
//       </div>

//       {/* Navigation */}
//       <nav className="flex-1 mt-2 overflow-y-auto overflow-x-hidden custom-scrollbar">
//         <ul className="space-y-1 px-2 py-4">
//           {navigation.map((item) => (
//             <li key={item.name}>
//               {!item.children ? (
//                 <Link
//                   href={item.href ?? "#"}
//                   className={clsx(
//                     item.current 
//                       ? "bg-white/20 text-white shadow-lg" 
//                       : "text-white/80 hover:bg-white/10 hover:text-white",
//                     "flex items-center gap-x-3 px-4 py-3 rounded-xl transition-all duration-200 group",
//                     isOpen ? "justify-start" : "justify-center"
//                   )}
//                 >
//                   {item.icon && (
//                     <div className={clsx(
//                       "p-1.5 rounded-lg transition-all duration-200",
//                       item.current ? "bg-white/10" : "group-hover:bg-white/10"
//                     )}>
//                       <item.icon 
//                         className={clsx(
//                           "h-5 w-5 flex-shrink-0",
//                           item.current ? "text-white" : "text-white/80 group-hover:text-white"
//                         )} 
//                         aria-hidden="true" 
//                       />
//                     </div>
//                   )}
//                   {isOpen && (
//                     <span className="truncate font-medium transition-opacity duration-200">
//                       {item.name}
//                     </span>
//                   )}
//                   {!isOpen && (
//                     <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-lg whitespace-nowrap">
//                       {item.name}
//                     </div>
//                   )}
//                 </Link>
//               ) : (
//                 <Disclosure as="div">
//                   {({ open }) => (
//                     <>
//                       <DisclosureButton
//                         className={clsx(
//                           item.current 
//                             ? "bg-white/20 text-white" 
//                             : "text-white/80 hover:bg-white/10 hover:text-white",
//                           "flex items-center w-full gap-x-3 px-4 py-3 rounded-xl transition-all duration-200 group",
//                           isOpen ? "justify-between" : "justify-center"
//                         )}
//                       >
//                         <div className="flex items-center gap-x-3">
//                           {item.icon && (
//                             <div className={clsx(
//                               "p-1.5 rounded-lg transition-all duration-200",
//                               item.current ? "bg-white/10" : "group-hover:bg-white/10"
//                             )}>
//                               <item.icon 
//                                 className={clsx(
//                                   "h-5 w-5 flex-shrink-0",
//                                   item.current ? "text-white" : "text-white/80 group-hover:text-white"
//                                 )} 
//                                 aria-hidden="true" 
//                               />
//                             </div>
//                           )}
//                           {isOpen && (
//                             <span className="truncate font-medium transition-opacity duration-200">
//                               {item.name}
//                             </span>
//                           )}
//                           {!isOpen && (
//                             <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-lg whitespace-nowrap">
//                               {item.name}
//                             </div>
//                           )}
//                         </div>
//                         {isOpen && (
//                           <ChevronRightIcon
//                             className={clsx(
//                               "h-4 w-4 flex-shrink-0 transition-transform duration-200",
//                               open ? "rotate-90 transform text-white" : "text-white/80"
//                             )}
//                           />
//                         )}
//                       </DisclosureButton>
//                       {isOpen && (
//                         <DisclosurePanel 
//                           as="ul" 
//                           className="mt-1 ml-2 space-y-1 pl-7 border-l border-white/20"
//                           static={!isOpen}
//                         >
//                           {item.children?.map((subItem) => (
//                             <li key={subItem.name}>
//                               <Link
//                                 href={subItem.href ?? "#"}
//                                 className={clsx(
//                                   subItem.current 
//                                     ? "bg-white/15 text-white" 
//                                     : "text-white/70 hover:bg-white/10 hover:text-white",
//                                   "flex items-center gap-x-3 px-3 py-2.5 text-sm rounded-lg transition-all duration-200 group"
//                                 )}
//                               >
//                                 {subItem.icon && (
//                                   <subItem.icon 
//                                     className="h-4 w-4 flex-shrink-0 text-white/70 group-hover:text-white" 
//                                     aria-hidden="true" 
//                                   />
//                                 )}
//                                 <span className="truncate">{subItem.name}</span>
//                               </Link>
//                             </li>
//                           ))}
//                         </DisclosurePanel>
//                       )}
//                     </>
//                   )}
//                 </Disclosure>
//               )}
//             </li>
//           ))}
//         </ul>
//       </nav>

//       {/* Sidebar Footer */}
//       <div className={clsx(
//         "p-4 border-t border-white/20 transition-all duration-300",
//         isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
//       )}>
//         <div className="flex flex-col items-center">
//           <div className="text-xs text-white/60 mb-1">
//             v1.0.0
//           </div>
//           <div className="text-[10px] text-white/40">
//             © {new Date().getFullYear()} Your Company
//           </div>
//         </div>
//       </div>

//       <style jsx>{`
//         .custom-scrollbar::-webkit-scrollbar {
//           width: 4px;
//         }
//         .custom-scrollbar::-webkit-scrollbar-track {
//           background: rgba(255, 255, 255, 0.05);
//         }
//         .custom-scrollbar::-webkit-scrollbar-thumb {
//           background: rgba(255, 255, 255, 0.2);
//           border-radius: 4px;
//         }
//       `}</style>
//     </aside>
//   );
// };

// export default SideBar;








//------------ indigo theme -------------

// import React from 'react';
// import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react";
// import clsx from "clsx";
// import Image from "next/image";
// import Link from "next/link";
// import { ArrowLeft, ArrowRight, ChevronRightIcon } from "lucide-react";
// import { navigation } from "./Navigation";
// import Button from '../common/Button';

// interface SideBarProps {
//   isOpen: boolean;
//   setIsOpen: (isOpen: boolean) => void;
// }

// const SideBar = ({ isOpen, setIsOpen }: SideBarProps) => {
//   return (
//     <aside
//       className={`fixed inset-y-0 left-0 z-30 bg-gradient-to-b from-indigo-900 to-indigo-950 shadow-2xl transform transition-all duration-300 ease-in-out flex flex-col ${
//         isOpen ? "w-64" : "w-20"
//       }`}
//     >
//       {/* Sidebar Header */}
//       <div className="flex items-center justify-between px-4 py-5 border-b border-teal-400/20 bg-indigo-900/50">
//         {isOpen ? (
//           <Link href="/" className="flex items-center space-x-2 group">
//             <Image 
//               src="/LOGO.svg" 
//               alt="Company Logo" 
//               width={140} 
//               height={40} 
//               className="transition-all duration-300 group-hover:opacity-90 brightness-125"
//             />
//           </Link>
//         ) : (
//           <Link href="/" className="mx-auto group">
//             <Image 
//               src="/LOGO-icon.svg"  // Consider a simplified icon version
//               alt="Company Logo" 
//               width={36} 
//               height={36} 
//               className="transition-all duration-300 group-hover:scale-110"
//             />
//           </Link>
//         )}
//         <Button
//           text=""
//           onClick={() => setIsOpen(!isOpen)}
//           aria-label={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
//           className="p-2 hover:bg-teal-400/20 rounded-full transition-all duration-200 shadow-lg backdrop-blur-sm"
//           // tooltip={!isOpen ? "Expand" : undefined}
//         >
//           {isOpen ? (
//             <ArrowLeft size={18} className="text-teal-300 hover:text-white transition-colors" />
//           ) : (
//             <ArrowRight size={18} className="text-teal-300 hover:text-white transition-colors" />
//           )}
//         </Button>
//       </div>

//       {/* Navigation */}
//       <nav className="flex-1 mt-2 overflow-y-auto overflow-x-hidden custom-scrollbar">
//         <ul className="space-y-2 px-3 py-4">
//           {navigation.map((item) => (
//             <li key={item.name}>
//               {!item.children ? (
//                 <Link
//                   href={item.href ?? "#"}
//                   className={clsx(
//                     item.current 
//                       ? "bg-teal-500/20 text-white shadow-lg ring-1 ring-teal-400/30" 
//                       : "text-indigo-100 hover:bg-teal-400/10 hover:text-white",
//                     "flex items-center gap-x-3 px-4 py-3 rounded-xl transition-all duration-200 group",
//                     isOpen ? "justify-start" : "justify-center"
//                   )}
//                 >
//                   {item.icon && (
//                     <div className={clsx(
//                       "p-1.5 rounded-lg transition-all duration-200",
//                       item.current ? "bg-teal-400/30 text-white" : "text-teal-300 group-hover:bg-teal-400/20"
//                     )}>
//                       <item.icon className="h-5 w-5 flex-shrink-0" />
//                     </div>
//                   )}
//                   {isOpen && (
//                     <span className="truncate font-medium transition-opacity duration-200">
//                       {item.name}
//                     </span>
//                   )}
//                   {!isOpen && (
//                     <div className="absolute left-full ml-3 px-3 py-1.5 bg-teal-500 text-white text-sm font-medium rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-xl z-50 whitespace-nowrap">
//                       {item.name}
//                       <div className="absolute w-2 h-2 bg-teal-500 rotate-45 -left-1 top-1/2 -translate-y-1/2"></div>
//                     </div>
//                   )}
//                 </Link>
//               ) : (
//                 <Disclosure as="div">
//                   {({ open }) => (
//                     <>
//                       <DisclosureButton
//                         className={clsx(
//                           item.current 
//                             ? "bg-teal-500/15 text-white" 
//                             : "text-indigo-100 hover:bg-teal-400/10 hover:text-white",
//                           "flex items-center w-full gap-x-3 px-4 py-3 rounded-xl transition-all duration-200 group",
//                           isOpen ? "justify-between" : "justify-center"
//                         )}
//                       >
//                         <div className="flex items-center gap-x-3">
//                           {item.icon && (
//                             <div className={clsx(
//                               "p-1.5 rounded-lg transition-all duration-200",
//                               item.current ? "bg-teal-400/30" : "text-teal-300 group-hover:bg-teal-400/20"
//                             )}>
//                               <item.icon className="h-5 w-5 flex-shrink-0" />
//                             </div>
//                           )}
//                           {isOpen && (
//                             <span className="truncate font-medium">
//                               {item.name}
//                             </span>
//                           )}
//                           {!isOpen && (
//                             <div className="absolute left-full ml-3 px-3 py-1.5 bg-teal-500 text-white text-sm font-medium rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-xl z-50 whitespace-nowrap">
//                               {item.name}
//                               <div className="absolute w-2 h-2 bg-teal-500 rotate-45 -left-1 top-1/2 -translate-y-1/2"></div>
//                             </div>
//                           )}
//                         </div>
//                         {isOpen && (
//                           <ChevronRightIcon
//                             className={clsx(
//                               "h-4 w-4 flex-shrink-0 transition-transform duration-200",
//                               open ? "rotate-90 transform text-teal-300" : "text-indigo-200"
//                             )}
//                           />
//                         )}
//                       </DisclosureButton>
//                       {isOpen && (
//                         <DisclosurePanel 
//                           as="ul" 
//                           className="mt-2 ml-3 space-y-2 pl-7 border-l border-teal-400/20"
//                         >
//                           {item.children?.map((subItem) => (
//                             <li key={subItem.name}>
//                               <Link
//                                 href={subItem.href ?? "#"}
//                                 className={clsx(
//                                   subItem.current 
//                                     ? "text-white bg-teal-400/10 ring-1 ring-teal-400/20" 
//                                     : "text-indigo-100/80 hover:text-white hover:bg-teal-400/10",
//                                   "flex items-center gap-x-3 px-3 py-2.5 text-sm rounded-lg transition-all duration-200 group"
//                                 )}
//                               >
//                                 {subItem.icon && (
//                                   <subItem.icon className="h-4 w-4 flex-shrink-0 text-teal-300 group-hover:text-white" />
//                                 )}
//                                 <span className="truncate">{subItem.name}</span>
//                               </Link>
//                             </li>
//                           ))}
//                         </DisclosurePanel>
//                       )}
//                     </>
//                   )}
//                 </Disclosure>
//               )}
//             </li>
//           ))}
//         </ul>
//       </nav>

//       {/* Sidebar Footer */}
//       <div className={clsx(
//         "p-4 border-t border-teal-400/20 bg-indigo-900/30 transition-all duration-300 backdrop-blur-sm",
//         isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
//       )}>
//         <div className="flex flex-col items-center">
//           <div className="text-xs text-teal-300/80 mb-1 font-mono">
//             v1.0.0
//           </div>
//           <div className="text-[10px] text-indigo-200/50 tracking-wider">
//             © {new Date().getFullYear()} COMPANY
//           </div>
//         </div>
//       </div>

//       <style jsx>{`
//         .custom-scrollbar::-webkit-scrollbar {
//           width: 4px;
//         }
//         .custom-scrollbar::-webkit-scrollbar-track {
//           background: rgba(255, 255, 255, 0.03);
//         }
//         .custom-scrollbar::-webkit-scrollbar-thumb {
//           background: linear-gradient(to bottom, #5eead4, #2dd4bf);
//           border-radius: 4px;
//         }
//       `}</style>
//     </aside>
//   );
// };

// export default SideBar;








// ---- purple dark  theme ----

// import React from 'react';
// import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react";
// import clsx from "clsx";
// import Image from "next/image";
// import Link from "next/link";
// import { ArrowLeft, ArrowRight, ChevronRightIcon, Sparkles } from "lucide-react";
// import { navigation } from "./Navigation";
// import Button from '../common/Button';

// interface SideBarProps {
//   isOpen: boolean;
//   setIsOpen: (isOpen: boolean) => void;
// }

// const SideBar = ({ isOpen, setIsOpen }: SideBarProps) => {
//   return (
//     <aside
//       className={`fixed inset-y-0 left-0 z-30 bg-gradient-to-b from-purple-900 to-purple-950 shadow-2xl transform transition-all duration-300 ease-in-out flex flex-col ${
//         isOpen ? "w-64" : "w-20"
//       }`}
//     >
//       {/* Sidebar Header with Glow Effect */}
//       <div className="flex items-center justify-between px-4 py-5 border-b border-purple-400/20 bg-purple-900/50 relative overflow-hidden">
//         {/* Animated background elements */}
//         <div className="absolute -right-10 -top-10 w-32 h-32 rounded-full bg-fuchsia-500/10 blur-xl"></div>
        
//         {isOpen ? (
//           <Link href="/" className="flex items-center space-x-2 group relative z-10">
//             <Image 
//               src="/LOGO-white.svg" 
//               alt="Company Logo" 
//               width={140} 
//               height={40} 
//               className="transition-all duration-300 group-hover:opacity-90 drop-shadow-lg"
//             />
//           </Link>
//         ) : (
//           <Link href="/" className="mx-auto group relative z-10">
//             <div className="p-1.5 rounded-lg bg-purple-600/30 group-hover:bg-purple-600/40 transition-all">
//               <Image 
//                 src="/LOGO-icon-white.svg"
//                 alt="Company Logo" 
//                 width={32} 
//                 height={32} 
//                 className="transition-all duration-300 group-hover:rotate-6"
//               />
//             </div>
//           </Link>
//         )}
//         <Button
//           text=""
//           onClick={() => setIsOpen(!isOpen)}
//           aria-label={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
//           className="p-2 hover:bg-purple-400/20 rounded-full transition-all duration-200 shadow-lg backdrop-blur-sm z-10 group"
//           tooltip={!isOpen ? "Expand" : undefined}
//         >
//           {isOpen ? (
//             <ArrowLeft size={18} className="text-purple-200 group-hover:text-white transition-colors" />
//           ) : (
//             <ArrowRight size={18} className="text-purple-200 group-hover:text-white transition-colors" />
//           )}
//         </Button>
//       </div>

//       {/* Navigation */}
//       <nav className="flex-1 mt-2 overflow-y-auto overflow-x-hidden custom-scrollbar">
//         <ul className="space-y-2 px-3 py-4">
//           {navigation.map((item) => (
//             <li key={item.name}>
//               {!item.children ? (
//                 <Link
//                   href={item.href ?? "#"}
//                   className={clsx(
//                     item.current 
//                       ? "bg-purple-600/30 text-white shadow-lg ring-1 ring-purple-400/50" 
//                       : "text-purple-100 hover:bg-purple-700/30 hover:text-white",
//                     "flex items-center gap-x-3 px-4 py-3 rounded-xl transition-all duration-200 group relative",
//                     isOpen ? "justify-start" : "justify-center"
//                   )}
//                 >
//                   {item.current && (
//                     <div className="absolute -left-1 top-0 w-1 h-full bg-gradient-to-b from-fuchsia-400 to-purple-400 rounded-r-full"></div>
//                   )}
//                   {item.icon && (
//                     <div className={clsx(
//                       "p-1.5 rounded-lg transition-all duration-200 relative",
//                       item.current 
//                         ? "bg-purple-500/30 text-white" 
//                         : "text-purple-200 group-hover:bg-purple-600/30",
//                       item.current && "shadow-purple-glow"
//                     )}>
//                       <item.icon className="h-5 w-5 flex-shrink-0" />
//                       {item.current && (
//                         <Sparkles className="absolute -right-1 -top-1 h-3 w-3 text-fuchsia-300 animate-pulse" />
//                       )}
//                     </div>
//                   )}
//                   {isOpen && (
//                     <span className="truncate font-medium transition-opacity duration-200">
//                       {item.name}
//                     </span>
//                   )}
//                   {!isOpen && (
//                     <div className="absolute left-full ml-3 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-fuchsia-500 text-white text-sm font-medium rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-xl z-50 whitespace-nowrap">
//                       {item.name}
//                       <div className="absolute w-2 h-2 bg-purple-600 rotate-45 -left-1 top-1/2 -translate-y-1/2"></div>
//                     </div>
//                   )}
//                 </Link>
//               ) : (
//                 <Disclosure as="div">
//                   {({ open }) => (
//                     <>
//                       <DisclosureButton
//                         className={clsx(
//                           item.current 
//                             ? "bg-purple-600/20 text-white" 
//                             : "text-purple-100 hover:bg-purple-700/30 hover:text-white",
//                           "flex items-center w-full gap-x-3 px-4 py-3 rounded-xl transition-all duration-200 group relative",
//                           isOpen ? "justify-between" : "justify-center"
//                         )}
//                       >
//                         {item.current && (
//                           <div className="absolute -left-1 top-0 w-1 h-full bg-gradient-to-b from-fuchsia-400 to-purple-400 rounded-r-full"></div>
//                         )}
//                         <div className="flex items-center gap-x-3">
//                           {item.icon && (
//                             <div className={clsx(
//                               "p-1.5 rounded-lg transition-all duration-200",
//                               item.current 
//                                 ? "bg-purple-500/30 text-white" 
//                                 : "text-purple-200 group-hover:bg-purple-600/30"
//                             )}>
//                               <item.icon className="h-5 w-5 flex-shrink-0" />
//                             </div>
//                           )}
//                           {isOpen && (
//                             <span className="truncate font-medium">
//                               {item.name}
//                             </span>
//                           )}
//                           {!isOpen && (
//                             <div className="absolute left-full ml-3 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-fuchsia-500 text-white text-sm font-medium rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-xl z-50 whitespace-nowrap">
//                               {item.name}
//                               <div className="absolute w-2 h-2 bg-purple-600 rotate-45 -left-1 top-1/2 -translate-y-1/2"></div>
//                             </div>
//                           )}
//                         </div>
//                         {isOpen && (
//                           <ChevronRightIcon
//                             className={clsx(
//                               "h-4 w-4 flex-shrink-0 transition-transform duration-200",
//                               open ? "rotate-90 transform text-fuchsia-300" : "text-purple-200"
//                             )}
//                           />
//                         )}
//                       </DisclosureButton>
//                       {isOpen && (
//                         <DisclosurePanel 
//                           as="ul" 
//                           className="mt-2 ml-3 space-y-2 pl-7 border-l border-purple-400/30"
//                         >
//                           {item.children?.map((subItem) => (
//                             <li key={subItem.name}>
//                               <Link
//                                 href={subItem.href ?? "#"}
//                                 className={clsx(
//                                   subItem.current 
//                                     ? "text-white bg-purple-600/20 ring-1 ring-purple-400/30" 
//                                     : "text-purple-100/80 hover:text-white hover:bg-purple-700/20",
//                                   "flex items-center gap-x-3 px-3 py-2.5 text-sm rounded-lg transition-all duration-200 group"
//                                 )}
//                               >
//                                 {subItem.icon && (
//                                   <subItem.icon className="h-4 w-4 flex-shrink-0 text-purple-300 group-hover:text-white" />
//                                 )}
//                                 <span className="truncate">{subItem.name}</span>
//                                 {subItem.current && (
//                                   <Sparkles className="ml-auto h-3 w-3 text-fuchsia-300 animate-pulse" />
//                                 )}
//                               </Link>
//                             </li>
//                           ))}
//                         </DisclosurePanel>
//                       )}
//                     </>
//                   )}
//                 </Disclosure>
//               )}
//             </li>
//           ))}
//         </ul>
//       </nav>

//       {/* Sidebar Footer */}
//       <div className={clsx(
//         "p-4 border-t border-purple-400/20 bg-purple-900/30 transition-all duration-300 backdrop-blur-sm",
//         isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
//       )}>
//         <div className="flex flex-col items-center">
//           <div className="text-xs text-purple-200/80 mb-1 font-mono flex items-center gap-1">
//             <span className="inline-block w-2 h-2 rounded-full bg-fuchsia-400 animate-pulse"></span>
//             v1.0.0
//           </div>
//           <div className="text-[10px] text-purple-300/50 tracking-wider">
//             © {new Date().getFullYear()} PURPLE_OS
//           </div>
//         </div>
//       </div>

//       <style jsx global>{`
//         .custom-scrollbar::-webkit-scrollbar {
//           width: 5px;
//         }
//         .custom-scrollbar::-webkit-scrollbar-track {
//           background: rgba(192, 132, 252, 0.05);
//         }
//         .custom-scrollbar::-webkit-scrollbar-thumb {
//           background: linear-gradient(to bottom, #c084fc, #a855f7);
//           border-radius: 6px;
//         }
//         .shadow-purple-glow {
//           box-shadow: 0 0 8px rgba(192, 132, 252, 0.4);
//         }
//       `}</style>
//     </aside>
//   );
// };

// export default SideBar;











//---- light purple theme ----

import React from 'react';
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react";
import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ChevronRightIcon, Sparkles } from "lucide-react";
import { navigation } from "./Navigation";
import Button from '../common/Button';

interface SideBarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const SideBar = ({ isOpen, setIsOpen }: SideBarProps) => {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 bg-[#E1C4F8] shadow-2xl transform transition-all duration-300 ease-in-out flex flex-col ${
        isOpen ? "w-64" : "w-20"
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
          <Link href="/" className="mx-auto group relative z-10">
            <div className="p-1.5 rounded-lg bg-white/20 group-hover:bg-white/30 transition-all relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_white_0%,_transparent_70%)] opacity-0 group-hover:opacity-15 transition-opacity duration-500"></div>
              <Image 
                src="/LOGO.svg"
                alt="Company Logo" 
                width={64} 
                height={64} 
                className="transition-all duration-300 group-hover:rotate-6 group-hover:scale-110"
              />
            </div>
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