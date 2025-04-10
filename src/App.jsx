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
import { TicketProvider } from './features/ticket_management/context/TicketContext';
import TicketTable from './features/ticket_management/component/TicketTable';
import TicketForm from './features/ticket_management/component/TicketForm';
import Portal from './portal/pages/Portal';
import PortalDashboard from './portal/component/dashboard/PortalDashboard';
import RequestDetailsPage from './portal/component/request_view/RequestDetailsPage';
import Notifications from './portal/pages/Notifications';
import Profile from './portal/pages/Profile';
import Reports from './features/request_management/component/reporting_dashboard/Reports';
import CalendarView from './features/request_management/component/calendar_board/CalendarView';



library.add(fas, fab, far); // Add all the icons needed

const router = createBrowserRouter([
  {
    path: '/',
    element: <Login/>,
  },
  {
    path: '/home',
    element: <ProtectedRoute requiredAccess={'admin'}><Layout><Home/></Layout></ProtectedRoute>
  },
  {
    path: '/dashboard',
    element: <ProtectedRoute requiredAccess={'admin'}><Layout><Dashboard/></Layout></ProtectedRoute>
  },
  {
    path: '/workspace',
    element: <ProtectedRoute requiredAccess={'admin'}><Layout><Workspace/></Layout></ProtectedRoute>,
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
        element: <ProtectedRoute requiredAccess={'admin'}><JobRequests/></ProtectedRoute>
      },
      {
        path: 'requests-management/queues/purchasing-requests',
        element: <ProtectedRoute requiredAccess={'admin'}><PurchasingRequests/></ProtectedRoute>
      },
      {
        path: 'requests-management/queues/vehicle-requests',
        element: <ProtectedRoute requiredAccess={'admin'}><VehicleRequests/></ProtectedRoute>
      },
      {
        path: 'requests-management/queues/venue-requests',
        element: <ProtectedRoute requiredAccess={'admin'}><VenueRequests/></ProtectedRoute>
      },
      {
        path: 'requests-management/views/kanban-board',
        element: <ProtectedRoute requiredAccess={'admin'}><KanbanBoard/></ProtectedRoute>
      },
      {
        path: 'requests-management/views/calendar',
        element: <ProtectedRoute requiredAccess={'admin'}><CalendarView/></ProtectedRoute>
      },
      {
        path: 'requests-management/raise-request',
        element: <ProtectedRoute requiredAccess={'admin'}><RaiseRequest/></ProtectedRoute>
      },
      {
        path: "requests-management/reports",
        element: <ProtectedRoute requiredAccess={'admin'}><Reports/></ProtectedRoute>
      },
      {
        path: 'ticket-management/board',
        element: <ProtectedRoute requiredAccess={'admin'}><TicketTable/></ProtectedRoute>
      },
      {
        path: 'ticket-management/create-ticket',
        element: <ProtectedRoute requiredAccess={'admin'}><TicketForm/></ProtectedRoute>
      },
      {
        path: 'asset-management/board',
        element: <ProtectedRoute requiredAccess={'admin'}><AssetTable/></ProtectedRoute>
      },
      {
        path: 'asset-management/create-asset',
        element: <ProtectedRoute requiredAccess={'admin'}><AssetForm/></ProtectedRoute>
      },
      {
        path: 'employee-management/board',
        element: <ProtectedRoute requiredAccess={'admin'}><EmployeeTable/></ProtectedRoute>
      },
      {
        path: 'employee-management/add-employee',
        element: <ProtectedRoute requiredAccess={'admin'}><EmployeeForm/></ProtectedRoute>
      },
    ]
  },
  {
    path: '/portal',
    element: <ProtectedRoute requiredAccess={'user'}><Portal/></ProtectedRoute>,
    children: [
      {
        path: "dashboard",
        element: <ProtectedRoute requiredAccess={'user'}><PortalDashboard/></ProtectedRoute>,
      },
      {
        path: "request/:id",
        element: <ProtectedRoute requiredAccess={'user'}><RequestDetailsPage/></ProtectedRoute>,
      },
      {
        path: 'notifications',
        element: <ProtectedRoute requiredAccess={'user'}><Notifications/></ProtectedRoute>,
      },
      {
        path: 'profile',
        element: <ProtectedRoute requiredAccess={'user'}><Profile/></ProtectedRoute>,
      },
      {
        path: "create-request",
        element: <ProtectedRoute requiredAccess={'user'}><RaiseRequest/></ProtectedRoute>,
      }
    ]
  },
  
]);

function App() {
  return (
      <ThemeProvider>
        <AuthProvider>
          <UserProvider>
            <TicketProvider>
              <AssetProvider>
                <EmployeeProvider>
                <RequestsProviderWrapper>
                  <div className="App font-sans ">
                    <RouterProvider router={router} />
                    <CustomToastContainer />
                  </div>
                </RequestsProviderWrapper>
                </EmployeeProvider>
              </AssetProvider>
            </TicketProvider>
          </UserProvider>
        </AuthProvider>
      </ThemeProvider>
  );
}

export default App;
