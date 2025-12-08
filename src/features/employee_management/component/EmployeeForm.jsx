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
  const auth = useContext(AuthContext);
  const user = auth?.user;

  const [errorMessage, setErrorMessage] = useState("");
  const [stepError, setStepError] = useState("");

  const { fetchEmployees } = useContext(EmployeeContext);

  // In EmployeeForm.jsx, update the initial state to include address:
  const [activeStep, setActiveStep] = useState(0);
  const allowedQualifications = [
    "Plumbing",
    "Electrical",
    "Carpentry",
    "HVAC",
    "Welding",
    "Painting",
    "Masonry",
    "IT Support",
    "Cleaning",
    "General Maintenance",
  ];

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
      availability_status: "Available",
      experience_level: "Mid",
      qualifications: [],
      specializations: [],
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
        availability_status: "Available",
        experience_level: "Mid",
        qualifications: [],
        specializations: [],
      }
    );
  };

  const submitEmployee = async () => {
    if (!validateStep(1)) return;
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

  const validateStep = (step) => {
    if (step === 0) {
      const messages = [];
      if (!String(employee.first_name || '').trim()) messages.push("First name is required");
      if (!String(employee.last_name || '').trim()) messages.push("Last name is required");
      if (!String(employee.email || '').trim()) messages.push("Email is required");
      if (!String(employee.contact_number || '').trim()) messages.push("Contact number is required");
      if (!String(employee.address || '').trim()) messages.push("Address is required");
      if (messages.length) {
        const msg = messages.join(". ");
        setStepError(msg);
        ToastNotification.error("Missing Information", msg);
        return false;
      }
      setStepError("");
      return true;
    }
    if (step === 1) {
      const messages = [];
      if (!String(employee.availability_status || '').trim()) messages.push("Availability status is required");
      if (!String(employee.experience_level || '').trim()) messages.push("Experience level is required");
      if (!Array.isArray(employee.qualifications) || employee.qualifications.length === 0) messages.push("Select at least one qualification");
      if (messages.length) {
        const msg = messages.join(". ");
        setStepError(msg);
        ToastNotification.error("Missing Information", msg);
        return false;
      }
      setStepError("");
      return true;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(0)) {
      setActiveStep(1);
    }
  };

  const handleBack = () => {
    setActiveStep(0);
  };

  const toggleQualification = (q) => {
    setEmployee((prev) => {
      const quals = Array.isArray(prev.qualifications) ? prev.qualifications : [];
      return {
        ...prev,
        qualifications: quals.includes(q)
          ? quals.filter((x) => x !== q)
          : [...quals, q],
      };
    });
  };

  const addSpecialization = (value) => {
    const trimmed = String(value).trim();
    if (!trimmed) return;
    setEmployee((prev) => {
      const specs = Array.isArray(prev.specializations) ? prev.specializations : [];
      if (specs.includes(trimmed)) return prev;
      return { ...prev, specializations: [...specs, trimmed] };
    });
  };

  const removeSpecialization = (value) => {
    setEmployee((prev) => ({
      ...prev,
      specializations: (prev.specializations || []).filter((s) => s !== value),
    }));
  };

  return (
    <div className="h-full z-50">
      <div className="h-full bg-white rounded-lg w-full px-3 flex flex-col justify-start">
        <div className="py-4 px-5 mb-5 shadow-sm">
          <Typography variant="h5" color="blue-gray" className="mb-2">
            {mode === "edit" ? "Edit Employee" : "Add New Employee"}
          </Typography>
          <Typography variant="small" className="mb-2">
            {activeStep === 0 ? "Enter employee details." : "Set qualifications and availability."}
          </Typography>
          <div className="text-xs text-gray-600">Step {activeStep + 1} of 2</div>
        </div>

        {/* Stepper */}
        <div className="mb-4 px-5 py-2 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            <div className="flex flex-col items-center flex-1 relative">
              <button
                onClick={() => setActiveStep(0)}
                className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  activeStep === 0
                    ? "bg-blue-600 border-blue-600 text-white"
                    : activeStep > 0
                    ? "bg-green-500 border-green-500 text-white"
                    : "bg-white border-gray-300 text-gray-400"
                }`}
              >
                <span className="font-semibold text-sm">1</span>
              </button>
              <div className="mt-1 text-center">
                <Typography variant="small" className={`text-xs font-medium ${activeStep >= 0 ? "text-gray-900" : "text-gray-400"}`}>Employee Information</Typography>
              </div>
              {activeStep === 0 && (
                <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-12 h-0.5 bg-blue-600 rounded-full"></div>
              )}
            </div>
            <div className="flex-1 h-0.5 mx-3 relative -mt-4">
              <div className={`absolute top-0 left-0 h-full ${activeStep > 0 ? "bg-green-500 w-full" : "bg-gray-300 w-0"}`}></div>
              <div className="absolute top-0 left-0 h-full w-full bg-gray-200 rounded-full -z-10"></div>
            </div>
            <div className="flex flex-col items-center flex-1 relative">
              <button
                onClick={() => setActiveStep(1)}
                className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  activeStep === 1
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "bg-white border-gray-300 text-gray-400"
                }`}
              >
                <span className="font-semibold text-sm">2</span>
              </button>
              <div className="mt-1 text-center">
                <Typography variant="small" className={`text-xs font-medium ${activeStep >= 1 ? "text-gray-900" : "text-gray-400"}`}>Qualifications & Availability</Typography>
              </div>
              {activeStep === 1 && (
                <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-12 h-0.5 bg-blue-600 rounded-full"></div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 px-5 pb-4 overflow-y-auto">
          {/* Step 1: Personal Information */}
          {activeStep === 0 && (
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <Typography variant="small" className="font-semibold mb-2">Personal Information</Typography>
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
            <label className="block text-xs font-medium text-gray-700 mb-1">Expertise</label>
            <select name="expertise" value={employee.expertise} onChange={handleChange} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
              <option value="">Select Expertise</option>
              <option value="Electrician">Electrician</option>
              <option value="Plumber">Plumber</option>
              <option value="Carpenter">Carpenter</option>
              <option value="Groundskeeper">Groundskeeper</option>
              <option value="General Maintenance Technician">General Maintenance Technician</option>
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
            <label htmlFor="contact_number" className="block text-xs font-medium text-gray-700 mb-1">Contact Number</label>
            <input id="contact_number" type="text" name="contact_number" value={employee.contact_number} onChange={handleChange} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
          </div>

          {/* Address */}
          <div>
            <label htmlFor="address" className="block text-xs font-medium text-gray-700 mb-1">Address</label>
            <input id="address" type="text" name="address" value={employee.address} onChange={handleChange} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
          </div>
          </div>
          )}

          {/* Step 2: Qualifications & Availability */}
          {activeStep === 1 && (
            <div className="space-y-3 border border-gray-200 rounded-lg p-4 bg-gray-50">
              <Typography variant="small" className="font-semibold mb-2">Qualifications & Availability</Typography>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Availability Status</label>
                  <select name="availability_status" value={employee.availability_status} onChange={handleChange} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                    <option value="Available">Available</option>
                    <option value="Unavailable">Unavailable</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Busy">Busy</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Experience Level</label>
                  <select name="experience_level" value={employee.experience_level} onChange={handleChange} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                    <option value="Junior">Junior</option>
                    <option value="Mid">Mid</option>
                    <option value="Senior">Senior</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 my-2">Qualifications</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {allowedQualifications.map((q) => (
                    <label key={q} className="flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={Array.isArray(employee.qualifications) && employee.qualifications.includes(q)}
                        onChange={() => toggleQualification(q)}
                      />
                      {q}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 my-2">Specializations</label>
                <div className="flex gap-2 mb-2 flex-wrap">
                  {(employee.specializations || []).map((s, idx) => (
                    <span key={`${s}-${idx}`} className="px-2 py-1 text-xs bg-gray-100 rounded border border-gray-300 flex items-center gap-1">
                      {s}
                      <button type="button" onClick={() => removeSpecialization(s)} className="text-red-500">×</button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g., CCS Office, Plumbing Fixtures"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSpecialization(e.currentTarget.value);
                        e.currentTarget.value = "";
                      }
                    }}
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                  <Button
                    color="blue"
                    variant="outlined"
                    size="sm"
                    onClick={(e) => {
                      const input = e.currentTarget.previousSibling;
                      if (input && input.value) {
                        addSpecialization(input.value);
                        input.value = "";
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>
          )}

          {(stepError || errorMessage) && (
            <p className="text-red-500 text-xs">{stepError ? `Missing Information: ${stepError}` : errorMessage}</p>
          )}

          <div className="flex gap-2 w-full justify-between mt-4">
            {activeStep > 0 && (
              <Button onClick={handleBack} variant="outlined" color="blue">
                Back
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              {activeStep < 1 ? (
                <Button onClick={handleNext} color="blue">Next</Button>
              ) : (
                <Button onClick={submitEmployee} color="blue" className="dark:bg-blue-600 dark:hover:bg-blue-500">
                  {mode === "edit" ? "Update Employee" : "Save Employee"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeForm;
