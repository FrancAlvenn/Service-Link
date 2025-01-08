import React from 'react'
import { Outlet } from 'react-router-dom'

function Workspace() {
  return (
    <div className='h-full'>
        <Outlet></Outlet>
    </div>
  )
}

export default Workspace