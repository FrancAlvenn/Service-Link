import React, { useContext, useState } from "react";
import { Button, Typography } from "@material-tailwind/react";
import axios from "axios";
import { AuthContext } from "../../authentication";
import ToastNotification from "../../../utils/ToastNotification";
import EmployeeContext from "../context/EmployeeContext";
import Header from "../../../layouts/header";

const EmployeeForm = () => {
  const { user } = useContext(AuthContext);

  const [errorMessage, setErrorMessage] = useState("");

  const { fetchEmployees } = useContext(EmployeeContext);

  const initialEmployeeState = {
    reference_number: user?.reference_number || "",
    first_name: "",
    last_name: "",
    email: "",
    position: "",
    department: "",
    expertise: "",
    date_hired: "",
    employment_status: "Active",
    contact_number: "",
    address: "",
  };

  const [employee, setEmployee] = useState(initialEmployeeState);

  // Handle input changes
  const handleChange = (e) => {
    setEmployee({ ...employee, [e.target.name]: e.target.value });
  };

  // Reset the form
  const resetForm = () => {
    setEmployee(initialEmployeeState);
  };

  const submitEmployee = async () => {
    try {
      const response = await axios.post("/employees", employee, {
        withCredentials: true,
      });

      if (response.status === 201) {
        fetchEmployees();
        resetForm();
        ToastNotification.success("Success!", "Employee added successfully.");
      }

      setErrorMessage("");
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setErrorMessage("Email already exists. Please try again.");
      } else {
        setErrorMessage("An error occurred. Please try again.");
      }
    }
  };

  return (
    <div className="h-full">
      <div className="h-full bg-white rounded-lg w-full px-3 flex flex-col justify-start">
        <div className="py-4 px-5 mb-5 shadow-sm">
          <Header
            title={"Employee Information"}
            description={"Enter details about the employee below."}
          />
        </div>

        <div className="flex flex-col gap-4 px-5 pb-4 overflow-y-auto">
          {/* First & Last Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                name="first_name"
                value={employee.first_name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                name="last_name"
                value={employee.last_name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={employee.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              required
            />
          </div>

          {/* Position & Department */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Position
              </label>
              <input
                type="text"
                name="position"
                value={employee.position}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Department
              </label>
              <input
                type="text"
                name="department"
                value={employee.department}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* Expertise */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Expertise
            </label>
            <input
              type="text"
              name="expertise"
              value={employee.expertise}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>

          {/* Date Hired & Employment Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Date Hired
              </label>
              <input
                type="date"
                name="date_hired"
                value={employee.date_hired}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Employment Status
              </label>
              <select
                name="employment_status"
                value={employee.employment_status}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                {["Active", "Inactive"].map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Contact Number */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Contact Number
            </label>
            <input
              type="text"
              name="contact_number"
              value={employee.contact_number}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>

          {errorMessage && (
            <p className="text-red-500 text-xs">{errorMessage}</p>
          )}

          <Button
            color="blue"
            className="w-full min-h-[40px] max-w-[160px] mt-3"
            onClick={submitEmployee}
            disabled={
              !employee.first_name || !employee.last_name || !employee.email
            }
          >
            Submit Employee
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeForm;
