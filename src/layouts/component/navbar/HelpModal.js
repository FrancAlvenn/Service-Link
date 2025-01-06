import { Button, Menu, MenuHandler, MenuList, MenuItem } from "@material-tailwind/react";
import { Question, Lightbulb, File, Megaphone, BookOpen, Keyboard, DeviceMobileCamera, ArrowSquareOut, ArrowDown } from "@phosphor-icons/react";

function HelpModal() {
    return (
        <Menu placement="bottom-start">
            <MenuHandler>
                <Button variant="text" className="flex items-center px-3 py-3 gap-x-3">
                    <Question size={24} className="cursor-pointer" />
                </Button>
            </MenuHandler>

            <MenuList className="left z-10 mt-2 w-80 divide-y divide-gray-100 rounded-md bg-white shadow-lg shadow-topping ring-2 ring-black/5 border-none">
                <div className="py-4 px-4 text-sm font-semibold">
                    Help
                </div>
                <div className="py-1">
                    <MenuItem className="flex justify-between items-center px-4 py-2 text-xs hover:bg-gray-200">
                        <div className="flex gap-2 items-center">
                            <Lightbulb size={18} className="cursor-pointer" />
                            <p className="text-xs leading-6">What is Service Link?</p>
                        </div>
                        <ArrowSquareOut size={18} />
                    </MenuItem>

                    <MenuItem className="flex justify-between items-center px-4 py-2 text-xs hover:bg-gray-200">
                        <div className="flex gap-2 items-center">
                            <File size={18} className="cursor-pointer" />
                            <p className="text-xs leading-6">Browse Complete Documentation</p>
                        </div>
                        <ArrowSquareOut size={18} />
                    </MenuItem>

                    <MenuItem className="flex justify-between items-center px-4 py-2 text-xs hover:bg-gray-200">
                        <div className="flex gap-2 items-center">
                            <Megaphone size={18} className="cursor-pointer" />
                            <p className="text-xs leading-6">Submit Feedback About the ServiceLink</p>
                        </div>
                        <ArrowSquareOut size={18} />
                    </MenuItem>

                    <MenuItem className="flex justify-between items-center px-4 py-2 text-xs hover:bg-gray-200">
                        <div className="flex gap-2 items-center">
                            <BookOpen size={18} className="cursor-pointer" />
                            <p className="text-xs leading-6">How to use the System?</p>
                        </div>
                        <ArrowSquareOut size={18} />
                    </MenuItem>

                    <MenuItem className="flex justify-between items-center px-4 py-2 text-xs hover:bg-gray-200">
                        <div className="flex gap-2 items-center">
                            <Keyboard size={18} className="cursor-pointer" />
                            <p className="text-xs leading-6">Keyboard Shortcuts</p>
                        </div>
                        <ArrowSquareOut size={18} />
                    </MenuItem>

                    <MenuItem className="flex justify-between items-center px-4 py-2 text-xs hover:bg-gray-200">
                        <div className="flex gap-2 items-center">
                            <DeviceMobileCamera size={18} className="cursor-pointer" />
                            <p className="text-xs leading-6">Get Service Link Mobile</p>
                        </div>
                        <ArrowDown size={18} />
                    </MenuItem>
                </div>
            </MenuList>
        </Menu>
    );
}

export default HelpModal;
