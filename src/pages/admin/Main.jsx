import React from 'react'
import { Outlet, useNavigate } from 'react-router-dom';


function Main() {
  return (
    <>
    <div>Main</div>

    
    <div className='outlet'>
        <Outlet />
    </div>
    </>
  )
}

export default Main