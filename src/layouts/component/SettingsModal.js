


import { Toggle } from "@gilbarbara/components";
import { Menu, MenuButton, MenuItem, MenuItems, } from "@headlessui/react";
import { ArrowDown, ArrowSquareOut, BookOpen, ChatCircle, DeviceMobileCamera, Envelope, File, Gear, Info, Keyboard, Megaphone, Question, Warning } from "@phosphor-icons/react";

function SettingsModal() {
    return (
        <Menu as="div" className="relative inline-block text-left">
            <div>
                <MenuButton className="inline-flex w-full justify-center items-center gap-x-3 rounded-md p-2 text-sm font-semibold text-gray-900  hover:bg-gray-200">
                <Gear size={24} className='cursor-pointer'/>
                </MenuButton>
            </div>

            <MenuItems
                transition
                className="absolute left-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
                anchor="bottom end" >
                <div className="py-4 px-4 text-sm sm:text-base font-semibold">
                    Settings
                </div>
                <div className="py-1">
                    <MenuItem>
                        <a href="#"
                            className={"flex justify-between items-center px-4 py-2 text-xs hover:bg-gray-200"}
                        >
                            <div className="flex gap-2 items-center">
                                <p className="text-xs leading-6"> Theme </p>
                            </div>
                            <Toggle
                                accent="primary"
                                aria-label="Toggle"
                                defaultChecked
                                onChange={function Ki(){}}
                                size="sm"
                                title="Toggle"
                            />
                        </a>
                    </MenuItem>

                    <MenuItem>
                        <a href="#"
                            className={"flex justify-between items-center px-4 py-2 text-xs hover:bg-gray-200"}
                        >
                            <div className="flex gap-2 items-center">
                                <p className="text-xs leading-6"> Email Notification </p>
                            </div>
                            <Envelope size={18} />
                        </a>
                    </MenuItem>

                    <MenuItem>
                        <a href="#"
                            className={"flex justify-between items-center px-4 py-2 text-xs hover:bg-gray-200"}
                        >
                            <div className="flex gap-2 items-center">
                                <p className="text-xs leading-6"> SMS Notification </p>
                            </div>
                            <ChatCircle size={18} />
                        </a>
                    </MenuItem>

                    <MenuItem>
                        <a href="#"
                            className={"flex justify-between items-center px-4 py-2 text-xs hover:bg-gray-200"}
                        >
                            <div className="flex gap-2 items-center">
                                <p className="text-xs leading-6"> Push Notification </p>
                            </div>
                            <DeviceMobileCamera size={18} />
                        </a>
                    </MenuItem>

                    <MenuItem>
                        <a href="#"
                            className={"flex justify-between items-center px-4 py-2 text-xs hover:bg-gray-200"}
                        >
                            <div className="flex gap-2 items-center">
                                <p className="text-xs leading-6"> Help Center </p>
                            </div>
                            <Info size={18} />
                        </a>
                    </MenuItem>

                    <MenuItem>
                        <a href="#"
                            className={"flex justify-between items-center px-4 py-2 text-xs hover:bg-gray-200"}
                        >
                            <div className="flex gap-2 items-center">
                                <p className="text-xs leading-6"> Report an issue </p>
                            </div>
                            <Warning size={18} />
                        </a>
                    </MenuItem>

                    
                </div>
                    <div className="py-1">
                        <MenuItem>
                            <a href="#"
                                className={"flex justify-end items-center px-4 py-2 text-xs text-gray-500 hover:bg-gray-200"}
                            >
                                <div className="flex gap-2 items-center">
                                    <p className="text-xs leading-6"> Show all settings </p>
                                </div>
                            </a>
                        </MenuItem>
                    </div>
            </MenuItems>
        </Menu>
    )
}

export default SettingsModal;