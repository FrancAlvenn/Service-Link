import React from 'react';
import ForVerification from './ForVerification';
import { BrowserRouter } from 'react-router-dom';
import { JobRequestsContext } from "../../../features/request_management/context/JobRequestsContext";
import { PurchasingRequestsContext } from "../../../features/request_management/context/PurchasingRequestsContext";
import { VenueRequestsContext } from "../../../features/request_management/context/VenueRequestsContext";
import { VehicleRequestsContext } from "../../../features/request_management/context/VehicleRequestsContext";
import { AuthContext } from "../../../features/authentication";
import EmployeeContext from "../../../features/employee_management/context/EmployeeContext";
import { SettingsContext } from "../../../features/settings/context/SettingsContext";

export default {
  title: 'Portal/Dashboard/ForVerification',
  component: ForVerification,
  parameters: {
    layout: 'fullscreen',
  },
};

const MockProvider = ({ children, user, jobRequests }) => (
  <AuthContext.Provider value={{ user }}>
    <JobRequestsContext.Provider value={{ jobRequests: jobRequests }}>
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
      <ForVerification />
    </MockProvider>
  </BrowserRouter>
);

export const Default = Template.bind({});
Default.args = {
  user: { reference_number: "U-1" },
  jobRequests: [
      { reference_number: "JR-001", title: "Job Request 1", created_at: "2023-01-01T10:00:00Z", type: "Job Request", requester: "U-2", status: "Pending", verified: false, assigned_to: "U-1" }
  ],
};
