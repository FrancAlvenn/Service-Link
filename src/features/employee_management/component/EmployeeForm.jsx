import React, { useContext, useState } from "react";
import { Button, Typography } from "@material-tailwind/react";
import axios from "axios";
import { AuthContext } from "../../authentication";
import ToastNotification from "../../../utils/ToastNotification";
import EmployeeContext from "../context/EmployeeContext";
import Header from "../../../layouts/header";
import PropTypes from "prop-types";
import { formatDate } from "../../../utils/dateFormatter";

const EmployeeForm = ({ mode = "add", initialValues, onClose, onSuccess }) => {
  const { user } = useContext(AuthContext);

  const [errorMessage, setErrorMessage] = useState("");

  const { fetchEmployees } = useContext(EmployeeContext);

  // In EmployeeForm.jsx, update the initial state to include address:
  const [employee, setEmployee] = useState(
    initialValues || {
      reference_number: "",
      first_name: "",
      last_name: "",
      email: "",
      position: "",
      department: "",
      expertise: "",
      hire_date: "",
      employment_status: "Active",
      contact_number: "",
      address: "",
    }
  );

  // Handle input changes
  const handleChange = (e) => {
    setEmployee({ ...employee, [e.target.name]: e.target.value });
  };

  // Reset the form
  const resetForm = () => {
    setEmployee(
      initialValues || {
        reference_number: "",
        first_name: "",
        last_name: "",
        email: "",
        position: "",
        department: "",
        expertise: "",
        hire_date: "",
        employment_status: "Active",
        contact_number: "",
        address: "",
      }
    );
  };

  const submitEmployee = async () => {
    try {
      let response;

      if (mode === "edit") {
        response = await axios.put(
          `${process.env.REACT_APP_API_URL}/employees/${employee.reference_number}`,
          employee,
          { withCredentials: true }
        );
      } else {
        response = await axios.post(`${process.env.REACT_APP_API_URL}/employees`, employee, {
          withCredentials: true,
        });
      }

      if ([200, 201].includes(response.status)) {
        ToastNotification.success(
          "Success!",
          `Employee ${mode === "edit" ? "updated" : "added"} successfully.`
        );
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      }

      setErrorMessage("");
    } catch (error) {
      if (error.response?.status === 400) {
        setErrorMessage("Email already exists. Please try again.");
      } else {
        setErrorMessage("An error occurred. Please try again.");
      }
    }
  };

  return (
    <div className="h-full z-50">
      <div className="h-full bg-white rounded-lg w-full px-3 flex flex-col justify-start">
        <div className="py-4 px-5 mb-5 shadow-sm">
          {/* <Header
            title={"Employee Information"}
            description={"Enter details about the employee below."}
          /> */}
          <Typography variant="h5" color="blue-gray" className="mb-2">
            Employee Information
          </Typography>
          <Typography variant="small" className="mb-2">
            Enter details about the employee below.
          </Typography>
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
                disabled
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
                disabled
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
              disabled
            />
          </div>

          {/* Position & Department */}
          {/* <div className="grid grid-cols-2 gap-4">
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
          </div> */}

          {/* Expertise */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Expertise
            </label>
            <select
              name="expertise"
              value={employee.expertise}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="">Select Expertise</option>
              <option value="Electrician">Electrician</option>
              <option value="Plumber">Plumber</option>
              <option value="Carpenter">Carpenter</option>
              <option value="Groundskeeper">Groundskeeper</option>
              <option value="General Maintenance Technician">
                General Maintenance Technician
              </option>
            </select>
          </div>

          {/* Date Hired & Employment Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Date Hired
              </label>
              {mode === "add" ? (
                <input
                  type="date"
                  name="hire_date"
                  value={employee.hire_date}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              ) : (
                <input
                  type="text"
                  name="hire_date"
                  value={formatDate(employee.hire_date)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  readOnly
                />
              )}
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
            className="w-full min-h-[40px] mt-3"
            onClick={submitEmployee}
            disabled={
              !employee.first_name || !employee.last_name || !employee.email
            }
          >
            {mode === "edit" ? "Update Employee" : "Add Employee"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeForm;
