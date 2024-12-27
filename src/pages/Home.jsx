import React, { useContext } from 'react';
import { toast } from 'react-toastify';
import ToastNotification from '../utils/ToastNotification';
import './../assets/output.css';
import { AuthContext } from '../features/authentication';

function Home() {
  const { user } = useContext(AuthContext);

  // Check if user data is available
  if (!user) {
    return <div>Loading...</div>; // or redirect to login page
  }

  console.log(user);
  console.log(user?.username);

  return (
    <>
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
    </>
  );
}

export default Home;
