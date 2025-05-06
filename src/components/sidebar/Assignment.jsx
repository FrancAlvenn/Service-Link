import { useContext, useEffect, useState } from "react";
import axios from "axios";
import {
  Chip,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Typography,
  Button,
} from "@material-tailwind/react";
import EmployeeContext from "../../features/employee_management/context/EmployeeContext";
import ToastNotification from "../../utils/ToastNotification";
import { UserCircle } from "@phosphor-icons/react";
import { UserContext } from "../../context/UserContext"; // Import UserContext
import { AuthContext } from "../../features/authentication";
import AssetContext from "../../features/asset_management/context/AssetContext";

const Assignment = ({
  selectedRequest,
  setSelectedRequest,
  requestType,
  fetchRequests,
}) => {
  const { employees, fetchEmployees } = useContext(EmployeeContext);
  const { assets, fetchAssets } = useContext(AssetContext);
  const { user } = useContext(AuthContext); // Current logged-in user

  const [selectedEmployees, setSelectedEmployees] = useState([]);

  const getRequestActivity = async () => {
    await axios({
      method: "GET",
      url: `/request_activity/${selectedRequest.reference_number}`,
      withCredentials: true,
    });
  };

  useEffect(() => {
    fetchEmployees();
    fetchAssets();
  }, []);

  useEffect(() => {
    if (
      selectedRequest?.assigned_to &&
      Array.isArray(selectedRequest.assigned_to)
    ) {
      const selected = employees.filter((emp) =>
        selectedRequest.assigned_to.includes(emp.reference_number)
      );
      setSelectedEmployees(selected);
    }
  }, [selectedRequest?.assigned_to, employees]);

  const handleSaveActivity = async () => {
    const newActivity = {
      reference_number: selectedRequest.reference_number,
      type: "comment",
      visibility: "external",
      action: "Reply to Client",
      details: `Your request has been assigned to an employee.`,
      performed_by: user.reference_number,
    };

    try {
      await axios({
        method: "post",
        url: "/request_activity",
        data: newActivity,
        withCredentials: true,
      }).then((res) => {
        getRequestActivity();
      });
    } catch (error) {
      console.error("Error saving activity:", error);
    }
  };

  const toggleEmployee = async (referenceNumber) => {
    const current = selectedRequest.assigned_to || [];
    const updated = current.includes(referenceNumber)
      ? current.filter((ref) => ref !== referenceNumber)
      : [...current, referenceNumber];

    try {
      await axios.put(`/${requestType}/${selectedRequest.reference_number}`, {
        ...selectedRequest,
        assigned_to: updated,
      });

      setSelectedRequest((prev) => ({
        ...prev,
        assigned_to: updated,
      }));
      fetchRequests();
      ToastNotification.success("Success", "Assigned employees updated.");

      // Only log activity if this was an assignment (not removal)
      if (!current.includes(referenceNumber)) {
        handleSaveActivity();
      }
    } catch (error) {
      console.error("Error updating assigned employees:", error);
      ToastNotification.error("Error", "Failed to update assigned employees.");
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2 p-3 mb-3 border-gray-400 border rounded-md h-[70vh] overflow-y-auto">
        <span className="flex gap-1">
          <p className="text-sm font-semibold text-gray-600">Assignee</p>
        </span>

        <Menu placement="bottom-start">
          <MenuHandler>
            <Button variant="outlined" size="sm" className="w-full text-left">
              {selectedEmployees.length > 0
                ? `Assigned (${selectedEmployees.length})`
                : "Assign Employee"}
            </Button>
          </MenuHandler>
          <MenuList className="max-h-64 overflow-y-auto w-full max-w-[440px]">
            {employees.length > 0 ? (
              employees.map((emp) => {
                const isSelected = selectedRequest?.assigned_to?.includes(
                  emp.reference_number
                );
                return (
                  <MenuItem
                    key={emp.reference_number}
                    onClick={() => toggleEmployee(emp.reference_number)}
                    className={`flex justify-between items-center ${
                      isSelected ? "bg-blue-100" : ""
                    }`}
                  >
                    <span className="flex items-center w-full">
                      <UserCircle size={20} className="mr-2" />
                      {emp.first_name} {emp.last_name}
                    </span>
                    {isSelected && (
                      <Chip
                        size="sm"
                        color="blue"
                        value="Assigned"
                        className="ml-2"
                      />
                    )}
                  </MenuItem>
                );
              })
            ) : (
              <MenuItem key="no-employees" disabled className="text-gray-900">
                No employees available
              </MenuItem>
            )}
          </MenuList>
        </Menu>

        {selectedEmployees.length > 0 && (
          <div className="mt-2">
            <span className="flex gap-1">
              <p className="text-sm font-semibold text-gray-600 mb-3">
                Currently Assigned
              </p>
            </span>
            <div className="flex flex-wrap gap-2">
              {selectedEmployees.map((emp) => (
                <Chip
                  key={emp.reference_number}
                  value={`${emp.first_name} ${emp.last_name}`}
                  onClose={() => toggleEmployee(emp.reference_number)}
                  color="blue"
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 p-3 mb-3 border-gray-400 border rounded-md">
        <span className="flex gap-1">
          <p className="text-sm font-semibold text-gray-600">Asset(s)</p>
        </span>
      </div>
    </div>
  );
};

export default Assignment;
