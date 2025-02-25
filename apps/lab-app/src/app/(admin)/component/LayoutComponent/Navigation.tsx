import { NavigationItem } from "@/types/NavigationItem";
import { CogIcon, DocumentTextIcon, FolderIcon, HomeIcon, ShoppingCartIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { ArrowRight, ClipboardListIcon, CreditCardIcon, FlaskConical, UserIcon } from "lucide-react";
import { AiOutlineSafetyCertificate } from "react-icons/ai";
import { FaUserDoctor } from "react-icons/fa6";
import { PiPackageFill } from "react-icons/pi";
import { FaPeriscope } from "react-icons/fa";



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
      { name: "Insurance", href: "/dashboard/insurance", current: false, icon: AiOutlineSafetyCertificate },
      { name: "Appointments", href: "#", current: false, icon: UserIcon },
      { name: "Reports", href: "#", current: false, icon: DocumentTextIcon },
      { name: "Add Sample", href: "/dashboard/sample/add", current: false, icon: FaPeriscope },
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