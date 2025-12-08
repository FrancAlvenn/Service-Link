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
      const { data, status } = await axios.post(`${process.env.REACT_APP_API_URL}/employees/`, newEmployee, {
        withCredentials: true,
      });
      if ([200, 201].includes(status)) {
        const created = data.newEmployee || data;
        setEmployees((prev) => [...prev, created]);
        ToastNotification.success("Success", data.message || "Employee created successfully");
      }
    } catch (error) {
      console.error("Error creating employee:", error);
    }
  };

  // Update an employee by ID
  const updateEmployee = async (employeeId, updatedEmployee) => {
    try {
      const { data, status } = await axios.put(`${process.env.REACT_APP_API_URL}/employees/${employeeId}`, updatedEmployee, {
        withCredentials: true,
      });
      if (status === 200) {
        setEmployees((prev) =>
          prev.map((emp) => (emp.reference_number === employeeId ? { ...emp, ...updatedEmployee } : emp))
        );
        ToastNotification.success("Success", data.message || "Employee updated successfully");
      }
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

  // Update qualifications and availability
  const updateEmployeeQualifications = async (employeeId, payload) => {
    try {
      const { data, status } = await axios.put(
        `${process.env.REACT_APP_API_URL}/employees/${employeeId}/qualifications`,
        payload,
        { withCredentials: true }
      );
      if (status === 200) {
        setEmployees((prev) =>
          prev.map((emp) =>
            emp.reference_number === employeeId ? { ...emp, ...payload } : emp
          )
        );
        ToastNotification.success("Success", data.message || "Qualifications updated successfully");
      }
    } catch (error) {
      console.error("Error updating qualifications:", error);
    }
  };

  // Search employees by qualifications
  const searchEmployeesByQualifications = async ({ skills = [], availability, experience, department }) => {
    try {
      const params = new URLSearchParams();
      if (Array.isArray(skills)) skills.forEach((s) => params.append("skills", s));
      if (availability) params.append("availability", availability);
      if (experience) params.append("experience", experience);
      if (department) params.append("department", department);
      const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/employees/search?${params.toString()}`, { withCredentials: true });
      return data;
    } catch (error) {
      console.error("Error searching employees:", error);
      return [];
    }
  };

  // Match employees to a job
  const matchEmployeesToJob = async (payload) => {
    try {
      const { data } = await axios.post(`${process.env.REACT_APP_API_URL}/employees/match`, payload, { withCredentials: true });
      return data;
    } catch (error) {
      console.error("Error matching employees:", error);
      return { required_skills: [], candidates: [], top_candidate: null };
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
        updateEmployeeQualifications,
        searchEmployeesByQualifications,
        matchEmployeesToJob,
      }}
    >
      {children}
    </EmployeeContext.Provider>
  );
};

export default EmployeeContext;
