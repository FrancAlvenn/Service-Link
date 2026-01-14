import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import VenueForm from '../VenueForm';
import { AuthContext } from '../../../authentication';
import VenueContext from '../../context/VenueContext';

// Mock dependencies
jest.mock('axios');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

const mockUser = {
  reference_number: 'U-123',
  first_name: 'Admin',
  last_name: 'User',
};

const mockVenueContext = {
  fetchVenues: jest.fn(),
  createVenueUnavailability: jest.fn(),
  fetchVenueUnavailability: jest.fn(),
};

describe('VenueForm Amenities Enhancement', () => {
  const renderComponent = (props = {}) => {
    return render(
      <AuthContext.Provider value={{ user: mockUser }}>
        <VenueContext.Provider value={mockVenueContext}>
          <VenueForm {...props} />
        </VenueContext.Provider>
      </AuthContext.Provider>
    );
  };

  test('renders all enhanced amenity options', () => {
    renderComponent({ mode: 'add' });

    const expectedAmenities = [
      "Wi-Fi",
      "Air Conditioning",
      "Sound System",
      "Microphone",
      "Projector",
      "LCD Projector",
      "LED Monitor",
      "Whiteboard",
      "Chairs",
      "Tables",
      "Electric Fan",
      "Water Dispenser",
      "Parking",
      "Restrooms",
      "Accessibility",
      "Catering",
    ];

    expectedAmenities.forEach(amenity => {
      expect(screen.getByLabelText(amenity)).toBeInTheDocument();
    });
  });

  test('allows selecting multiple amenities', () => {
    renderComponent({ mode: 'add' });

    const amenitiesToSelect = ["Wi-Fi", "LCD Projector", "Chairs"];

    amenitiesToSelect.forEach(amenity => {
      const checkbox = screen.getByLabelText(amenity);
      fireEvent.click(checkbox);
      expect(checkbox).toBeChecked();
    });

    // Verify others are not checked
    const uncheckedAmenity = screen.getByLabelText("Catering");
    expect(uncheckedAmenity).not.toBeChecked();
  });
});
