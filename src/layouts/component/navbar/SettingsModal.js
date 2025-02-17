import { Button, Menu, MenuHandler, MenuList, MenuItem, Switch } from "@material-tailwind/react";
import { Gear, Envelope, ChatCircle, DeviceMobileCamera, Info, Warning } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";

function SettingsModal() {

    return (
        <div>
            <Menu placement="bottom-start" dismiss={{ itemPress: false }}>
                <MenuHandler>
                    <Button variant="text" className="flex items-center px-3 py-3 gap-x-3">
                        <Gear size={24} className="cursor-pointer" />
                    </Button>
                </MenuHandler>
                <MenuList className="left z-10 mt-2 w-80 divide-y divide-gray-100 rounded-md bg-white shadow-lg shadow-topping ring-2 ring-black/5 border-none text-black">
                    <div className="py-4 px-4 text-sm font-semibold">
                        Settings
                    </div>
                    <div className="py-1">
                        <MenuItem className="flex justify-between items-center px-4 py-2 hover:bg-gray-200">
                            <div className="flex gap-2 items-center">
                                <p className="text-xs leading-6">Theme</p>
                            </div>
                            <Switch
                                color="blue"
                                id="theme-toggle"
                                defaultChecked
                                ripple={true}
                            />
                        </MenuItem>
                        <MenuItem className="flex justify-between items-center px-4 py-2 hover:bg-gray-200">
                            <div className="flex gap-2 items-center">
                                <p className="text-xs leading-6">Email Notification</p>
                            </div>
                            <Envelope size={18} />
                        </MenuItem>
                        <MenuItem className="flex justify-between items-center px-4 py-2 hover:bg-gray-200">
                            <div className="flex gap-2 items-center">
                                <p className="text-xs leading-6">SMS Notification</p>
                            </div>
                            <ChatCircle size={18} />
                        </MenuItem>
                        <MenuItem className="flex justify-between items-center px-4 py-2 hover:bg-gray-200">
                            <div className="flex gap-2 items-center">
                                <p className="text-xs leading-6">Push Notification</p>
                            </div>
                            <DeviceMobileCamera size={18} />
                        </MenuItem>
                        <MenuItem className="flex justify-between items-center px-4 py-2 hover:bg-gray-200">
                            <div className="flex gap-2 items-center">
                                <p className="text-xs leading-6">Help Center</p>
                            </div>
                            <Info size={18} />
                        </MenuItem>
                        <MenuItem className="flex justify-between items-center px-4 py-2 hover:bg-gray-200">
                            <div className="flex gap-2 items-center">
                                <p className="text-xs leading-6">Report an issue</p>
                            </div>
                            <Warning size={18} />
                        </MenuItem>
                    </div>
                    <div className="py-1">
                        <MenuItem className="flex justify-end items-center px-4 py-2 text-xs text-gray-500 hover:bg-gray-200">
                            <div className="flex gap-2 items-center">
                                <p className="text-xs leading-6">Show all settings</p>
                            </div>
                        </MenuItem>
                    </div>
                </MenuList>
            </Menu>
        </div>
    );
}

export default SettingsModal;
