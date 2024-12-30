import { Menu, MenuButton, MenuItem, MenuItems, } from "@headlessui/react";
import { ArrowSquareOut, Bell } from "@phosphor-icons/react";

const notifications = [
    {
        id: 1,
        title: 'Request Submitted',
        description: 'Job Request has been submitted',
    },
    {
        id: 2,
        title: 'Request Updated',
        description: 'Job Request has been updated',
    },
];

function NotificationModal() {
    return (
        <Menu as="div" className="relative inline-block text-left">
            <div>
                <MenuButton className="inline-flex w-full justify-center items-center gap-x-3 rounded-md p-2 text-sm font-semibold text-gray-900  hover:bg-gray-200">
                <Bell size={24} className='cursor-pointer'/>
                </MenuButton>
            </div>

            <MenuItems
                transition
                className="absolute left-0 z-10 mt-2 w-80 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
                anchor="bottom end" >
                <div className="py-4 px-4 text-sm sm:text-base font-semibold">
                    Notification
                </div>
                <div className="py-1">
                    {notifications.map((notification) => (
                        <MenuItem key={notification.id}>
                            <a
                                href="#"
                                className={"flex items-center px-4 py-2 text-xs  hover:bg-gray-200"}
                            >
                                <div className="flex-auto">
                                    <p className="text-xs font-semibold leading-6 text-gray-900">
                                    {notification.title}
                                    </p>
                                    <p className="mt-1 text-xs leading-5 text-gray-500">
                                    {notification.description}
                                    </p>
                                </div>
                                <ArrowSquareOut size={18} />
                            </a>
                        </MenuItem>
                    ))
                    }
                </div>
                <div className="py-1">
                    <MenuItem>
                        <a
                            href="#"
                            className={"flex items-center justify-end px-4 py-4 text-xs text-blue-500 hover:bg-gray-200"}
                        >
                            View all
                        </a>
                    </MenuItem>
                </div>
            </MenuItems>
        </Menu>
    )
}

export default NotificationModal;