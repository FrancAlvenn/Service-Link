import React from 'react'
import logo from '../../../assets/dyci_logo.png';

function AuthHeader() {
  return (
    <nav className='flex items-center gap-3 p-4'>
        <img src={logo} alt="DYCI" className='w-10 h-10' />
        <p>Service Link</p>
    </nav>
  )
}

export default AuthHeader