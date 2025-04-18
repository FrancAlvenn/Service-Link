import { CaretRight, UserCircle } from "@phosphor-icons/react";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { Button } from "@material-tailwind/react";
import { AuthContext } from "../../authentication";
import { UserContext } from "../../../context/UserContext";
import ToastNotification from "../../../utils/ToastNotification";
import { formatDate } from "../../../utils/dateFormatter";

const EmployeeSidebar = ({
  open,
  onClose,
  referenceNumber,
  employees,
  fetchEmployees,
  deleteEmployee,
}) => {
  const [isOpen, setIsOpen] = useState(open);
  const { user } = useContext(AuthContext);
  const { getUserByReferenceNumber } = useContext(UserContext);

  const [employee, setEmployee] = useState(null);
  const [editedFields, setEditedFields] = useState({});
  const [editingField, setEditingField] = useState(null);

  const employeeFieldConfig = [
    {
      key: "reference_number",
      label: "Reference Number",
      type: "text",
      readOnly: true,
    },
    { key: "first_name", label: "First Name", type: "text" },
    { key: "last_name", label: "Last Name", type: "text" },
    { key: "email", label: "Email", type: "text" },
    { key: "position", label: "Position", type: "text" },
    { key: "department", label: "Department", type: "text" },
    { key: "expertise", label: "Expertise", type: "text" },
    { key: "contact_number", label: "Contact Number", type: "text" },
    { key: "hire_date", label: "Date Hired", type: "date" },
    { key: "status", label: "Employment Status", type: "text" },
    { key: "createdAt", label: "Created At", type: "date", readOnly: true },
    { key: "updatedAt", label: "Updated At", type: "date", readOnly: true },
  ];

  useEffect(() => {
    if (isOpen && referenceNumber) {
      const foundEmployee = employees.find(
        (emp) => emp.reference_number === referenceNumber
      );
      setEmployee(foundEmployee);
    }
  }, [employees, referenceNumber, isOpen]);

  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  const handleClose = () => {
    setEmployee(null);
    setEditedFields({});
    setIsOpen(false);
    if (onClose) onClose();
  };

  const handleSidebarClick = (e) => e.stopPropagation();

  const handleFieldChange = (field, value) => {
    setEditedFields((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (field) => {
    try {
      await axios.put(
        `/employees/${employee.reference_number}`,
        {
          ...employee,
          [field]: editedFields[field],
          requester: user.reference_number,
        },
        { withCredentials: true }
      );
      fetchEmployees();
      // ToastNotification.success("Success", `${field} updated successfully.`);
    } catch (error) {
      console.error("Update failed:", error);
      ToastNotification.error("Error", `Failed to update ${field}.`);
    } finally {
      setEditingField(null);
      setEditedFields((prev) => {
        const newFields = { ...prev };
        delete newFields[field];
        return newFields;
      });
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/employees/${employee.reference_number}`, {
        withCredentials: true,
      });
      fetchEmployees();
      ToastNotification.success("Success", "Employee deleted successfully.");
    } catch (error) {
      console.error("Delete failed:", error);
      ToastNotification.error("Error", "Failed to delete employee.");
    } finally {
      handleClose();
    }
  };

  const handleKeyDown = (e, field) => {
    if (e.key === "Enter") handleSave(field);
    if (e.key === "Escape") setEditingField(null);
  };

  const renderFieldValue = (field, value) => {
    if (field.type === "date" && value) return formatDate(value);
    if (!value && !field.readOnly)
      return <span className="text-gray-500">Click to edit</span>;
    return value || "N/A";
  };

  return (
    <>
      {/* Sidebar Overlay */}
      <div
        className={`bg-black bg-opacity-50 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={handleClose}
      ></div>

      {/* Sidebar Container */}
      <div
        onClick={handleSidebarClick}
        className={`z-50 shadow-lg w-[650px] h-full p-5 bg-white transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "hidden"
        }`}
      >
        {employee ? (
          <div className="flex flex-col overflow-y-auto h-full">
            <div className="p-1 rounded-md bg-white">
              <CaretRight
                color="black"
                size={20}
                onClick={handleClose}
                className="cursor-pointer"
              />
            </div>

            {/* Employee Name (Editable) */}
            <h2 className="text-xl font-bold mb-4">
              {editingField === "first_name" ? (
                <input
                  type="text"
                  className="border w-full border-gray-300 rounded-md p-2 text-xl font-bold"
                  value={editedFields.first_name ?? employee.first_name}
                  onChange={(e) =>
                    handleFieldChange("first_name", e.target.value)
                  }
                  onBlur={() => handleSave("first_name")}
                  onKeyDown={(e) => handleKeyDown(e, "first_name")}
                  autoFocus
                />
              ) : (
                <p
                  onClick={() => setEditingField("first_name")}
                  className="cursor-pointer"
                >
                  {employee.first_name || "Click to edit"}
                </p>
              )}
            </h2>

            {/* Employee Details */}
            <div className="flex flex-col p-3 gap-2 border-gray-400 border rounded-md">
              {employeeFieldConfig.map((field) => {
                if (field.key === "first_name") return null;
                const value = employee[field.key];

                return (
                  <div
                    key={field.key}
                    className="mb-3 flex justify-between items-center"
                  >
                    <p className="text-sm font-semibold capitalize">
                      {field.label}
                    </p>

                    {field.readOnly ? (
                      <p className="text-sm w-[60%] truncate">
                        {renderFieldValue(field, value)}
                      </p>
                    ) : editingField === field.key ? (
                      <input
                        type={field.type === "date" ? "date" : "text"}
                        className="text-sm p-2 border border-gray-300 rounded-md w-[60%]"
                        value={editedFields[field.key] ?? value}
                        onChange={(e) =>
                          handleFieldChange(field.key, e.target.value)
                        }
                        onBlur={() => handleSave(field.key)}
                        onKeyDown={(e) => handleKeyDown(e, field.key)}
                        autoFocus
                      />
                    ) : (
                      <p
                        onClick={() => setEditingField(field.key)}
                        className="text-sm cursor-pointer w-[60%] truncate"
                      >
                        {renderFieldValue(field, value)}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <Button
              color="red"
              onClick={() => deleteEmployee(employee.reference_number)}
              className="w-full min-h-[40px] max-w-[160px] mt-3"
            >
              Delete Employee
            </Button>
          </div>
        ) : (
          <div className="flex justify-center items-center h-full text-xl text-gray-600">
            No employee found.
          </div>
        )}
      </div>
    </>
  );
};

export default EmployeeSidebar;
