import React from 'react'
import logo from '../../../assets/dyci_logo.png';
import InstallPWA from '../../../utils/InstallPWA';

function AuthHeader() {
  return (
    <nav className='flex items-center justify-between gap-3 p-4'>
        <div className='flex items-center gap-2'>
          <img src={logo} alt="DYCI" className='w-10 h-10' />
        <p>Service Link</p>
        </div>

        <InstallPWA />
    </nav>
  )
}

export default AuthHeader