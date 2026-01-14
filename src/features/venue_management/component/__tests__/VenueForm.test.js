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

describe('VenueForm Quantity Tracking', () => {
  const renderComponent = (props = {}) => {
    return render(
      <AuthContext.Provider value={{ user: mockUser }}>
        <VenueContext.Provider value={mockVenueContext}>
          <VenueForm {...props} />
        </VenueContext.Provider>
      </AuthContext.Provider>
    );
  };

  test('displays quantity controls when amenity is selected', () => {
    renderComponent({ mode: 'add' });

    // Select amenity
    const checkbox = screen.getByLabelText("Chairs");
    fireEvent.click(checkbox);

    // Check for quantity input (default 1)
    const quantityInput = screen.getByDisplayValue("1");
    expect(quantityInput).toBeInTheDocument();
    
    // Check for +/- buttons
    expect(screen.getByText("+")).toBeInTheDocument();
    expect(screen.getByText("-")).toBeInTheDocument();
  });

  test('increments and decrements quantity', () => {
    renderComponent({ mode: 'add' });

    const checkbox = screen.getByLabelText("Chairs");
    fireEvent.click(checkbox);

    const plusBtn = screen.getByText("+");
    const minusBtn = screen.getByText("-");
    const input = screen.getByDisplayValue("1");

    // Increment
    fireEvent.click(plusBtn);
    expect(input.value).toBe("2");

    // Decrement
    fireEvent.click(minusBtn);
    expect(input.value).toBe("1");

    // Should not go below 1
    fireEvent.click(minusBtn);
    expect(input.value).toBe("1");
  });

  test('handles manual input validation', () => {
    renderComponent({ mode: 'add' });

    const checkbox = screen.getByLabelText("Chairs");
    fireEvent.click(checkbox);
    const input = screen.getByDisplayValue("1");

    // Valid input
    fireEvent.change(input, { target: { value: "50" } });
    expect(input.value).toBe("50");

    // Invalid input (negative) -> should reset to 1
    fireEvent.change(input, { target: { value: "-5" } });
    expect(input.value).toBe("1");
  });
});
