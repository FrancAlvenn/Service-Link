import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Menu, MenuHandler, MenuList, MenuItem, Typography, Chip } from "@material-tailwind/react";
import { PlusCircle } from "@phosphor-icons/react";
import AuthContext from "../features/authentication/context/AuthContext";
import ToastNotification from "./ToastNotification";
import { JobRequestsContext } from "../features/request_management/context/JobRequestsContext";
import { PurchasingRequestsContext } from "../features/request_management/context/PurchasingRequestsContext";
import { VehicleRequestsContext } from "../features/request_management/context/VehicleRequestsContext";
import { VenueRequestsContext } from "../features/request_management/context/VenueRequestsContext";

function DepartmentModal({ request, input, referenceNumber, requestType, onDepartmentUpdate }) {
  const [departmentOptions, setDepartmentOptions] = useState([]); 
  const [currentDepartment, setCurrentDepartment] = useState(input); 

  const { user } = useContext(AuthContext);
  const { fetchJobRequests } = useContext(JobRequestsContext);
  const { fetchPurchasingRequests } = useContext(PurchasingRequestsContext);
  const { fetchVehicleRequests } = useContext(VehicleRequestsContext);
  const { fetchVenueRequests } = useContext(VenueRequestsContext);

  const fetchAllRequests = () => {
    fetchJobRequests();
    fetchPurchasingRequests();
    fetchVehicleRequests();
    fetchVenueRequests();
  };

  // Fetch department options from backend
  useEffect(() => {
    const getDepartments = async () => {
      try {
        const response = await axios.get("/settings/department", { withCredentials: true });

        if (Array.isArray(response.data.departments)) {
          setDepartmentOptions(response.data.departments);
        } else {
          console.error("Invalid response: 'departments' is not an array");
        }
      } catch (error) {
        console.error("Error fetching department options:", error);
      }
    };

    getDepartments();
  }, []);

  // Update department when `input` prop changes
  useEffect(() => {
    setCurrentDepartment(input);
  }, [input]);

  // Handle department change
  const handleDepartmentChange = async (department) => {
    try {
      setCurrentDepartment(department);

      const response = await axios({
        method: "put",
        url: `/${requestType}/${referenceNumber}`,
        data: {
            ...request,
            department: department,
        },
        withCredentials: true
      })

      if (response.status === 200) {
        ToastNotification.success("Success!", response.data.message);
        fetchAllRequests();

        // Trigger parent update if provided
        if (onDepartmentUpdate) {
          onDepartmentUpdate(department);
        }
      }
    } catch (error) {
      ToastNotification.error("Error!", "Failed to update department.");
      console.error("Department update failed:", error);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Menu placement="bottom-start">
        <MenuHandler>
          <Chip
            size="sm"
            variant="ghost"
            value={currentDepartment || "Select Department"}
            className="text-center w-fit cursor-pointer"
            color={departmentOptions.find(option => option.name === currentDepartment)?.color || "gray"}
          />
        </MenuHandler>
        <MenuList className="mt-2 divide-y divide-gray-100 rounded-md bg-white shadow-lg shadow-topping ring-2 ring-black/5 border-none">
          {departmentOptions.length > 0 ? (
            <div className="flex flex-col">
              <div className="grid grid-cols-2 gap-2">
                {departmentOptions.map((option) => (
                  <MenuItem
                    key={option.id}
                    className="flex justify-between items-center px-4 py-2 text-xs"
                    onClick={() => handleDepartmentChange(option.name)}
                  >
                    <Chip
                      size="sm"
                      variant="ghost"
                      value={option.name}
                      className="text-center w-fit cursor-pointer"
                      color={option.color}
                    >
                      {option.name}
                    </Chip>
                  </MenuItem>
                ))}
              </div>
              <div className="flex items-center mt-2 py-2 justify-center text-xs rounded-lg bg-gray-100">
                <Typography
                  color="blue-gray"
                  className="flex items-center gap-2 font-semibold text-sm text-gray-500 cursor-pointer"
                >
                  <PlusCircle size={18} className="cursor-pointer" />
                  Add new department
                </Typography>
              </div>
            </div>
          ) : (
            <MenuItem className="flex items-center justify-center text-xs text-gray-500">
              Loading department options...
            </MenuItem>
          )}
        </MenuList>
      </Menu>
    </div>
  );
}

export default DepartmentModal;
