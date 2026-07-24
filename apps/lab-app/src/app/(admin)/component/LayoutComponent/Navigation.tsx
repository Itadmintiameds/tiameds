import { NavigationItem } from "@/types/NavigationItem";
import { CogIcon,
  //  DocumentTextIcon, 
   HomeIcon,
    // ShoppingCartIcon,
    UserGroupIcon, UsersIcon } from "@heroicons/react/24/outline";
import { ClipboardListIcon, FlaskConical } from "lucide-react";
import { FaPeriscope } from "react-icons/fa";
import { FaUserDoctor } from "react-icons/fa6";
import { PiPackageFill } from "react-icons/pi";

// Base navigation structure without current states
interface BaseNavigationItem {
  name: string;
  href?: string;
  icon?: React.ElementType;
  children?: (BaseNavigationItem & { icon?: React.ElementType })[];
}

const baseNavigation: BaseNavigationItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: HomeIcon },

  { name: "Patient Management", href: "/dashboard/patient-management", icon: UsersIcon },

  {
  name: "Sample Management",
  href: "/dashboard/sample",
  icon: ClipboardListIcon,
  children: [
    {
      name: "Samples Pending",
      href: "/dashboard/pendingsamples?tab=pending",
      icon: ClipboardListIcon,
    },
    {
      name: "Samples Collected",
      href: "/dashboard/pendingsamples?tab=collected",
      icon: ClipboardListIcon,
    },
    {
      name: "Pending Test Result",
      href: "/dashboard/pendingsamples?tab=partial",
      icon: ClipboardListIcon,
    },
    {
      name: "Completed Test",
      href: "/dashboard/pendingsamples?tab=completed",
      icon: ClipboardListIcon,
    },
    // {
    //   name: "New Sample Configuration",
    //   href: "/dashboard/pendingsamples?tab=configuration",
    //   icon: ClipboardListIcon,
    // },
  ],
},
//   {
//   name: "Pending Samples",
//   href: "/dashboard/pendingsamples",
//   icon: ClipboardListIcon,
// },
  {
    name: "Lab Management",
    icon: FlaskConical,
    children: [
      { name: "Tests", href: "/dashboard/test", icon: ClipboardListIcon },
      { name: "Doctors", href: "/dashboard/doctor", icon: FaUserDoctor },
      { name: "Sample List", href: "/dashboard/sample/add", icon: FaPeriscope },
      // { name: "Sample Collection", href: "/dashboard/sample", icon: ClipboardListIcon },
      // {name : "Patient Details",href : "/dashboard/patientdetails", icon: MdMan}, // Hidden for this release
    ],
  },
  {
    name: "Package Management",
    icon: PiPackageFill,
    children: [
      { name: "Package List", href: "/dashboard/package?tab=packageList", icon: ClipboardListIcon },
      { name: "Add Package", href: "/dashboard/package?tab=package", icon: PiPackageFill },
    ],
  },
  {
    name: "User Management",
    icon: UserGroupIcon,
    children: [
      { name: "Manage Members", href: "/dashboard/technicians", icon: ClipboardListIcon },
    ],
  },
  // {
  //   name: "Inventory",
  //   icon: ShoppingCartIcon,
  //   children: [
  //   {name : "Inventory Summary", href: "/dashboard/inventorysummary", icon: ClipboardListIcon},
  //   ],
  // },
  // {
  //   name: "Reports",
  //   icon: DocumentTextIcon,
  //   children: [
  //     { name: "Detail Reports", href: "/dashboard/detailreports", icon: ClipboardListIcon },
  //   ],
  // },
  {
    name: "Settings",
    icon: CogIcon,
    children: [
      // { name: "Profile", href: "/dashboard/profile", icon: UserIcon },
      // { name: "Preferences", href: "#", icon: ClipboardListIcon },
      { name: "Lab", href: "/dashboard/lab", icon: FlaskConical },
      // { name:"Report Settings", href: "/dashboard/reportsettings", icon: DocumentTextIcon},
    ],
  },
];

// Function to generate navigation with dynamic current states
// `search` is the current URL's query string (e.g. "tab=pending"), needed because several
// children under the same parent share a path and are only distinguished by a ?tab= param.
export const getNavigation = (pathname: string, search: string = ""): NavigationItem[] => {
  const fullPath = search ? `${pathname}?${search}` : pathname;

  return baseNavigation.map(item => {
    // Check if current item is active
    const isCurrentItem = item.href === pathname;

    // Check if any child is active (ignore query params so ?tab= links match)
    const hasActiveChild = item.children?.some(child => child.href?.split('?')[0] === pathname) || false;

    return {
      ...item,
      // Parent lights up both when its own link is the active route AND when one of its
      // children is active, so the section reads as "active" while the child link itself
      // still gets its own highlight below.
      current: isCurrentItem || hasActiveChild,
      hasActiveChild,
      children: item.children?.map(child => ({
        ...child,
        // Compare against the full path (incl. query) so children sharing a base path but
        // differing only by ?tab= are individually highlighted.
        current: child.href === fullPath
      }))
    };
  });
};

// Default export for backward compatibility
export const navigation: NavigationItem[] = getNavigation('/dashboard');










// code done by abhishek..................

// import { NavigationItem } from "@/types/NavigationItem";
// import { CogIcon, DocumentTextIcon, HomeIcon, ShoppingCartIcon, UserGroupIcon } from "@heroicons/react/24/outline";
// import { ClipboardListIcon, FlaskConical } from "lucide-react";
// import { FaPeriscope } from "react-icons/fa";
// import { FaUserDoctor } from "react-icons/fa6";
// import { PiPackageFill } from "react-icons/pi";

// // Base navigation structure without current states
// interface BaseNavigationItem {
//   name: string;
//   href?: string;
//   icon?: React.ElementType;
//   children?: (BaseNavigationItem & { icon?: React.ElementType })[];
// }

// const baseNavigation: BaseNavigationItem[] = [
//   { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
//   {
//     name: "Lab Management",
//     icon: FlaskConical,
//     children: [
//       { name: "Tests", href: "/dashboard/test", icon: ClipboardListIcon },
//       { name: "Packages", href: "/dashboard/package", icon: PiPackageFill },
//       { name: "Doctors", href: "/dashboard/doctor", icon: FaUserDoctor },
//       { name: "Sample List", href: "/dashboard/sample/add", icon: FaPeriscope },
//       { name: "Sample Collection", href: "/dashboard/sample", icon: ClipboardListIcon },
//       // {name : "Patient Details",href : "/dashboard/patientdetails", icon: MdMan}, // Hidden for this release
//     ],
//   },
//   {
//     name: "User Management",
//     icon: UserGroupIcon,
//     children: [
//       { name: "Manage Members", href: "/dashboard/technicians", icon: ClipboardListIcon },
//     ],
//   },
//   {
//     name: "Inventory",
//     icon: ShoppingCartIcon,
//     children: [
//     {name : "Inventory Summary", href: "/dashboard/inventorysummary", icon: ClipboardListIcon},
//     ],
//   },
//   {
//     name: "Reports",
//     icon: DocumentTextIcon,
//     children: [
//       { name: "Detail Reports", href: "/dashboard/detailreports", icon: ClipboardListIcon },
//     ],
//   },
//   {
//     name: "Settings",
//     icon: CogIcon,
//     children: [
//       // { name: "Profile", href: "/dashboard/profile", icon: UserIcon },
//       // { name: "Preferences", href: "#", icon: ClipboardListIcon },
//       { name: "Lab", href: "/dashboard/lab", icon: FlaskConical },
//       // { name:"Report Settings", href: "/dashboard/reportsettings", icon: DocumentTextIcon},
//     ],
//   },
// ];

// // Function to generate navigation with dynamic current states
// export const getNavigation = (pathname: string): NavigationItem[] => {
//   return baseNavigation.map(item => {
//     // Check if current item is active
//     const isCurrentItem = item.href === pathname;
    
//     // Check if any child is active
//     const hasActiveChild = item.children?.some(child => child.href === pathname) || false;
    
//     return {
//       ...item,
//       current: isCurrentItem || hasActiveChild,
//       children: item.children?.map(child => ({
//         ...child,
//         current: child.href === pathname
//       }))
//     };
//   });
// };

// // Default export for backward compatibility
// export const navigation: NavigationItem[] = getNavigation('/dashboard');