import { Button, Menu, MenuHandler, MenuList, MenuItem, Chip, Typography } from "@material-tailwind/react";
import { Bell, ArrowSquareOut } from "@phosphor-icons/react";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { AuthContext } from "../../../features/authentication";


dayjs.extend(relativeTime);

function NotificationModal() {
    const { user } = useContext(AuthContext);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000); // Refresh every 60 seconds
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await axios.get(`/notifications/${user.reference_number}`, { withCredentials: true });
            setNotifications(response.data || []);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    };

    const markAsRead = async (id) => {
        try {
            await axios.put(`/notifications/${id}`, { viewed: true }, { withCredentials: true });
            setNotifications(notifications.map(n => n.id === id ? { ...n, viewed: true } : n));
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    return (
        <Menu placement="bottom-start" dismiss={{ itemPress: false }}>
            <MenuHandler>
                <Button variant="text" className="flex items-center px-3 py-3 gap-x-3 relative">
                    <Bell size={24} className="cursor-pointer" />
                    {notifications.some(n => !n.viewed) && (
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                    )}
                </Button>
            </MenuHandler>

            <MenuList className="left z-10 mt-2 w-80 divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-2 ring-black/5 border-none">
                <div className="py-4 px-4 text-sm font-semibold text-black">
                    Notifications
                </div>

                <div className="py-1 max-h-96 overflow-auto">
                    {notifications.length > 0 ? (
                        notifications.map(notification => (
                            <MenuItem
                                key={notification.id}
                                onClick={() => markAsRead(notification.id)}
                                className={`flex justify-between items-center px-4 py-2 text-xs hover:bg-gray-200 ${
                                    notification.viewed ? "bg-gray-100" : "bg-blue-50"
                                }`}
                            >
                                <div className="flex flex-col items-start">
                                    <Typography variant="small" className="text-xs font-semibold text-black">
                                        {notification.title}
                                    </Typography>
                                    <Typography variant="small" className="text-xs text-gray-500">
                                        {notification.description}
                                    </Typography>
                                    <Chip size="sm" variant="outlined" color="blue-gray" className="mt-1" value={notification.request_type} />
                                    <span className="text-[10px] text-gray-400">{dayjs(notification.created_at).fromNow()}</span>
                                </div>
                                <ArrowSquareOut size={18} className="cursor-pointer text-black" />
                            </MenuItem>
                        ))
                    ) : (
                        <div className="text-center text-gray-500 py-4 text-xs">
                            No new notifications
                        </div>
                    )}
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
