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
    });
    localStorage.removeItem("user");
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.replace("/login");
  };

  return (
    <nav className="flex items-center justify-between py-2 px-6 border-b border-gray-200 bg-white shadow-sm rounded-md">
      {/* User Information */}
      <div className="flex items-center space-x-4 truncate">
        <span
          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white text-sm font-bold"
          title={`${user.firstName} ${user.lastName}`}
        >
          {user.firstName[0].toUpperCase()}
        </span>
        <div className="leading-tight truncate">
          <h1 className="text-sm font-semibold text-gray-800 truncate">
            {user.firstName.toUpperCase()} {user.lastName.toUpperCase()}
          </h1>
          <div className="flex items-center gap-2 text-xs text-gray-500 truncate">
            <UserIcon className="h-4 w-4 text-primary" aria-hidden="true" />
            <select
              className="bg-primary text-white rounded-md px-2 py-1 text-xs focus:outline-none focus:ring focus:ring-primary/50 transition"
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

      {/* Actions and Controls */}
      <div className="flex items-center space-x-3">
        <span className="bg-primary text-white text-xs rounded-full px-2 py-0.5">
          {new Date().toLocaleDateString()}
        </span>
        <CurrentTime />

        {labs.length > 0 && (
          <select
            className="text-xs bg-primary text-white rounded-md px-3 py-1 focus:outline-none focus:ring-1 focus:ring-primary/50 hover:bg-primary/90 transition"
            onChange={handleChange}
            defaultValue=""
            title="Select Lab"
          >
            <option value="" disabled>
              {currentLab?.name || "Select a Lab"}
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
          className="bg-red-500 hover:bg-red-600 rounded-md p-1 text-white transition"
          onClick={handleLogout}
          aria-label="Logout"
        >
          <PowerIcon className="h-5 w-5" aria-hidden="true" />
        </Button>
      </div>
    </nav>
  );
};

export default TopNav;