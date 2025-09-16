import { NavigationItem } from "@/types/NavigationItem";
import { CogIcon, DocumentTextIcon, HomeIcon, ShoppingCartIcon, UserGroupIcon } from "@heroicons/react/24/outline";
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
  {
    name: "Lab Management",
    icon: FlaskConical,
    children: [
      { name: "Tests", href: "/dashboard/test", icon: ClipboardListIcon },
      { name: "Packages", href: "/dashboard/package", icon: PiPackageFill },
      { name: "Doctors", href: "/dashboard/doctor", icon: FaUserDoctor },
      { name: "Sample List", href: "/dashboard/sample/add", icon: FaPeriscope },
      { name: "Sample Collection", href: "/dashboard/sample", icon: ClipboardListIcon },
      // {name : "Patient Details",href : "/dashboard/patientdetails", icon: MdMan}, // Hidden for this release
    ],
  },
  {
    name: "User Management",
    icon: UserGroupIcon,
    children: [
      { name: "Manage Members", href: "/dashboard/technicians", icon: ClipboardListIcon },
    ],
  },
  {
    name: "Inventory",
    icon: ShoppingCartIcon,
    children: [
    {name : "Inventory Summary", href: "/dashboard/inventorysummary", icon: ClipboardListIcon},
    ],
  },
  {
    name: "Reports",
    icon: DocumentTextIcon,
    children: [
      { name: "Detail Reports", href: "/dashboard/detailreports", icon: ClipboardListIcon },
    ],
  },
  {
    name: "Settings",
    icon: CogIcon,
    children: [
      // { name: "Profile", href: "/dashboard/profile", icon: UserIcon },
      // { name: "Preferences", href: "#", icon: ClipboardListIcon },
      { name: "Lab", href: "/dashboard/lab", icon: FlaskConical },
    ],
  },
];

// Function to generate navigation with dynamic current states
export const getNavigation = (pathname: string): NavigationItem[] => {
  return baseNavigation.map(item => {
    // Check if current item is active
    const isCurrentItem = item.href === pathname;
    
    // Check if any child is active
    const hasActiveChild = item.children?.some(child => child.href === pathname) || false;
    
    return {
      ...item,
      current: isCurrentItem || hasActiveChild,
      children: item.children?.map(child => ({
        ...child,
        current: child.href === pathname
      }))
    };
  });
};

// Default export for backward compatibility
export const navigation: NavigationItem[] = getNavigation('/dashboard');