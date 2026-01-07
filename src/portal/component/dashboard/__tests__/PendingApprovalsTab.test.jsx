import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PendingApprovalsTab from '../PendingApprovalsTab';
import { JobRequestsContext } from "../../../features/request_management/context/JobRequestsContext";
import { PurchasingRequestsContext } from "../../../features/request_management/context/PurchasingRequestsContext";
import { VenueRequestsContext } from "../../../features/request_management/context/VenueRequestsContext";
import { VehicleRequestsContext } from "../../../features/request_management/context/VehicleRequestsContext";
import { AuthContext } from "../../../features/authentication";
import { BrowserRouter } from 'react-router-dom';

// Mock useOutletContext
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useOutletContext: () => ({ searchQuery: "" }),
  useNavigate: () => jest.fn(),
}));

jest.mock("axios", () => ({
  get: jest.fn(() => Promise.resolve({ data: { status: [] } })),
}));

// Mock Data
const mockJobRequests = [];
const mockUser = { reference_number: "U-1" };

const renderComponent = () => {
  return render(
    <BrowserRouter>
      <AuthContext.Provider value={{ user: mockUser }}>
        <JobRequestsContext.Provider value={{ jobRequests: mockJobRequests }}>
          <PurchasingRequestsContext.Provider value={{ purchasingRequests: [] }}>
            <VenueRequestsContext.Provider value={{ venueRequests: [] }}>
              <VehicleRequestsContext.Provider value={{ vehicleRequests: [] }}>
                 <PendingApprovalsTab />
              </VehicleRequestsContext.Provider>
            </VenueRequestsContext.Provider>
          </PurchasingRequestsContext.Provider>
        </JobRequestsContext.Provider>
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

describe("PendingApprovalsTab Tabs", () => {
  test("renders tabs and switches content", () => {
    renderComponent();

    // Check Tabs Headers
    const pendingTab = screen.getByText(/Pending Approvals/i);
    const historyTab = screen.getByText(/History/i);

    expect(pendingTab).toBeInTheDocument();
    expect(historyTab).toBeInTheDocument();

    // Default should be Pending Approvals (Active)
    expect(pendingTab).toHaveClass("text-blue-600"); // Based on the active styling I saw earlier

    // Click History Tab
    fireEvent.click(historyTab);

    // Now History content should be visible.
    // The HistorySection component renders a title "Request History"
    expect(screen.getByText("Request History")).toBeInTheDocument();
  });
});
