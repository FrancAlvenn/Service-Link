import React from 'react';
import PortalDashboard from './PortalDashboard';
import { BrowserRouter } from 'react-router-dom';
import { JobRequestsContext } from "../../../features/request_management/context/JobRequestsContext";
import { PurchasingRequestsContext } from "../../../features/request_management/context/PurchasingRequestsContext";
import { VenueRequestsContext } from "../../../features/request_management/context/VenueRequestsContext";
import { VehicleRequestsContext } from "../../../features/request_management/context/VehicleRequestsContext";
import { AuthContext } from "../../../features/authentication";
import EmployeeContext from "../../../features/employee_management/context/EmployeeContext";
import { SettingsContext } from "../../../features/settings/context/SettingsContext";

export default {
  title: 'Portal/Dashboard/PortalDashboard',
  component: PortalDashboard,
  parameters: {
    layout: 'fullscreen',
  },
};

const MockProvider = ({ children, user, requests }) => (
  <AuthContext.Provider value={{ user }}>
    <JobRequestsContext.Provider value={{ jobRequests: requests }}>
      <PurchasingRequestsContext.Provider value={{ purchasingRequests: [] }}>
        <VenueRequestsContext.Provider value={{ venueRequests: [] }}>
          <VehicleRequestsContext.Provider value={{ vehicleRequests: [] }}>
            <EmployeeContext.Provider value={{ employees: [], fetchEmployees: () => {} }}>
              <SettingsContext.Provider value={{ approvers: [], fetchApprovers: () => {} }}>
                {children}
              </SettingsContext.Provider>
            </EmployeeContext.Provider>
          </VehicleRequestsContext.Provider>
        </VenueRequestsContext.Provider>
      </PurchasingRequestsContext.Provider>
    </JobRequestsContext.Provider>
  </AuthContext.Provider>
);

const Template = (args) => (
  <BrowserRouter>
    <MockProvider {...args}>
      <PortalDashboard />
    </MockProvider>
  </BrowserRouter>
);

export const Default = Template.bind({});
Default.args = {
  user: { reference_number: "U-1", designation_id: 2, first_name: "John", last_name: "Doe" },
  requests: [
    { reference_number: "JR-001", title: "Job Request 1", created_at: "2023-01-01T10:00:00Z", type: "Job Request", requester: "U-1", status: "Pending", purpose: "Fix AC" },
    { reference_number: "JR-002", title: "Job Request 2", created_at: "2023-01-02T10:00:00Z", type: "Job Request", requester: "U-1", status: "Approved", purpose: "New Chair" },
  ],
};

export const Empty = Template.bind({});
Empty.args = {
  user: { reference_number: "U-1", designation_id: 2 },
  requests: [],
};
