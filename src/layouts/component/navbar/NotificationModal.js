import { Button, Menu, MenuHandler, MenuList, MenuItem } from "@material-tailwind/react";
import { Bell, ArrowSquareOut } from "@phosphor-icons/react";

const notifications = [
    {
        id: 1,
        title: "Request Submitted",
        description: "Job Request has been submitted",
    },
    {
        id: 2,
        title: "Request Updated",
        description: "Job Request has been updated",
    },
];

function NotificationModal() {
    return (
        <Menu placement="bottom-start" dismissType="click">
            <MenuHandler>
                <Button variant="text" className="flex items-center px-3 py-3 gap-x-3">
                    <Bell size={24} className="cursor-pointer" />
                </Button>
            </MenuHandler>

            <MenuList className="left z-10 mt-2 w-80 divide-y divide-gray-100 rounded-md bg-white shadow-lg shadow-topping ring-2 ring-black/5 border-none">
                <div className="py-4 px-4 text-sm font-semibold">
                    Notification
                </div>
                <div className="py-1">
                    {notifications.map((notification) => (
                        <MenuItem key={notification.id} className="flex justify-between items-center px-4 py-2 text-xs hover:bg-gray-200">
                            <div className="flex flex-col items-start">
                                <p className="text-xs font-semibold leading-6 text-gray-900">
                                    {notification.title}
                                </p>
                                <p className="mt-1 text-xs leading-3 text-gray-500">
                                    {notification.description}
                                </p>
                            </div>
                            <ArrowSquareOut size={18} />
                        </MenuItem>
                    ))}
                </div>
                <div className="py-1">
                    <MenuItem className="flex items-center justify-end px-4 py-4 text-xs text-blue-500 hover:bg-gray-200">
                        View all
                    </MenuItem>
                </div>
            </MenuList>
        </Menu>
    );
}

export default NotificationModal;
