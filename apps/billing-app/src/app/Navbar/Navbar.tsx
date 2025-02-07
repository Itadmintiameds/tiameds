// "use client";

// import Image from "next/image";
// import React, { useEffect, useState } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import "../fonts/style.css";
// import { PowerIcon } from "lucide-react";
// import ItemList from "../components/ItemList";
// import SupplierList from "../components/SupplierList";
// import useUserStore from "@/context/userStore";
// import { toast } from "react-toastify";
// import PurchaseList from "../PurchaseList/page";
// import Modal from "../components/Modal";
// import Supplier from "../Supplier/Supplier";
// import Item from "../Item/Item";
// import Inventory from "../Inventory/page";

// const Navbar = () => {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const { user, initializeUser } = useUserStore();

//   const [activePrimary, setActivePrimary] = useState<string | null>(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [modalContent, setModalContent] = useState<"Supplier" | "Item" | null>(
//     null
//   );

//   const openModal = (content: "Supplier" | "Item") => {
//     setModalContent(content);
//     setIsModalOpen(true);
//   };

//   const closeModal = () => {
//     setIsModalOpen(false);
//   };

//   useEffect(() => {
//     initializeUser();
//   }, [initializeUser]);

//   const handleNavigation = (section: string) => {
//     setActivePrimary(section);
//     router.push(`/Navbar?highlight=${section}`);
//   };

//   useEffect(() => {
//     const highlight = searchParams.get("highlight");
//     if (highlight) {
//       setActivePrimary(highlight);
//     }
//   }, [searchParams]);

//   return (
//     <>
//       <div className="h-20 border-b border-tableBorder px-10 content-center ">
//         <div className="h-12 w-full content-center flex gap-24">
//           <ul className="flex gap-14">
//             <li className="flex">
//               <Image src="Tiameds_Logo.svg" alt="Logo" width={48} height={48} />
//               <Image
//                 src="Tiameds_Logo2.svg"
//                 alt="Logo"
//                 width={87}
//                 height={39}
//               />
//             </li>
//           </ul>
//           <ul className="flex gap-10 content-center items-center text-lg font-light">
//             <li
//               className={`relative group ${
//                 activePrimary === "Supplier"
//                   ? "underline decoration-[#4B0082]"
//                   : ""
//               } cursor-pointer`}
//             >
//               <div className="cursor-pointer">Supplier</div>
//               <ul className="navbar_dropdown">
//                 <li
//                   className="dropdown_list cursor-pointer"
//                   onClick={() => openModal("Supplier")}
//                 >
//                   Add Supplier
//                 </li>
//                 <li
//                   className="dropdown_list cursor-pointer"
//                   onClick={() => handleNavigation("Supplier")}
//                 >
//                   Supplier List
//                 </li>
//               </ul>
//             </li>

//             <li
//               className={`relative group ${
//                 activePrimary === "Item" ? "underline decoration-[#4B0082]" : ""
//               } cursor-pointer`}
//             >
//               <div className="cursor-pointer">Item</div>
//               <ul className="navbar_dropdown">
//                 <li
//                   className="dropdown_list cursor-pointer"
//                   onClick={() => openModal("Item")}
//                 >
//                   {" "}
//                   Add Item
//                 </li>
//                 <li
//                   className="dropdown_list cursor-pointer"
//                   onClick={() => handleNavigation("Item")}
//                 >
//                   {" "}
//                   Item List
//                 </li>
//                 {/* <li className="dropdown_list cursor-pointer" onClick={() => dropdownRouting("unitMaster")}> Unit Master</li> */}
//               </ul>
//             </li>

//             <li
//               className={`${
//                 activePrimary === "Stores"
//                   ? "underline decoration-[#4B0082]"
//                   : ""
//               } cursor-pointer`}
//               onClick={() => setActivePrimary("Stores")}
//             >
//               Stores
//             </li>
//             <li
//               className={`${
//                 activePrimary === "Bills"
//                   ? "underline decoration-[#4B0082]"
//                   : ""
//               } cursor-pointer`}
//               onClick={() => handleNavigation("Bills")}
//             >
//               Bills
//             </li>

//             <li
//               className={`${
//                 activePrimary === "Bills"
//                   ? "underline decoration-[#4B0082]"
//                   : ""
//               } cursor-pointer`}
//               onClick={() => handleNavigation("Inventory")}
//             >
//               Inventory
//             </li>

//             <li
//               className={`${
//                 activePrimary === "Stock Purchase"
//                   ? "underline decoration-[#4B0082]"
//                   : ""
//               } cursor-pointer`}
//               onClick={() => handleNavigation("Stock Purchase")}
//             >
//               Stock Purchase
//             </li>
//           </ul>

//           <ul className="flex gap-4 content-center items-center ml-auto">
//             {/* <li><Image src="Notification_Icon.svg" alt="Notification Icon" width={32} height={32} /></li> */}

//             <li className="inline-grid">
//               {user?.firstName.toUpperCase()} {user?.lastName.toUpperCase()}
//             </li>
//             <li>
//               <button
//                 className="relative flex items-center justify-center w-10 h-10 text-white bg-red-600 rounded-md hover:bg-red-700 transition duration-200"
//                 onClick={() => {
//                   toast.success("Logged out successfully", {
//                     position: "top-right",
//                     autoClose: 2000,
//                   });
//                   localStorage.removeItem("user");
//                   //remove token from cookies
//                   document.cookie =
//                     "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
//                   window.location.href = "/login";
//                 }}
//               >
//                 <PowerIcon className="h-3 w-3" aria-hidden="true" />
//                 <span className="absolute left-1/2 transform -translate-x-1/2 -translate-y-full bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
//                   Logout
//                 </span>
//               </button>
//             </li>
//           </ul>
//         </div>
//       </div>

//       {activePrimary === "Stock Purchase" && <PurchaseList />}
//       {activePrimary === "Supplier" && <SupplierList />}
//       {activePrimary === "Item" && <ItemList />}
//       {/* {activePrimary === "Bills" && <BillList />} */}
//       {activePrimary === "Inventory" && <Inventory />}

//       <Modal isOpen={isModalOpen} closeModal={closeModal}>
//         {modalContent === "Supplier" && <Supplier closeModal={closeModal} />}
//         {modalContent === "Item" && <Item closeModal={closeModal} />}
//       </Modal>
//     </>
//   );
// };

// export default Navbar;











"use client";

import useUserStore from "@/context/userStore";
import { PowerIcon } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import React, { ReactNode, Suspense, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import Modal from "../components/Modal";
import "../fonts/style.css";
import Item from "../Item/Item";
import Supplier from "../Supplier/Supplier";

interface NavbarLayoutProps {
  children: ReactNode;
}

const NavbarLayout: React.FC<NavbarLayoutProps> = ({ children }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, initializeUser } = useUserStore();

  const [activePrimary, setActivePrimary] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalContent, setModalContent] = useState<"Supplier" | "Item" | null>(null);

  useEffect(() => {
    initializeUser();
  }, [initializeUser]);

  const openModal = (content: "Supplier" | "Item") => {
    setModalContent(content);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleNavigation = (section: string) => {
    setActivePrimary(section);
    router.push(`/Navbar?highlight=${section}`);
  }; 

  const highlightedSection = useMemo(() => searchParams.get("highlight"), [searchParams]);

  useEffect(() => {
    if (highlightedSection) {
      setActivePrimary(highlightedSection);
    }
  }, [highlightedSection]);

  return (
    <Suspense fallback={<div>Loading Navbar...</div>}>
      <div className="h-20 border-b border-tableBorder px-10 content-center">
        <div className="h-12 w-full content-center flex gap-24">
          <ul className="flex gap-14">
            <li className="flex">
              <Image src="/Tiameds_Logo.svg" alt="Logo" width={48} height={48} />
              <Image src="/Tiameds_Logo2.svg" alt="Logo" width={87} height={39} />
            </li>
          </ul>
          <ul className="flex gap-10 content-center items-center text-lg font-light">
            <li className={`relative group ${activePrimary === "Supplier" ? "underline decoration-[#4B0082]" : ""} cursor-pointer`}>
              <div className="cursor-pointer">Supplier</div>
              <ul className="navbar_dropdown">
                <li className="dropdown_list cursor-pointer" onClick={() => openModal("Supplier")}>Add Supplier</li>
                <li className="dropdown_list cursor-pointer" onClick={() => handleNavigation("Supplier")}>Supplier List</li>
              </ul>
            </li>
            <li className={`relative group ${activePrimary === "Item" ? "underline decoration-[#4B0082]" : ""} cursor-pointer`}>
              <div className="cursor-pointer">Item</div>
              <ul className="navbar_dropdown">
                <li className="dropdown_list cursor-pointer" onClick={() => openModal("Item")}>Add Item</li>
                <li className="dropdown_list cursor-pointer" onClick={() => handleNavigation("Item")}>Item List</li>
              </ul>
            </li>
          </ul>
          <ul className="flex gap-4 content-center items-center ml-auto">
            <li className="inline-grid">{user?.firstName?.toUpperCase()} {user?.lastName?.toUpperCase()}</li>
            <li>
              <button
                className="relative flex items-center justify-center w-10 h-10 text-white bg-red-600 rounded-md hover:bg-red-700 transition duration-200"
                onClick={() => {
                  toast.success("Logged out successfully", { position: "top-right", autoClose: 2000 });
                  localStorage.removeItem("user");
                  document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                  window.location.href = "/login";
                }}
              >
                <PowerIcon className="h-3 w-3" aria-hidden="true" />
              </button>
            </li>
          </ul>
        </div>
      </div>
      {children}
      <Modal isOpen={isModalOpen} closeModal={closeModal}>
        {modalContent === "Supplier" && <Supplier closeModal={closeModal} />}
        {modalContent === "Item" && <Item closeModal={closeModal} />}
      </Modal>
    </Suspense>
  );
};

export default NavbarLayout;