import React, { useEffect, useRef, useState } from 'react'
import logo from '../assets/dyci_logo.png';
import { ArrowSquareOut, Bell, Gear, Question, UserCircle } from '@phosphor-icons/react';
import NotificationModal from './component/navbar/NotificationModal';
import HelpModal from './component/navbar/HelpModal';
import SettingsModal from './component/navbar/SettingsModal';
import ProfileModal from './component/navbar/ProfileModal';



function Navbar() {
  return (
    <nav className="w-full bg-white shadow z-10">
        <div className='flex justify-between items-center gap-3 px-5 py-1 border-b border-gray-200'>
            <div className='flex items-center gap-3'>
                <img src={logo} alt="DYCI" className='w-10 h-10' />
                <p>Service Link</p>
            </div>
            <div className='flex items-center'>
                
                <NotificationModal/>
                <HelpModal/>
                <SettingsModal/>
                <ProfileModal/>
            </div>
        </div>
    </nav>
  )
}

export default Navbar