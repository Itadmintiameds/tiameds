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
  
//   const handleLogout = () => {
//     toast.success("Logged out successfully", {
//       position: "top-right",
//       autoClose: 2000,
//     });
//     localStorage.removeItem("user");
//     document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
//     window.location.replace("/login");
//   };

//   return (
//     <nav className="flex items-center justify-between py-2 px-6 border-b border-gray-200 bg-white shadow-sm rounded-md ">
//       {/* User Information */}
//       <div className="flex items-center space-x-4 truncate">
//         <span
//           className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-textzinc text-sm font-bold"
//           title={`${user.firstName} ${user.lastName}`}
//         >
//           {user.firstName[0].toUpperCase()}
//         </span>
//         <div className="leading-tight truncate">
//           <h1 className="text-sm font-semibold text-text-textzinc truncate">
//             {user.firstName.toUpperCase()} {user.lastName.toUpperCase()}
//           </h1>
//           <div className="flex items-center gap-2 text-xs text-gray-500 truncate">
//             <UserIcon className="h-4 w-4 text-primary" aria-hidden="true" />
//             <select
//               className="bg-primary text-textzinc rounded-md px-2 py-1 text-xs focus:outline-none focus:ring focus:ring-primary/50 transition"
//               title="Select Role"
//             >
//               {user.roles.map((role, index) => (
//                 <option key={index} value={role}>
//                   {role}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>
//       </div>

//       {/* Actions and Controls */}
//       <div className="flex items-center space-x-3">
//         <span className="bg-primary text-textzinc text-xs rounded-full px-2 py-0.5">
//           {new Date().toLocaleDateString()}
//         </span>
//         <CurrentTime />

//         {labs.length > 0 && (
//           <select
//             className="text-xs bg-primary text-zinc rounded-md px-3 py-1 focus:outline-none focus:ring-1 focus:ring-primary/50 hover:bg-primary/90 transition"
//             onChange={handleChange}
//             defaultValue=""
//             title="Select Lab"
//           >
//             <option value="" disabled>
//               {currentLab?.name || "Select a Lab"}
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
//           className="bg-clear hover:bg-clearhover rounded-md p-1 text-textwhite transition"
//           onClick={handleLogout}
//           aria-label="Logout"
//         >
//           <PowerIcon className="h-5 w-5" aria-hidden="true" />
//         </Button>
//       </div>
//     </nav>
//   );
// };

// export default TopNav;





// import { PowerIcon, UserIcon, ChevronDownIcon } from "lucide-react";
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
//       className: "bg-green-50 text-green-800"
//     });
//     localStorage.removeItem("user");
//     document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
//     window.location.replace("/login");
//   };

//   return (
//     <nav className="flex items-center justify-between py-2 px-4 bg-white border-b border-gray-100 shadow-sm">
//       {/* Left Section - User Info */}
//       <div className="flex items-center space-x-3">
//         <div className="relative">
//           <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium text-sm">
//             {user.firstName[0].toUpperCase()}
//           </div>
//           <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-green-400 border-2 border-white"></div>
//         </div>
        
//         <div className="hidden md:block">
//           <div className="text-sm font-medium text-gray-800">
//             {user.firstName} {user.lastName}
//           </div>
//           <div className="flex items-center text-xs text-gray-500">
//             <UserIcon className="h-3 w-3 mr-1 text-blue-500" />
//             <span className="truncate max-w-[120px]">{user.email}</span>
//           </div>
//         </div>
//       </div>

//       {/* Middle Section - Lab Selector */}
//       <div className="flex-1 max-w-md mx-4 hidden sm:block">
//         {labs.length > 0 && (
//           <div className="relative">
//             <select
//               onChange={handleChange}
//               className="block w-full pl-3 pr-8 py-1.5 text-xs border border-gray-200 rounded-lg bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none"
//               title="Select Lab"
//             >
//               <option value="" disabled selected>
//                 {currentLab?.name || "Select Laboratory"}
//               </option>
//               {labs.map((lab) => (
//                 <option key={lab.id} value={lab.name}>
//                   {lab.name}
//                 </option>
//               ))}
//             </select>
//             <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
//           </div>
//         )}
//       </div>

//       {/* Right Section - Controls */}
//       <div className="flex items-center space-x-3">
//         <div className="hidden md:flex items-center space-x-2 bg-gray-50 rounded-full px-3 py-1">
//           <span className="text-xs text-gray-600">
//             {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
//           </span>
//           <span className="text-xs font-medium text-gray-700">
//             <CurrentTime />
//           </span>
//         </div>

//         <div className="relative group">
//           <select
//             className="text-xs bg-white border border-gray-200 rounded-lg px-2 py-1 pr-6 appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500"
//             title="Select Role"
//           >
//             {user.roles.map((role, index) => (
//               <option key={index} value={role}>
//                 {role}
//               </option>
//             ))}
//           </select>
//           <ChevronDownIcon className="absolute right-1 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
//         </div>

//         <Button
//         text=""
//           onClick={handleLogout}
//           className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors group"
//           // tooltip="Logout"
//           aria-label="Logout"
//         >
//           <PowerIcon className="h-4 w-4 text-gray-500 group-hover:text-red-500 transition-colors" />
//         </Button>
//       </div>
//     </nav>
//   );
// };

// export default TopNav;






import { PowerIcon, UserIcon } from "lucide-react";
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
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.replace("/login");
  };

  return (
    <nav className="flex items-center justify-between py-3 px-6 border-b border-gray-200 bg-white shadow-sm">
      {/* User Information */}
      <div className="flex items-center space-x-4 min-w-0">
        <div className="flex-shrink-0">
          <span
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white text-sm font-medium shadow-sm"
            title={`${user.firstName} ${user.lastName}`}
          >
            {user.firstName[0].toUpperCase()}
          </span>
        </div>
        <div className="min-w-0">
          <h1 className="text-sm font-semibold text-gray-800 truncate">
            {user.firstName} {user.lastName}
          </h1>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <UserIcon className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              <select
                className="bg-gray-50 text-gray-700 rounded-md px-2 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary/50 border border-gray-200 transition cursor-pointer w-20"
                title="Select Role"
              >
                {user.roles.map((role, index) => (
                  <option key={index} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Actions and Controls */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 text-xs text-gray-600 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-200">
          <span className="font-medium">
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
          <span className="text-gray-400">|</span>
          <CurrentTime  />
        </div>

        {labs.length > 0 && (
          <select
            className="text-xs bg-white text-gray-700 rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary/50 hover:bg-gray-50 transition border border-gray-300 shadow-xs cursor-pointer min-w-[160px]"
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
        )}

        {/* Logout Button */}
        <Button
          text=""
          className="bg-red-500 hover:bg-red-800 rounded-md p-1.5 text-white transition border border-gray-200 shadow-xs"
          onClick={handleLogout}
          aria-label="Logout"
          // title="Logout"
        >
          <PowerIcon className="h-4.5 w-4.5" aria-hidden="true" />
        </Button>
      </div>
    </nav>
  );
};

export default TopNav;