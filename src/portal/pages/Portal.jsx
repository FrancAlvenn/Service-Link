import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import logo from "../../assets/dyci_logo.png";
import { MagnifyingGlass, X, Bell, User, House, DotsThreeCircle } from '@phosphor-icons/react';

function Portal() {
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [tab, setTab] = useState('');
  const navigate = useNavigate();

  const handleSearchToggle = () => {
    setIsSearching((prev) => !prev);
    setSearchQuery(''); // Clear input when closing search
  };

  const handleNavigation = (path, tab) => {
    setTab(tab);
    navigate(path);
  };

  return (
    <div className="h-full bg-white rounded-lg w-full mt-0 px-3 flex flex-col justify-between relative">
      {/* Top Navigation */}
      <nav className="w-full bg-white z-10 sticky top-0">
        <div className="flex justify-between items-center px-2 py-4 border-gray-200">

          {/* Logo and Title */}
          <div className="flex items-center gap-3 w-full">
            {!isSearching ? (
              <>
                <img src={logo} alt="DYCI" className="w-10 h-10" />
                <p className="text-lg font-semibold">Service Link</p>
              </>
            ) : (
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search requests..."
                className="text-sm p-2 w-full border border-gray-300 rounded-md"
              />
            )}
          </div>

          {/* Search Toggle Button */}
          {tab === 'home' && (<button
            className="rounded-md bg-gray-200 p-1 hover:bg-gray-300 transition ml-3"
            aria-label="Toggle Search"
            onClick={handleSearchToggle}
          >
            {isSearching ? <X size={20} /> : <MagnifyingGlass size={20} />}
          </button>)}

        </div>
      </nav>

      {/* Main Content */}
      <div className="flex flex-col gap-4 h-full mb-16"> {/* Added mb-16 to prevent content overlap */}
        <Outlet context={{ searchQuery }} />
      </div>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-4 left-0 right-0 mx-auto w-[90%] h-16 bg-white shadow-lg border border-gray-200 z-20 rounded-xl">
        <div className="flex justify-around items-center h-full p-5">

          {/* Home (Portal) */}
          <button
            className="flex flex-col items-center text-gray-600 hover:text-blue transition w-full"
            onClick={() => handleNavigation('/portal/dashboard', 'home')}
          >
            <House size={24} />
          </button>

          {/* Notifications */}
          <button
            className="flex flex-col items-center text-gray-600 hover:text-blue transition w-full"
            onClick={() => handleNavigation('/portal/notifications', 'notifications')}
          >
            <Bell size={24} />
          </button>

          {/* Profile/Settings */}
          <button
            className="flex flex-col items-center text-gray-600 hover:text-blue transition w-full"
            onClick={() => handleNavigation('/portal/profile', 'settings')}
          >
            <DotsThreeCircle size={24} />
          </button>

        </div>
      </nav>

    </div>
  );
}

export default Portal;
