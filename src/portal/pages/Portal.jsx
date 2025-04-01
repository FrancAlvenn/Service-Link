import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import logo from "../../assets/dyci_logo.png";
import { MagnifyingGlass, X, Bell, House, DotsThreeCircle, Plus } from '@phosphor-icons/react';

function Portal() {
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const currentTab = location.pathname.split('/')[2]; // Extracts the current section

  const handleSearchToggle = () => {
    setIsSearching((prev) => !prev);
    if (isSearching) setSearchQuery(''); // Clear input on close
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const fetchThemePreference = async () => {
      try {
        const userPreferences = JSON.parse(localStorage.getItem("userPreference"));

        if (userPreferences?.theme !== undefined) {
          setDarkMode(userPreferences.theme);
        }
      } catch (error) {
        console.error("Error fetching theme preference:", error);
      }
    };

    fetchThemePreference();
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <div className=" min-h-fit bg-white dark:bg-gray-900 w-full mt-0 px-3 flex flex-col justify-between transition-colors pb-22">
      
      {/* Top Navigation */}
      <nav className="w-full z-10 sticky top-0">
        <div className="flex justify-between items-center px-2 py-4 bg-white dark:bg-gray-900">
          
          {/* Logo and Title */}
          {currentTab !== 'profile' && (
            <div className="flex items-center gap-3  w-full">
              {!isSearching ? (
                <>
                <img src={logo} alt="DYCI" className="w-10 h-10" />
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">Service Link</p>
                </>
              ) : (
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search requests..."
                  className="text-sm p-2 w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md"
                />
              )}
            </div>
          )}

          {/* Search Toggle Button */}
          {currentTab === 'dashboard' && (
            <button
              className="rounded-md bg-gray-200 dark:bg-gray-700 p-1 hover:bg-gray-300 dark:hover:bg-gray-600 transition ml-3 cursor-pointer"
              aria-label="Toggle Search"
              onClick={handleSearchToggle}
            >
              {isSearching ? <X size={20} className="text-gray-900 dark:text-gray-100" /> : <MagnifyingGlass size={20} className="text-gray-900 dark:text-gray-100" />}
            </button>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex flex-col gap-4 h-full mb-16">
        <Outlet context={{ searchQuery }} />
      </div>

      {/* Floating Action Button (Create Request) */}
      <button
        className="fixed inset-auto bottom-24 sm:bottom-24 right-6 sm:right-10 md:right-20  bg-blue-600 dark:bg-blue-500 text-white p-3 rounded-xl shadow-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition"
        onClick={() => handleNavigation('/portal/create-request')}
        aria-label="Create New Request"
      >
        <Plus size={24} />
      </button>


      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-4 left-0 right-0 mx-auto w-[85%] h-16 bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 z-20 rounded-xl transition-colors">
        <div className="flex justify-around items-center h-full p-5 w-full">

          {/* Home (Dashboard) */}
          <button
            className={`flex flex-col items-center ${currentTab === 'dashboard' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'} hover:text-blue-500 dark:hover:text-blue-300 transition w-full cursor-pointer`}
            onClick={() => handleNavigation('/portal/dashboard')}
            aria-label="Go to Dashboard"
          >
            <House size={24} />
          </button>

          {/* Notifications */}
          <button
            className={`flex flex-col items-center ${currentTab === 'notifications' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'} hover:text-blue-500 dark:hover:text-blue-300 transition w-full cursor-pointer`}
            onClick={() => handleNavigation('/portal/notifications')}
            aria-label="View Notifications"
          >
            <Bell size={24} />
          </button>

          {/* Profile/Settings */}
          <button
            className={`flex flex-col items-center ${currentTab === 'profile' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'} hover:text-blue-500 dark:hover:text-blue-300 transition w-full cursor-pointer`}
            onClick={() => handleNavigation('/portal/profile')}
            aria-label="Go to Profile"
          >
            <DotsThreeCircle size={24} />
          </button>

        </div>
      </nav>

    </div>
  );
}

export default Portal;
