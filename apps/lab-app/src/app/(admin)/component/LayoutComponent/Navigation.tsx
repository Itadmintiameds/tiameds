import { NavigationItem } from "@/types/NavigationItem";
import { CogIcon, DocumentTextIcon, HomeIcon, ShoppingCartIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { ClipboardListIcon, FlaskConical, UserIcon } from "lucide-react";
import { FaPeriscope } from "react-icons/fa";
import { FaUserDoctor } from "react-icons/fa6";
import { MdMan } from "react-icons/md";
import { PiPackageFill } from "react-icons/pi";



export const navigation: NavigationItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: HomeIcon, current: true },
  {
    name: "Lab Management",
    icon: FlaskConical,
    current: false,
    children: [
      { name: "Tests", href: "/dashboard/test", current: false, icon: ClipboardListIcon },
      { name: "Packages", href: "/dashboard/package", current: false, icon: PiPackageFill },
      { name: "Doctors", href: "/dashboard/doctor", current: false, icon: FaUserDoctor },
      { name: "Sample List", href: "/dashboard/sample/add", current: false, icon: FaPeriscope },
      { name: "Sample Collection", href: "/dashboard/sample", current: false, icon: ClipboardListIcon },
      {name : "Patient Details",href : "/dashboard/patientdetails", current: false, icon: MdMan},
    ],
  },
  {
    name: "User Management",
    icon: UserGroupIcon,
    current: false,
    children: [
      { name: "Manage Members", href: "/dashboard/technicians", current: false, icon: ClipboardListIcon },
    ],
  },
  {
    name: "Inventory",
    icon: ShoppingCartIcon,
    current: false,
    children: [
    {name : "Inventory Summary", href: "/dashboard/inventorysummary", current: false, icon: ClipboardListIcon},
    ],
  },
  {
    name: "Reports",
    icon: DocumentTextIcon,
    current: false,
    children: [
      { name: "Detail Reports", href: "/dashboard/detailreports", current: false, icon: ClipboardListIcon },
    ],
  },
  // {
  //   name: "Billing",
  //   icon: CreditCardIcon,
  //   current: false,
  //   children: [
  //     // { name: "Invoices", href: "#", current: false, icon: ClipboardListIcon },
  //     { name: "Billing Summary", href: "/dashboard/billsummary", current: false, icon: ClipboardListIcon },
    
     
  //   ],
  // },
  {
    name: "Settings",
    icon: CogIcon,
    current: false,
    children: [
      { name: "Profile", href: "/dashboard/profile", current: false, icon: UserIcon },
      // { name: "Preferences", href: "#", current: false, icon: ClipboardListIcon },
      { name: "Lab", href: "/dashboard/lab", current: false, icon: FlaskConical },
    ],
  },
  

];