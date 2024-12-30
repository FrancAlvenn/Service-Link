


import { Menu, MenuButton, MenuItem, MenuItems, } from "@headlessui/react";
import { ArrowDown, ArrowSquareOut, BookOpen, DeviceMobileCamera, File, Keyboard, Lightbulb, Megaphone, Question, SignOut, User, UserCircle } from "@phosphor-icons/react";

function ProfileModal() {
    return (
        <Menu as="div" className="relative inline-block text-left">
            <div>
                <MenuButton className="inline-flex w-full justify-center items-center gap-x-3 rounded-md p-2 text-sm font-semibold text-gray-900  hover:bg-gray-200">
                <UserCircle size={24} className='cursor-pointer'/>
                </MenuButton>
            </div>

            <MenuItems
                transition
                className="absolute left-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
                anchor="bottom end" >
                <div className="py-4 px-4 text-sm sm:text-base font-semibold">
                    Account
                </div>
                <div className="py-1">
                    <MenuItem>
                        <a href="#"
                            className={"flex justify-between items-center px-4 py-2 text-xs text-gray-700 hover:bg-gray-200"}
                        >
                            <div className="flex gap-2 items-center">
                                <User size={32} className='cursor-pointer'/>
                                <span>
                                    <p className="text-xs leading-3"> Ivy Mera </p>
                                    <p className="text- text-gray-500">ivymera@dyci.edu.ph</p>
                                </span>
                            </div>
                        </a>
                    </MenuItem>

                    <MenuItem>
                        <a href="#"
                            className={"flex justify-between items-center px-4 py-2 text-xs text-gray-700 hover:bg-gray-200"}
                        >
                            <div className="flex gap-2 items-center">
                                <p className="text-xs leading-3"> Manage account </p>
                            </div>
                            <ArrowSquareOut size={18} />
                        </a>
                    </MenuItem>
                </div>

                <div className="py-1">
                    <MenuItem>
                        <a href="#"
                            className={"flex justify-between items-center px-4 py-2 text-xs text-gray-700 hover:bg-gray-200"}
                        >
                            <div className="flex gap-2 items-center">
                                <p className="text-xs leading-6 text-red-500"> Logout</p>
                            </div>
                            <SignOut size={18} />
                        </a>
                    </MenuItem>
                </div>
            </MenuItems>
        </Menu>
    )
}

export default ProfileModal;