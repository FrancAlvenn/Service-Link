import React, { useContext } from 'react';
import { toast } from 'react-toastify';
import ToastNotification from '../utils/ToastNotification';
import './../assets/output.css';
import { AuthContext } from '../features/authentication';
import { useNavigate } from 'react-router-dom';
// import StatusDropdown from '../components/dropdowns/StatusDropdown';
import Navbar from '../layouts/Navbar';
import { SidebarWithBurgerMenu } from '../layouts/__tests__/SidebarWithBurgerMenu';
import Layout from '../layouts/Layout';

function Home() {
  const { user, setUser, clearAuthData } = useContext(AuthContext);

  // Check if user data is available
  if (!user) {
    return <div>Loading...</div>; // or redirect to login page
  }

  const navigate = useNavigate();

  console.log(user);
  console.log(user?.username);

  const handleLogout = () => {
    // Remove user data and token from local storage
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');

    // Remove user from AuthContext
    clearAuthData();

    // Redirect to login page
    navigate('/');
  };

  return (
    <>
      <Layout>
        <div className='flex flex-col gap-3'>
            <h1>{user?.username}</h1>
            <div className='text-3xl text-red-500'>Home</div>
            <button
              className='btn p-5 bg-gray-50'
              onClick={() => ToastNotification.success('Success', 'Your request has been submitted!')}
            >
              Show
            </button>
            <button
              className='btn p-5 bg-gray-50'
              onClick={() => ToastNotification.error('Error', 'Your request has been submitted!')}
            >
              Show
            </button>
            <button
              className='btn p-5 bg-gray-50'
              onClick={() => ToastNotification.info('Info', 'Your request has been submitted!')}
            >
              Show
            </button>
            <button
              className='btn p-5 bg-gray-50'
              onClick={() => ToastNotification.warning('Warning', 'Your request has been submitted!')}
            >
              Show
            </button>
            <button className='btn p-5 bg-gray-50' onClick={()=>{handleLogout()}}>Logout</button>

            <button className='btn p-5 bg-gray-50 pb-14' onClick={()=>{handleLogout()}}>Logout</button>
            <button className='btn p-5 bg-gray-50 pb-14' onClick={()=>{handleLogout()}}>Logout</button>
            <button className='btn p-5 bg-gray-50 pb-14' onClick={()=>{handleLogout()}}>Logout</button>
            <button className='btn p-5 bg-gray-50 pb-14' onClick={()=>{handleLogout()}}>Logout</button>
          </div>
      </Layout>
    </>
  );
}

export default Home;
