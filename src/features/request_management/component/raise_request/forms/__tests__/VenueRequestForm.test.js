import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VenueRequestForm from '../VenueRequestForm';
import { AuthContext } from '../../../../authentication';
import { UserContext } from '../../../../../context/UserContext';
import { VenueRequestsContext } from '../../../context/VenueRequestsContext';
import { SettingsContext } from '../../../../settings/context/SettingsContext';
import axios from 'axios';

// Mock dependencies
jest.mock('axios');
jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: {
      generateContent: jest.fn(),
    },
  })),
}));

// Mock contexts
const mockUser = {
  reference_number: 'U-123',
  first_name: 'John',
  last_name: 'Doe',
  organization_id: 'ORG-1',
  access_level: 'user',
};

const mockAuthContext = { user: mockUser };
const mockUserContext = {
  allUserInfo: [],
  getUserByReferenceNumber: jest.fn(() => 'John Doe'),
  fetchUsers: jest.fn(),
  getUserDepartmentByReferenceNumber: jest.fn(),
};
const mockVenueRequestsContext = {
  venueRequests: [],
  fetchVenueRequests: jest.fn(),
};
const mockSettingsContext = {
  departments: [],
  organizations: [],
  approvers: [],
  approvalRulesByDepartment: [],
  approvalRulesByRequestType: [],
  approvalRulesByDesignation: [],
  fetchDepartments: jest.fn(),
  fetchOrganizations: jest.fn(),
  fetchDesignations: jest.fn(),
  fetchApprovers: jest.fn(),
  fetchApprovalRulesByDepartment: jest.fn(),
  fetchApprovalRulesByRequestType: jest.fn(),
  fetchApprovalRulesByDesignation: jest.fn(),
};

describe('VenueRequestForm Amenities Display', () => {
  const mockVenues = [
    {
      venue_id: 1,
      name: 'Conference Room A',
      status: 'Available',
      amenities: ['Wi-Fi', 'Projector', 'Whiteboard'],
    },
    {
      venue_id: 2,
      name: 'Empty Room',
      status: 'Available',
      amenities: [],
    },
  ];

  beforeEach(() => {
    axios.get.mockImplementation((url) => {
      if (url.includes('/venues')) {
        return Promise.resolve({ data: mockVenues });
      }
      if (url.includes('/settings/department')) {
        return Promise.resolve({ data: { departments: [] } });
      }
      // Default for bookings/unavailability
      return Promise.resolve({ data: [] });
    });
    
    // Reset mocks
    jest.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <AuthContext.Provider value={mockAuthContext}>
        <UserContext.Provider value={mockUserContext}>
          <VenueRequestsContext.Provider value={mockVenueRequestsContext}>
            <SettingsContext.Provider value={mockSettingsContext}>
              <VenueRequestForm />
            </SettingsContext.Provider>
          </VenueRequestsContext.Provider>
        </UserContext.Provider>
      </AuthContext.Provider>
    );
  };

  test('displays amenities when a venue with amenities is selected', async () => {
    renderComponent();

    // Wait for venues to load
    await waitFor(() => expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/venues'), expect.anything()));

    // Find venue select by label text
    // Note: The label is "Venue"
    const venueSelect = screen.getByLabelText(/^Venue$/i);

    // Select Conference Room A (value 1)
    fireEvent.change(venueSelect, { target: { value: '1' } });

    // Check for "Included Amenities" header
    expect(await screen.findByText('Included Amenities')).toBeInTheDocument();

    // Check for amenities
    expect(screen.getByText('Wi-Fi')).toBeInTheDocument();
    expect(screen.getByText('Projector')).toBeInTheDocument();
    expect(screen.getByText('Whiteboard')).toBeInTheDocument();
  });

  test('does not display amenities section when venue has no amenities', async () => {
    renderComponent();

    // Wait for venues to load
    await waitFor(() => expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/venues'), expect.anything()));

    const venueSelect = screen.getByLabelText(/^Venue$/i);

    // Select Empty Room (value 2)
    fireEvent.change(venueSelect, { target: { value: '2' } });

    // Check that header is NOT present
    // Use queryByText to avoid throwing error
    expect(screen.queryByText('Included Amenities')).not.toBeInTheDocument();
  });
});
