import * as React from 'react';
import './App.css';
import './assets/global_style.scss';

import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { far } from "@fortawesome/free-regular-svg-icons";

import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import CustomToastContainer from './components/toast_notification/CustomToastContainer';

import { AuthProvider } from './features/authentication';
import Home from './pages/Home';
import Login from './pages/Login';
import ProtectedRoute from './components/protected_route/ProtectedRoute';

import { ThemeProvider } from "@material-tailwind/react";
import Dashboard from './pages/Dashboard';
import Layout from './layouts/Layout';
import Workspace from './pages/Workspace';

library.add(fas, fab, far); // Add all the icons needed

const router = createBrowserRouter([
  {
    path: '/',
    element: <Login/>,
  },
  {
    path: '/home',
    element: <ProtectedRoute><Layout><Home/></Layout></ProtectedRoute>
  },
  {
    path: '/dashboard',
    element: <ProtectedRoute><Layout><Dashboard/></Layout></ProtectedRoute>
  },
  {
    path: '/workspace',
    element: <ProtectedRoute><Layout><Workspace/></Layout></ProtectedRoute>,
    children: [
      {
        path: 'requests-management',
        element: <div>Requests Management</div>
      },
      {
        path: 'ticket-management',
        element: <div>Ticket Management</div>
      },
      {
        path: 'asset-management',
        element: <div>Asset Management</div>
      },
      {
        path: 'employee-management',
        element: <div>Employee Management</div>
      },
    ]
  }
]);

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="App">
          <RouterProvider router={router} />
          <CustomToastContainer />
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
