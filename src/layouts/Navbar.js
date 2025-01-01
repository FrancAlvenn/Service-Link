import React, { useEffect, useRef, useState } from 'react'
import logo from '../assets/dyci_logo.png';
import { ArrowSquareOut, Bell, Gear, Question, UserCircle } from '@phosphor-icons/react';
import NotificationModal from './component/NotificationModal';
import HelpModal from './component/HelpModal';
import SettingsModal from './component/SettingsModal';
import ProfileModal from './component/ProfileModal';



function Navbar() {
  return (
    <nav>
        <div className='flex justify-between items-center gap-3 px-5'>
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