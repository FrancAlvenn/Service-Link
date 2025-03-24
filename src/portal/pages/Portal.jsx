import React from 'react';
import { Outlet } from 'react-router-dom';
import logo from "../../assets/dyci_logo.png";
import { MagnifyingGlass } from '@phosphor-icons/react';

function Portal({ children }) {
  return (
    <div className="h-full bg-white rounded-lg w-full mt-0 px-3 flex flex-col justify-between">
      <nav className="w-full bg-white z-10 sticky top-0">
        <div className="flex justify-between items-center px-2 py-4 border-gray-200">
          <div className="flex items-center gap-3">
            <img src={logo} alt="DYCI" className="w-10 h-10" />
            <p>Service Link</p>
          </div>

          {/* Search Button */}
          <button 
            className="rounded-md bg-gray-200 p-1 hover:bg-gray-300 transition"
            aria-label="Search"
          >
            <MagnifyingGlass size={20} className="cursor-pointer" />
          </button>
        </div>
      </nav>

      <div className="flex flex-col gap-4 h-full">
        <Outlet />
      </div>
    </div>
  );
}

export default Portal;
