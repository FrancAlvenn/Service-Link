import * as React from 'react';
import './App.css';
import "./style.scss";

import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import Main from './pages/admin/Main';
import JR_Dashboard from './pages/admin/job_requests/JR_Dashboard';


const router = createBrowserRouter([
  {
    path: '/',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />
  },
  {
    path: 'admin/login',
    element: <Login />
  },
  {
    path: 'admin/register',
    element: <Register />
  },
  {
    path: '/main',
    element: <Main />,
    children: [
      {
        path: '/main/job-request/dashboard',
        element: <JR_Dashboard />,
      },
    ],
  },
]);

function App() {
  return (
    <div className="App">
       <RouterProvider router={router} />
    </div>
  );
}

export default App;
