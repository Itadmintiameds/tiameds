import { MailIcon, PowerIcon, UserIcon } from "lucide-react";
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
  return (
    <nav className="flex items-center justify-between py-2 px-6 border-b border-gray-200 bg-white shadow-md rounded">
      <div className="flex items-center space-x-4">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
          <span className="text-lg font-bold text-white">{user.firstName[0].toUpperCase()}</span>
        </span>
        <h1 className="text-sm font-semibold text-gray-800">
          {user.firstName.toUpperCase()} {user.lastName.toUpperCase()}
        </h1>
        <h2 className="flex items-center text-sm text-gray-500">
          <MailIcon className="h-4 w-4 mr-1 text-primary" aria-hidden="true" />
          <span className="text-xs font-semibold text-gray-100 ml-2 bg-primary rounded-full px-2 py-1">
            {user.email}
          </span>
        </h2>
        <h3 className="flex items-center text-xs text-gray-500">
          <UserIcon className="h-4 w-4 mr-1 text-primary" aria-hidden="true" />
          <select className="text-xs font-semibold text-gray-100 bg-primary rounded-full px-2 py-1 ml-2">
            {user.roles.map((role, index) => (
              <option key={index} value={role}>{role}</option>
            ))}
          </select>
          <span className="text-xs font-semibold text-gray-100 ml-2 bg-primary rounded-full px-2 py-1">
            {new Date().toDateString()}
          </span>
          <CurrentTime />
        </h3>
      </div>
      <div className="flex items-center space-x-3 ml-auto">
        {labs.length > 0 && (
          <select
            className="text-xs text-white bg-primary border border-gray-600 px-10 py-2 rounded-md shadow-sm focus:ring-2 focus:ring-primary focus:outline-none transition duration-200 hover:bg-opacity-90"
            onChange={handleChange}
            defaultValue=""
          >
            <option value="" disabled>{currentLab?.name || "Select a Lab"}</option>
            {labs.map((lab) => (
              <option key={lab.id} value={lab.name}>{lab.name}</option>
            ))}
          </select>
        )}
        <Button
          text=""
          className="relative flex items-center justify-center bg-primary text-white px-1 flex item-center jutify-center hover:bg-primarylight rounded-md"
          onClick={() => {
            toast.success("Logged out successfully", {
              position: "top-right",
              autoClose: 2000,
            });
            localStorage.removeItem("user");
            document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            window.location.href = "/login";
          }}
          aria-label="Logout"
        >
          <PowerIcon className="h-4 w-4 text-white mr-2" aria-hidden="true" /> {/* Adjust icon size */}
        </Button>
      </div>
    </nav>
  );
};

export default TopNav;
