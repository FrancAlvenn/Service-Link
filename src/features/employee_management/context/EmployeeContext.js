import { createContext, useEffect, useState } from "react";
import axios from "axios";
import ToastNotification from "../../../utils/ToastNotification";

export const EmployeeContext = createContext();

/**
 * EmployeeProvider handles employee data and CRUD operations.
 * Provides the following:
 * - employees: Array of employee records.
 * - fetchEmployees: Fetches all employees from the server.
 * - createEmployee: Adds a new employee.
 * - updateEmployee: Updates an existing employee.
 * - deleteEmployee: Removes an employee.
 *
 * @param {{ children: React.ReactNode }} props
 */
export const EmployeeProvider = ({ children }) => {
  const [employees, setEmployees] = useState([]);

  // Fetch employees on component mount
  useEffect(() => {
    fetchEmployees();
  }, []);

  // Fetch all employees
  const fetchEmployees = async () => {
    try {
      const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/employees/`, { withCredentials: true });
      setEmployees(data);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  // Create a new employee
  const createEmployee = async (newEmployee) => {
    try {
      const { data } = await axios.post(`${process.env.REACT_APP_API_URL}/employees/`, newEmployee, {
        withCredentials: true,
      });
      setEmployees((prev) => [...prev, data]);
    } catch (error) {
      console.error("Error creating employee:", error);
    }
  };

  // Update an employee by ID
  const updateEmployee = async (employeeId, updatedEmployee) => {
    try {
      const { data } = await axios.put(`${process.env.REACT_APP_API_URL}/employees/${employeeId}`, updatedEmployee, {
        withCredentials: true,
      });
      setEmployees((prev) =>
        prev.map((emp) => (emp.reference_number === employeeId ? { ...emp, ...data } : emp))
      );
    } catch (error) {
      console.error("Error updating employee:", error);
    }
  };

  // Delete an employee by ID
  const deleteEmployee = async (employeeId) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/employees/${employeeId}`, { withCredentials: true });
      setEmployees((prev) => prev.filter((emp) => emp.reference_number !== employeeId));
      ToastNotification.success("Success", "Employee archived successfully.");
    } catch (error) {
      console.error("Error deleting employee:", error);
    }
  };

  return (
    <EmployeeContext.Provider
      value={{
        employees,
        fetchEmployees,
        createEmployee,
        updateEmployee,
        deleteEmployee,
      }}
    >
      {children}
    </EmployeeContext.Provider>
  );
};

export default EmployeeContext;
