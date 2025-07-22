import { Switch, Typography } from '@material-tailwind/react';
import { ArrowLeft, Bell, DeviceMobileCamera, Envelope } from '@phosphor-icons/react';
import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../../../features/authentication';

function NotificationSettings({ onClose }) {
    const { user } = useContext(AuthContext);
    const userId = user?.reference_number || "DYCI-2025-00001"; // Fallback user ID

    // State for notification preferences
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [smsNotifications, setSmsNotifications] = useState(false);

    // Fetch user preferences from localStorage and backend
    useEffect(() => {
        const fetchPreferences = async () => {
            try {
                // Retrieve from localStorage
                const storedPreferences = JSON.parse(localStorage.getItem('userPreference'));
                if (storedPreferences && storedPreferences.user_id === userId) {
                    setNotificationsEnabled(storedPreferences.notifications_enabled);
                    setEmailNotifications(storedPreferences.email_notifications_enabled);
                    setSmsNotifications(storedPreferences.sms_notifications_enabled);
                }

                // Fetch from backend
                const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/settings/user_preference/${userId}`, { withCredentials: true });
                if (data) {
                    setNotificationsEnabled(data.notifications_enabled);
                    setEmailNotifications(data.email_notifications_enabled);
                    setSmsNotifications(data.sms_notifications_enabled);

                    // Update localStorage
                    localStorage.setItem('userPreference', JSON.stringify(data));
                }
            } catch (error) {
                console.error('Error fetching notification preferences:', error);
            }
        };

        fetchPreferences();
    }, [userId]);

    // Function to update preferences in DB and local storage
    const updatePreferences = async (updatedValues) => {
        try {
            const updatedPreferences = {
                notifications_enabled: updatedValues.notificationsEnabled,
                email_notifications_enabled: updatedValues.emailNotifications,
                sms_notifications_enabled: updatedValues.smsNotifications,
            };

            // Update backend
            await axios.put(`${process.env.REACT_APP_API_URL}/settings/user_preference/${userId}`, updatedPreferences, { withCredentials: true });

            // Update local storage
            localStorage.setItem(
                'userPreference',
                JSON.stringify({
                    ...JSON.parse(localStorage.getItem('userPreference')),
                    ...updatedPreferences,
                })
            );
        } catch (error) {
            console.error('Failed to update notification preferences:', error);
        }
    };

    // Handlers for toggling preferences
    const handleToggleNotifications = () => {
        const newState = !notificationsEnabled;
        setNotificationsEnabled(newState);

        // If turning notifications off, also disable email & SMS
        if (!newState) {
            setEmailNotifications(false);
            setSmsNotifications(false);
        }

        updatePreferences({
            notificationsEnabled: newState,
            emailNotifications: newState ? emailNotifications : false,
            smsNotifications: newState ? smsNotifications : false,
        });
    };

    const handleToggleEmail = () => {
        if (!notificationsEnabled) return; // Prevent enabling when notifications are disabled
        const newState = !emailNotifications;
        setEmailNotifications(newState);
        updatePreferences({ notificationsEnabled, emailNotifications: newState, smsNotifications });
    };

    const handleToggleSms = () => {
        if (!notificationsEnabled) return; // Prevent enabling when notifications are disabled
        const newState = !smsNotifications;
        setSmsNotifications(newState);
        updatePreferences({ notificationsEnabled, emailNotifications, smsNotifications: newState });
    };

    return (
        <div className="fixed top-0 right-0 w-full max-w-[750px] h-full bg-white dark:bg-gray-900 dark:text-gray-100 z-100 p-6 overflow-y-auto">
            <div className="flex flex-col justify-between items-start mb-6 w-full">
                <div className="flex items-center justify-between w-full">
                    <div className="p-1 rounded-md bg-gray-500 dark:bg-gray-700 mb-3">
                        <ArrowLeft size={24} color="white" className="cursor-pointer" onClick={onClose} />
                    </div>
                </div>

                <Typography variant="h5" className="text-gray-800 dark:text-gray-100 font-bold text-xl mb-4">
                    Notification Settings
                </Typography>

                <div className="flex flex-col gap-3 pt-2 pb-2 px-5 border border-gray-200 dark:border-gray-700 rounded-lg w-full">
                    <div className="flex items-center justify-between w-full py-3">
                        <div className="flex gap-2 items-center">
                            <Bell size={20} className="text-black dark:text-gray-200" />
                            <Typography className="text-sm font-medium text-gray-900 dark:text-gray-100 py-0">
                                Enable Notifications
                            </Typography>
                        </div>
                        <Switch color="blue" checked={notificationsEnabled} onChange={handleToggleNotifications} />
                    </div>

                    {/* Individual Notification Preferences */}
                    <div className={`flex items-center justify-between w-full py-3 ${!notificationsEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <div className="flex gap-2 items-center">
                            <Envelope size={20} className="text-black dark:text-gray-200" />
                            <Typography className="text-sm font-medium text-gray-900 dark:text-gray-100 py-0">
                                Email Notification
                            </Typography>
                        </div>
                        <Switch color="blue" checked={emailNotifications} onChange={handleToggleEmail} disabled={!notificationsEnabled} />
                    </div>

                    <div className={`flex items-center justify-between w-full py-3 ${!notificationsEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <div className="flex gap-2 items-center">
                            <DeviceMobileCamera size={20} className="text-black dark:text-gray-200" />
                            <Typography className="text-sm font-medium text-gray-900 dark:text-gray-100 py-0">
                                SMS Notification
                            </Typography>
                        </div>
                        <Switch color="blue" checked={smsNotifications} onChange={handleToggleSms} disabled={!notificationsEnabled} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default NotificationSettings;
