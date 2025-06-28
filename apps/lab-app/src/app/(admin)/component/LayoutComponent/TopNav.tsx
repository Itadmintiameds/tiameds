// import { PowerIcon, UserIcon } from "lucide-react";
// import { toast } from "react-toastify";
// import Button from "../common/Button";
// import CurrentTime from "../common/CurrentTime";

// interface User {
//   firstName: string;
//   lastName: string;
//   email: string;
//   roles: string[];
// }

// interface Lab {
//   id: number;
//   name: string;
//   logo: string;
//   address: string;
//   city: string;
//   state: string;
//   isActive: boolean;
//   description: string;
//   createdByName: string;
// }

// interface TopNavProps {
//   user: User;
//   labs: Lab[];
//   currentLab: Lab | null;
//   handleChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
// }

// const TopNav: React.FC<TopNavProps> = ({ user, labs, currentLab, handleChange }) => {

  
  
//  const handleLogout = () => {
//     toast.success("Logged out successfully", {
//       position: "top-right",
//       autoClose: 2000,
//       hideProgressBar: true,
//     });
//     localStorage.removeItem("user");
//     localStorage.removeItem("logedUser");
//     localStorage.removeItem("currentLab");
//     localStorage.removeItem("userLabs");
//     document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
//     window.location.replace("/user-login");
//   };

//   return (
//     <nav className="flex items-center justify-between py-3 px-6 border-b border-gray-200 bg-white shadow-sm">
//       {/* User Information */}
//       <div className="flex items-center space-x-4 min-w-0">
//         <div className="flex-shrink-0">
//           <span
//             className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white text-sm font-medium shadow-sm"
//             title={`${user.firstName} ${user.lastName}`}
//           >
//             {user.firstName[0].toUpperCase()}
//           </span>
//         </div>
//         <div className="min-w-0">
//           <h1 className="text-sm font-semibold text-gray-800 truncate">
//             {user.firstName} {user.lastName}
//           </h1>
//           <div className="flex items-center gap-2 text-xs text-gray-500">
//             <div className="flex items-center space-x-1">
//               <UserIcon className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
//               <select
//                 className="bg-gray-50 text-gray-700 rounded-md px-2 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary/50 border border-gray-200 transition cursor-pointer w-20"
//                 title="Select Role"
//               >
//                 {user.roles.map((role, index) => (
//                   <option key={index} value={role}>
//                     {role}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Actions and Controls */}
//       <div className="flex items-center space-x-4">
//         <div className="flex items-center space-x-2 text-xs text-gray-600 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-200">
//           <span className="font-medium">
//             {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
//           </span>
//           <span className="text-gray-400">|</span>
//           <CurrentTime  />
//         </div>

//         {labs?.length > 0 && (
//           <select
//             className="text-xs bg-white text-gray-700 rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary/50 hover:bg-gray-50 transition border border-gray-300 shadow-xs cursor-pointer min-w-[160px]"
//             onChange={handleChange}
//             defaultValue=""
//             title="Select Lab"
//             value={currentLab?.name || ""}
//           >
//             <option value="" disabled>
//               {currentLab?.name || "Select Lab"}
//             </option>
//             {labs.map((lab) => (
//               <option key={lab.id} value={lab.name}>
//                 {lab.name}
//               </option>
//             ))}
//           </select>
//         )}

//         {/* Logout Button */}
//         <Button
//           text=""
//           className="bg-red-500 hover:bg-red-800 rounded-md p-1.5 text-white transition border border-gray-200 shadow-xs"
//           onClick={handleLogout}
//           aria-label="Logout"
//           // title="Logout"
//         >
//           <PowerIcon className="h-4.5 w-4.5" aria-hidden="true" />
//         </Button>
//       </div>
//     </nav>
//   );
// };

// export default TopNav;








// import { FiPower, FiUser, FiClock, FiCalendar } from "react-icons/fi";
// import { HiOutlineBuildingOffice2 } from "react-icons/hi2";
// import { toast } from "react-toastify";
// import Button from "../common/Button";
// import CurrentTime from "../common/CurrentTime";

// interface User {
//   firstName: string;
//   lastName: string;
//   email: string;
//   roles: string[];
// }

// interface Lab {
//   id: number;
//   name: string;
//   logo: string;
//   address: string;
//   city: string;
//   state: string;
//   isActive: boolean;
//   description: string;
//   createdByName: string;
// }

// interface TopNavProps {
//   user: User;
//   labs: Lab[];
//   currentLab: Lab | null;
//   handleChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
// }

// const TopNav: React.FC<TopNavProps> = ({ user, labs, currentLab, handleChange }) => {
//   const handleLogout = () => {
//     toast.success("Logged out successfully", {
//       position: "top-right",
//       autoClose: 2000,
//       hideProgressBar: true,
//     });
//     localStorage.removeItem("user");
//     localStorage.removeItem("logedUser");
//     localStorage.removeItem("currentLab");
//     localStorage.removeItem("userLabs");
//     document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
//     window.location.replace("/user-login");
//   };

//   return (
//     <nav className="flex items-center justify-between py-3 px-6 border-b border-gray-200 bg-white shadow-sm">
//       {/* User Information */}
//       <div className="flex items-center space-x-4 min-w-0">
//         <div className="flex-shrink-0">
//           <span
//             className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-medium shadow-sm transition-all hover:bg-blue-700"
//             title={`${user.firstName} ${user.lastName}`}
//           >
//             {user.firstName[0].toUpperCase()}
//             {user.lastName[0].toUpperCase()}
//           </span>
//         </div>
//         <div className="min-w-0">
//           <h1 className="text-sm font-semibold text-gray-800 truncate">
//             {user.firstName} {user.lastName}
//           </h1>
//           <div className="flex items-center gap-2 text-xs text-gray-500">
//             <div className="flex items-center space-x-1">
//               <FiUser className="h-3.5 w-3.5 text-blue-600" aria-hidden="true" />
//               <select
//                 className="bg-gray-50 text-gray-700 rounded-md px-2 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-200 border border-gray-200 transition cursor-pointer hover:bg-gray-100"
//                 title="Select Role"
//               >
//                 {user.roles.map((role, index) => (
//                   <option key={index} value={role}>
//                     {role}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Actions and Controls */}
//       <div className="flex items-center space-x-4">
//         <div className="flex items-center space-x-2 text-xs text-gray-600 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200 hover:bg-gray-100 transition-colors">
//           <FiCalendar className="h-3.5 w-3.5 text-blue-600" />
//           <span className="font-medium">
//             {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
//           </span>
//           <span className="text-gray-300">|</span>
//           <FiClock className="h-3.5 w-3.5 text-blue-600" />
//           <CurrentTime />
//         </div>

//         {labs?.length > 0 && (
//           <div className="relative">
//             <HiOutlineBuildingOffice2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-blue-600" />
//             <select
//               className="text-xs bg-white text-gray-700 rounded-md pl-8 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-200 hover:bg-gray-50 transition border border-gray-300 shadow-xs cursor-pointer min-w-[160px] appearance-none"
//               onChange={handleChange}
//               defaultValue=""
//               title="Select Lab"
//               value={currentLab?.name || ""}
//             >
//               <option value="" disabled>
//                 {currentLab?.name || "Select Lab"}
//               </option>
//               {labs.map((lab) => (
//                 <option key={lab.id} value={lab.name}>
//                   {lab.name}
//                 </option>
//               ))}
//             </select>
//           </div>
//         )}

//         {/* Logout Button */}
//         <Button
//           text=""
//           className="bg-red-500 hover:bg-red-600 rounded-md p-2 text-white transition-all border border-gray-200 shadow-xs hover:shadow-sm"
//           onClick={handleLogout}
//           aria-label="Logout"
//         >
//           <FiPower className="h-4 w-4" aria-hidden="true" />
//         </Button>
//       </div>
//     </nav>
//   );
// };

// export default TopNav;





import { FiCalendar, FiChevronDown, FiPower, FiUser } from "react-icons/fi";
import { HiOutlineBuildingOffice2 } from "react-icons/hi2";
import { toast } from "react-toastify";
import Button from "../common/Button";
import CurrentTime from "../common/CurrentTime";

interface User {
  firstName: string;
  lastName: string;
  email: string;
  roles: string[];
}

interface Lab {
  id: number;
  name: string;
  logo: string;
  address: string;
  city: string;
  state: string;
  isActive: boolean;
  description: string;
  createdByName: string;
}

interface TopNavProps {
  user: User;
  labs: Lab[];
  currentLab: Lab | null;
  handleChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

const TopNav: React.FC<TopNavProps> = ({ user, labs, currentLab, handleChange }) => {
  const handleLogout = () => {
    toast.success("Logged out successfully", {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: true,
    });
    localStorage.removeItem("user");
    localStorage.removeItem("logedUser");
    localStorage.removeItem("currentLab");
    localStorage.removeItem("userLabs");
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.replace("/user-login");
  };

  return (
    <nav className="flex items-center justify-between py-3 px-6 border-b border-gray-200 bg-white shadow-sm">
      {/* User Information */}
      <div className="flex items-center space-x-4 min-w-0">
        <div className="flex-shrink-0">
          <span
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white text-sm font-medium shadow-sm transition-all hover:from-purple-600 hover:to-indigo-700"
            title={`${user.firstName} ${user.lastName}`}
          >
            {user.firstName[0].toUpperCase()}
            {user.lastName[0].toUpperCase()}
          </span>
        </div>
        <div className="min-w-0">
          <h1 className="text-sm font-semibold text-gray-800 truncate">
            {user.firstName} {user.lastName}
          </h1>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className="relative group">
              <button className="flex items-center space-x-1 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-md px-2 py-0.5 border border-blue-100 hover:from-blue-100 hover:to-cyan-100 transition-colors">
                <FiUser className="h-3.5 w-3.5 text-blue-600" />
                <span className="text-blue-700 font-medium">
                  {user.roles.length > 1 ? `${user.roles[0]} +${user.roles.length - 1}` : user.roles[0]}
                </span>
                <FiChevronDown className="h-3 w-3 text-blue-500" />
              </button>
              
              {user.roles.length > 1 && (
                <div className="absolute z-10 mt-1 w-48 bg-white rounded-md shadow-lg py-1 hidden group-hover:block border border-blue-100">
                  <div className="px-3 py-2 text-xs font-medium text-blue-600 border-b border-blue-50">
                    Your Roles
                  </div>
                  {user.roles.map((role, index) => (
                    <div key={index} className="px-3 py-2 text-xs text-gray-700 hover:bg-blue-50">
                      {role}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Actions and Controls */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 text-xs bg-gradient-to-r from-green-50 to-emerald-50 text-gray-700 px-3 py-1.5 rounded-md border border-green-100 hover:from-green-100 hover:to-emerald-100 transition-colors">
          <FiCalendar className="h-3.5 w-3.5 text-emerald-600" />
          <span className="font-medium">
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
          <span className="text-gray-300">|</span>
          {/* <FiClock className="h-3.5 w-3.5 text-emerald-600" /> */}
          <CurrentTime  />
        </div>

        {labs?.length > 0 && (
          <div className="relative">
            <HiOutlineBuildingOffice2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-amber-600" />
            <select
              className="text-xs bg-gray-50 text-gray-700 rounded-md pl-8 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-200 hover:from-amber-100 hover:to-yellow-100 transition border border-amber-200 shadow-xs cursor-pointer min-w-[160px] appearance-none"
              onChange={handleChange}
              defaultValue=""
              title="Select Lab"
              value={currentLab?.name || ""}
            >
              <option value="" disabled>
                {currentLab?.name || "Select Lab"}
              </option>
              {labs.map((lab) => (
                <option key={lab.id} value={lab.name}>
                  {lab.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Logout Button */}
        <Button
          text=""
          className="bg-gradient-to-br from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 rounded-md p-2 text-white transition-all shadow-xs hover:shadow-sm"
          onClick={handleLogout}
          aria-label="Logout"
        >
          <FiPower className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </nav>
  );
};

export default TopNav;