import {
  Button,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Typography,
} from "@material-tailwind/react";
import {
  UserCircle,
  User,
  ArrowSquareOut,
  SignOut,
} from "@phosphor-icons/react";
import { useContext } from "react";
import { AuthContext } from "../../../features/authentication";
import { useNavigate } from "react-router-dom";

function ProfileModal() {
  const { user, clearAuthData } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Remove user data and token from local storage
    localStorage.removeItem("user");
    localStorage.removeItem("access_token");
    localStorage.removeItem("userPreference");

    // Remove user from AuthContext
    clearAuthData();

    // Redirect to login page
    navigate("/");
  };

  return (
    <Menu placement="bottom-start" dismiss={{ itemPress: false }}>
      <MenuHandler>
        <Button variant="text" className="flex items-center px-3 py-3 gap-x-3">
          <UserCircle size={24} className="cursor-pointer" />
          <p className="text-xs font-bold leading-3">
            {user ? `${user.first_name}  ${user.last_name}` : "User"}
          </p>
        </Button>
      </MenuHandler>

      <MenuList className="w-[320px] max-h-[500px] overflow-auto p-4 dark:bg-gray-900 dark:text-gray-100 z-[9999]">
        <Typography variant="h6" color="blue-gray" className="mb-3 text-md">
          Account
        </Typography>
        <div className="py-1">
          <MenuItem className="flex justify-between items-center px-4 py-2 text-xs text-gray-700 hover:bg-gray-200">
            <div className="flex gap-2 items-center">
              <User size={28} className="cursor-pointer" />
              <span className="flex flex-col items-start">
                <p className="text-xs font-bold leading-3">
                  {user ? `${user.first_name}  ${user.last_name}` : "User"}
                </p>
                <p className="text-xs text-gray-500">
                  {user ? `${user.email}` : ""}
                </p>
              </span>
            </div>
          </MenuItem>

          <MenuItem className="flex justify-between items-center px-4 py-2 text-xs text-gray-700 hover:bg-gray-200">
            <div className="flex gap-2 items-center">
              <p className="text-xs leading-3">Manage account</p>
            </div>
            <ArrowSquareOut size={18} />
          </MenuItem>
        </div>

        <div className="py-1">
          <MenuItem
            className="flex justify-between items-center px-4 py-2 text-xs text-gray-700 hover:bg-gray-200"
            onClick={() => {
              handleLogout();
            }}
          >
            <div className="flex gap-2 items-center">
              <p className="text-xs leading-6 text-red-500">Logout</p>
            </div>
            <SignOut size={18} />
          </MenuItem>
        </div>
      </MenuList>
    </Menu>
  );
}

export default ProfileModal;
