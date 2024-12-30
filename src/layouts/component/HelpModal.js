


import { Menu, MenuButton, MenuItem, MenuItems, } from "@headlessui/react";
import { ArrowDown, ArrowSquareOut, BookOpen, DeviceMobileCamera, File, Keyboard, Lightbulb, Megaphone, Question } from "@phosphor-icons/react";

function HelpModal() {
    return (
        <Menu as="div" className="relative inline-block text-left">
            <div>
                <MenuButton className="inline-flex w-full justify-center items-center gap-x-3 rounded-md p-2 text-sm font-semibold text-gray-900  hover:bg-gray-200">
                <Question size={24} className='cursor-pointer'/>
                </MenuButton>
            </div>

            <MenuItems
                transition
                className="absolute left-0 z-10 mt-2 w-80 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
                anchor="bottom end" >
                <div className="py-4 px-4 text-sm sm:text-base font-semibold">
                    Help
                </div>
                <div className="py-1">
                    <MenuItem>
                        <a href="#"
                            className={"flex justify-between items-center px-4 py-2 text-xs  hover:bg-gray-200"}
                        >
                            <div className="flex gap-2 items-center">
                                <Lightbulb size={18} className='cursor-pointer'/>
                                <p className="text-xs leading-6"> What is Service Link? </p>
                            </div>
                            <ArrowSquareOut size={18} />
                        </a>
                    </MenuItem>

                    <MenuItem>
                        <a href="#"
                            className={"flex justify-between items-center px-4 py-2 text-xs  hover:bg-gray-200"}
                        >
                            <div className="flex gap-2 items-center">
                                <File size={18} className='cursor-pointer'/>
                                <p className="text-xs leading-6"> Browse Complete Documentation </p>
                            </div>
                            <ArrowSquareOut size={18} />
                        </a>
                    </MenuItem>

                    <MenuItem>
                        <a href="#"
                            className={"flex justify-between items-center px-4 py-2 text-xs  hover:bg-gray-200"}
                        >
                            <div className="flex gap-2 items-center">
                                <Megaphone size={18} className='cursor-pointer'/>
                                <p className="text-xs leading-6"> Submit Feedback About the ServiceLink </p>
                            </div>
                            <ArrowSquareOut size={18} />
                        </a>
                    </MenuItem>

                    <MenuItem>
                        <a href="#"
                            className={"flex justify-between items-center px-4 py-2 text-xs  hover:bg-gray-200"}
                        >
                            <div className="flex gap-2 items-center">
                                <BookOpen size={18} className='cursor-pointer'/>
                                <p className="text-xs leading-6"> How to use the System? </p>
                            </div>
                            <ArrowSquareOut size={18} />
                        </a>
                    </MenuItem>

                    <MenuItem>
                        <a href="#"
                            className={"flex justify-between items-center px-4 py-2 text-xs  hover:bg-gray-200"}
                        >
                            <div className="flex gap-2 items-center">
                                <Keyboard size={18} className='cursor-pointer'/>
                                <p className="text-xs leading-6"> Keyboard Shortcuts </p>
                            </div>
                            <ArrowSquareOut size={18} />
                        </a>
                    </MenuItem>

                    <MenuItem>
                        <a href="#"
                            className={"flex justify-between items-center px-4 py-2 text-xs  hover:bg-gray-200"}
                        >
                            <div className="flex gap-2 items-center">
                                <DeviceMobileCamera size={18} className='cursor-pointer'/>
                                <p className="text-xs leading-6"> Get Service Link Mobile </p>
                            </div>
                            <ArrowDown size={18} />
                        </a>
                    </MenuItem>

                    
                </div>
            </MenuItems>
        </Menu>
    )
}

export default HelpModal;