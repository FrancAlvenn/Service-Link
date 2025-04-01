import { Button, Dialog, DialogBody, DialogFooter, DialogHeader, Typography } from '@material-tailwind/react';
import { Bell, ChatCircleText, FileText, Gear, Lightbulb, Lock, PuzzlePiece, Sparkle, Sun, User } from '@phosphor-icons/react';
import React, { useContext, useState } from 'react';
import { AuthContext } from '../../features/authentication';
import { AnimatePresence, motion } from 'framer-motion';
import AccountSetting from '../component/settings/AccountSetting';
import NotificationSettings from '../component/settings/NotificationSettings';
import ThemeSetting from '../component/settings/ThemeSetting';
import PrivacyPolicy from '../component/settings/PrivacyPolicy';
import TermsOfServices from '../component/settings/TermsOfServices';
import { useNavigate } from 'react-router-dom';

function Profile() {
    const { user, clearAuthData } = useContext(AuthContext);
    const [selectedSetting, setSelectedSetting] = useState('');
    const navigate = useNavigate();

    const [openLogoutModal, setOpenLogoutModal] = useState(false);

    function closeSettingOverlay() {
        setSelectedSetting('');
    }

    function logOut() {
        // document.documentElement.classList.remove("dark");
        clearAuthData();
        navigate('/');
    }

    const renderSettingComponent = () => {
        switch (selectedSetting) {
            case 'account':
                return <AccountSetting onClose={closeSettingOverlay} />;
            case 'notification':
                return <NotificationSettings onClose={closeSettingOverlay} />;
            case 'theme':
                return <ThemeSetting onClose={closeSettingOverlay} />;
            case 'privacy':
                return <PrivacyPolicy onClose={closeSettingOverlay} />;
            case 'terms':
                return <TermsOfServices onClose={closeSettingOverlay} />;
            default:
                return null;
        }
    };

    return (
        <div className=" bg-white dark:bg-gray-900 rounded-lg w-full mt-0 px-3 pt-4 pb-20 flex flex-col gap-6">

            <div className='flex flex-col items-center justify-center gap-3 w-full'>
                <span className='p-2 rounded-lg bg-blue-500 dark:bg-blue-700 w-fit'>
                    <User size={40} className='text-white' />
                </span>
                <Typography variant="h6" className="dark:text-white">
                    {`${user.last_name || user.first_name ? `${(user.last_name).toUpperCase() || ''}, ${(user.first_name).toUpperCase() || ''}` : 'User'}`}
                </Typography>
            </div>

            <div className="flex flex-col gap-3 pt-5 pb-2 px-5 border border-gray-200 dark:border-gray-700 rounded-lg w-full">
                <Typography className="text-sm font-semibold dark:text-white">Settings</Typography>
                {[
                    { key: 'account', icon: <Gear size={20} className='text-black dark:text-gray-200' />, label: 'Account Settings' },
                    { key: 'notification', icon: <Bell size={20} className='text-black dark:text-gray-200'/>, label: 'Notification Settings' },
                    { key: 'theme', icon: <Sun size={20} className='text-black dark:text-gray-200' />, label: 'Theme' },
                    { key: 'privacy', icon: <Lock size={20} className='text-black dark:text-gray-200' />, label: 'Privacy Policy' },
                    { key: 'terms', icon: <FileText size={20} className='text-black dark:text-gray-200' />, label: 'Terms of Services' },
                ].map(({ key, icon, label }) => (
                    <div
                        key={key}
                        className="flex gap-2 py-4 px-2 items-center border-b border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                        onClick={() => setSelectedSetting(key)}
                    >
                        {icon}
                        <Typography className="text-sm font-medium dark:text-gray-300">{label}</Typography>
                    </div>
                ))}
            </div>

            <div className="flex flex-col p-5 border border-gray-200 dark:border-gray-700 rounded-lg w-full">
                <Typography className="text-sm font-semibold dark:text-white">Support and Feedback</Typography>
                <div className="flex gap-2 py-5 items-start">
                    {[
                        { icon: <Lightbulb size={25} className='text-white dark:text-gray-200' />, label: 'Send Feedback' },
                        { icon: <Sparkle size={25} className='text-white dark:text-gray-200' />, label: 'Rate the App' },
                        { icon: <PuzzlePiece size={25} className='text-white dark:text-gray-200' />, label: 'Report a Problem' },
                        { icon: <ChatCircleText size={25} className='text-white dark:text-gray-200'/>, label: 'Ask a Question' },
                    ].map(({ icon, label }, index) => (
                        <div key={index} className='flex flex-col items-center justify-center gap-1 w-1/4'>
                            <span className='p-2 rounded-lg bg-blue-500 dark:bg-blue-700 w-fit'>{icon}</span>
                            <Typography className="text-xs font-medium text-wrap w-full text-center text-gray-800 dark:text-gray-300">{label}</Typography>
                        </div>
                    ))}
                </div>
            </div>

            <div className='mt-3'>
            <Typography 
                className="text-sm font-medium w-full text-center text-red-500 hover:underline dark:text-red-400"
                onClick={() => setOpenLogoutModal(true)}
                >
                Log out from Service Link
                </Typography>
            </div>


            <AnimatePresence>
                {selectedSetting && (
                    <>
                        {/* Gray Background Overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.1 }}
                            className="fixed inset-0 bg-black z-40"
                            onClick={closeSettingOverlay}
                        />

                        {/* Sliding Request Panel */}
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="fixed top-0 right-0 w-full max-w-[750px] h-full bg-white dark:bg-gray-900 shadow-lg z-50"
                        >
                            {renderSettingComponent()}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <Dialog open={openLogoutModal} handler={setOpenLogoutModal} size="sm" className="dark:text-gray-100 dark:bg-gray-800">
                <DialogHeader className="text-gray-900 dark:text-gray-200">
                    Confirm Logout
                </DialogHeader>
                
                <DialogBody className="w-full bg-white dark:bg-gray-800">
                    <Typography className="font-normal text-sm text-gray-800 dark:text-gray-300">
                    Are you sure you want to log out? You will need to sign in again to access your account.
                    </Typography>
                </DialogBody>

                <DialogFooter className="flex gap-2 w-full bg-white dark:bg-gray-800">
                    <Button color="gray" onClick={() => setOpenLogoutModal(false)} className=" bg-gray-500 dark:bg-gray-700 cursor-pointer">
                    Cancel
                    </Button>
                    <Button onClick={logOut} className="bg-red-500 dark:bg-red-600 cursor-pointer">
                    Logout
                    </Button>
                </DialogFooter>
            </Dialog>
        </div>
    );
}

export default Profile;
