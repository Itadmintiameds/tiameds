import { FiCalendar, FiChevronDown, FiPower, FiUser } from "react-icons/fi";
import { HiOutlineBuildingOffice2 } from "react-icons/hi2";
import Button from "../common/Button";
import CurrentTime from "../common/CurrentTime";
import { handleLogout } from "@/utils/auth";

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
              {/* <option value="" disabled>
                {currentLab?.name || "Select Lab"}
              </option> */}
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