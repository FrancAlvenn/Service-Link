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

library.add(fas, fab, far); // Add all the icons needed

const router = createBrowserRouter([
  {
    path: '/',
    element: <Login/>,
  },
  {
    path: '/home',
    element: <ProtectedRoute><Home/></ProtectedRoute>
  }
]);

function App() {
  return (
    <AuthProvider>
      <div className="App p-5">
        <RouterProvider router={router} />
        <CustomToastContainer />
      </div>
    </AuthProvider>
  );
}

export default App;
