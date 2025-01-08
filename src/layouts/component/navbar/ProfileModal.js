import { Button, Menu, MenuHandler, MenuList, MenuItem } from "@material-tailwind/react";
import { UserCircle, User, ArrowSquareOut, SignOut } from "@phosphor-icons/react";
import { useContext } from "react";
import { AuthContext } from "../../../features/authentication";
import { useNavigate } from "react-router-dom";

function ProfileModal() {

    const { clearAuthData } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        // Remove user data and token from local storage
        localStorage.removeItem('user');
        localStorage.removeItem('access_token');

        // Remove user from AuthContext
        clearAuthData();

        // Redirect to login page
        navigate('/');
    };

    return (
        <Menu placement="bottom-start">
            <MenuHandler>
                <Button variant="text" className="flex items-center px-3 py-3 gap-x-3">
                    <UserCircle size={24} className="cursor-pointer" />
                </Button>
            </MenuHandler>

            <MenuList className="left z-10 mt-2 w-80 divide-y divide-gray-100 rounded-md bg-white shadow-lg shadow-topping ring-2 ring-black/5 border-none">
                <div className="py-4 px-4 text-sm font-semibold">
                    Account
                </div>
                <div className="py-1">
                    <MenuItem className="flex justify-between items-center px-4 py-2 text-xs text-gray-700 hover:bg-gray-200">
                        <div className="flex gap-2 items-center">
                            <User size={32} className="cursor-pointer" />
                            <span className="flex flex-col items-start">
                                <p className="text-xs font-bold leading-3">Ivy Mera</p>
                                <p className="text-xs text-gray-500">ivymera@dyci.edu.ph</p>
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
                        onClick={()=>{handleLogout()}}
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
