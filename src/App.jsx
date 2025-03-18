import * as React from 'react';
import './App.css';
import './assets/global_style.scss';

import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { far } from "@fortawesome/free-regular-svg-icons";

import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import CustomToastContainer from './components/toast_notification/CustomToastContainer';

import { AuthProvider } from './features/authentication';
import Home from './pages/Home';
import Login from './pages/Login';
import ProtectedRoute from './components/protected_route/ProtectedRoute';

import { ThemeProvider } from "@material-tailwind/react";
import Dashboard from './pages/Dashboard';
import Layout from './layouts/Layout';
import Workspace from './pages/Workspace';
import RequestManagement from './pages/RequestManagement';
import { JobRequests, KanbanBoard, PurchasingRequests, RequestsProviderWrapper, VehicleRequests, VenueRequests } from './features/request_management/';
import { UserContext, UserProvider } from './context/UserContext';
import RaiseRequest from './features/request_management/component/raise_request/RaiseRequest';
import AssetTable from './features/asset_management/component/AssetTable';
import { AssetProvider } from './features/asset_management/context/AssetContext';
import AssetForm from './features/asset_management/component/AssetForm';
import EmployeeTable from './features/employee_management/component/EmployeeTable';
import EmployeeForm from './features/employee_management/component/EmployeeForm';
import { EmployeeProvider } from './features/employee_management/context/EmployeeContext';



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
        element: <Navigate to="/workspace/requests-management/queues/job-requests" />,
      },
      {
        path: 'requests-management/queue',
        element: <Navigate to="/workspace/requests-management/queues/job-requests" />,
      },
      {
        path: 'requests-management/queues/job-requests',
        element: <ProtectedRoute><JobRequests/></ProtectedRoute>
      },
      {
        path: 'requests-management/queues/purchasing-requests',
        element: <ProtectedRoute><PurchasingRequests/></ProtectedRoute>
      },
      {
        path: 'requests-management/queues/vehicle-requests',
        element: <ProtectedRoute><VehicleRequests/></ProtectedRoute>
      },
      {
        path: 'requests-management/queues/venue-requests',
        element: <ProtectedRoute><VenueRequests/></ProtectedRoute>
      },
      {
        path: 'requests-management/views/kanban-board',
        element: <ProtectedRoute><KanbanBoard/></ProtectedRoute>
      },
      {
        path: 'requests-management/raise-request',
        element: <ProtectedRoute><RaiseRequest/></ProtectedRoute>
      },
      {
        path: 'ticket-management',
        element: <div>Ticket Management</div>
      },
      {
        path: 'asset-management/board',
        element: <ProtectedRoute><AssetTable/></ProtectedRoute>
      },
      {
        path: 'asset-management/create-asset',
        element: <ProtectedRoute><AssetForm/></ProtectedRoute>
      },
      {
        path: 'employee-management/board',
        element: <ProtectedRoute><EmployeeTable/></ProtectedRoute>
      },
      {
        path: 'employee-management/add-employee',
        element: <ProtectedRoute><EmployeeForm/></ProtectedRoute>
      },
    ]
  }
]);

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <UserProvider>
          <AssetProvider>
            <EmployeeProvider>
            <RequestsProviderWrapper>
              <div className="App font-sans">
                <RouterProvider router={router} />
                <CustomToastContainer />
              </div>
            </RequestsProviderWrapper>
            </EmployeeProvider>
          </AssetProvider>
        </UserProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
