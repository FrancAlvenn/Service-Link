import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import EmployeeForm from '../../component/EmployeeForm.jsx';

import { AuthContext } from '../../../authentication';
import { EmployeeContext } from '../..//context/EmployeeContext';

jest.mock('gapi-script', () => ({ gapi: {}, gapiComplete: Promise.resolve() }));

jest.mock('axios', () => ({ post: jest.fn(), put: jest.fn() }));

function setup(initialValues, mode = 'add') {
  return render(
    <AuthContext.Provider value={{ user: { reference_number: 'U-1', email: 'test@dyci.edu.ph', first_name: 'Test', last_name: 'User' } }}>
      <EmployeeContext.Provider value={{ fetchEmployees: jest.fn() }}>
        <EmployeeForm mode={mode} initialValues={initialValues} onClose={() => {}} onSuccess={() => {}} />
      </EmployeeContext.Provider>
    </AuthContext.Provider>
  );
}

describe('EmployeeForm two-step behavior', () => {
  test('shows progress indicator and persists data between steps', () => {
    setup({ first_name: 'John', last_name: 'Doe', email: 'john@dyci.edu.ph' });

    expect(screen.getByText(/Step 1 of 2/)).toBeInTheDocument();

    const contactInput = screen.getByLabelText(/Contact Number/i);
    fireEvent.change(contactInput, { target: { value: '09123456789' } });

    const addressInput = screen.getByLabelText(/Address/i);
    fireEvent.change(addressInput, { target: { value: '123 Main St' } });

    const nextBtn = screen.getByText(/Next/i);
    fireEvent.click(nextBtn);

    expect(screen.getByText(/Step 2 of 2/)).toBeInTheDocument();

    const backBtn = screen.getByText(/Back/i);
    fireEvent.click(backBtn);

    expect(screen.getByDisplayValue('09123456789')).toBeInTheDocument();
    expect(screen.getByDisplayValue('123 Main St')).toBeInTheDocument();
  });

  test('validation prevents advancing if required fields are missing', () => {
    setup({ first_name: '', last_name: '', email: '' });

    const nextBtn = screen.getByText(/Next/i);
    fireEvent.click(nextBtn);

    expect(screen.getByText(/Missing Information/i)).toBeInTheDocument();
    // Still on step 1
    expect(screen.getByText(/Step 1 of 2/)).toBeInTheDocument();
  });

  test('second step requires at least one qualification before save', () => {
    setup({ first_name: 'Jane', last_name: 'Doe', email: 'jane@dyci.edu.ph', contact_number: '09123456780', address: 'Elm St' });

    fireEvent.click(screen.getByText(/Next/i));
    // No qualification selected, try to save
    fireEvent.click(screen.getByText(/Save Employee/i));
    expect(screen.getByText(/Missing Information/i)).toBeInTheDocument();
  });
});
