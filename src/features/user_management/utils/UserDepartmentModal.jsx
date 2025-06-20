import { useState, useEffect, useContext } from "react";
import {
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Typography,
  Chip,
  Spinner,
} from "@material-tailwind/react";
import { PlusCircle } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../authentication";
import ToastNotification from "../../../utils/ToastNotification";
import shouldAccountBeActive from "./accountStatusChecker";
import { UserContext } from "../../../context/UserContext";
import { refetchAndValidateAccount } from "./refetchAndValidateAccount";

function UserDepartmentModal({
  currentDepartmentId,
  userId,
  onDepartmentUpdate,
}) {
  const navigate = useNavigate();
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [selectedDepartmentId, setSelectedDepartmentId] =
    useState(currentDepartmentId);
  const [loading, setLoading] = useState(true); // NEW

  const { user } = useContext(AuthContext);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const { allUserInfo, fetchUsers } = useContext(UserContext);

  useEffect(() => {
    const getDepartments = async () => {
      setLoading(true); // START loading
      try {
        const response = await fetch("/settings/department", {
          credentials: "include",
        });
        const data = await response.json();
        if (Array.isArray(data.departments)) {
          setDepartmentOptions(data.departments);
        } else {
          console.error("Invalid response: 'departments' is not an array");
        }
      } catch (error) {
        console.error("Error fetching department options:", error);
      } finally {
        setLoading(false); // END loading
      }
    };

    if (user?.access_level === "admin") {
      setIsAuthorized(true);
    }

    getDepartments();
  }, []);

  useEffect(() => {
    setSelectedDepartmentId(currentDepartmentId);
  }, [currentDepartmentId]);

  const handleDepartmentChange = async (departmentId) => {
    try {
      setSelectedDepartmentId(departmentId);

      const response = await fetch(`/users/${userId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ department_id: departmentId }),
      });

      const data = await response.json();

      if (response.ok) {
        ToastNotification.success(
          "Success!",
          data.message || "Department updated."
        );
        onDepartmentUpdate?.(departmentId);
        await refetchAndValidateAccount(userId);
        fetchUsers();
      } else {
        throw new Error(data.message || "Update failed.");
      }
    } catch (error) {
      ToastNotification.error("Error!", "Failed to update user's department.");
      console.error("User department update failed:", error);
    }
  };

  const selectedDepartment = departmentOptions.find(
    (option) => option.id === selectedDepartmentId
  );

  return (
    <div className="flex flex-col gap-2">
      <Menu placement="bottom-start">
        <MenuHandler>
          {loading ? (
            <Chip
              size="sm"
              variant="ghost"
              value="Loading..."
              className="text-center w-fit dark:bg-gray-800 dark:text-gray-200 cursor-wait flex items-center gap-2"
              color="cyan"
              icon={<Spinner className="h-3 w-3" />}
            />
          ) : (
            <Chip
              size="sm"
              variant="ghost"
              value={selectedDepartment?.name || "Select Department"}
              className={`text-center w-fit ${
                isAuthorized ? "cursor-pointer" : "cursor-not-allowed"
              } dark:bg-gray-800 dark:text-gray-200`}
              color={selectedDepartment?.color || "cyan"}
            />
          )}
        </MenuHandler>

        {isAuthorized && (
          <MenuList className="mt-2 divide-y divide-gray-100 dark:divide-gray-700 rounded-md bg-white dark:bg-gray-900 shadow-lg ring-2 ring-black/5 dark:ring-gray-700 border-none">
            {loading ? (
              <MenuItem className="flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">
                <Spinner className="h-4 w-4 mr-2" /> Loading...
              </MenuItem>
            ) : departmentOptions.length > 0 ? (
              <div className="flex flex-col">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
                  {departmentOptions.map((option) => (
                    <MenuItem
                      key={option.id}
                      className="flex justify-between items-center px-4 py-2 text-xs dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => handleDepartmentChange(option.id)}
                    >
                      <Chip
                        size="sm"
                        variant="ghost"
                        value={option.name}
                        className="text-center w-fit cursor-pointer dark:bg-gray-700 dark:text-gray-300"
                        color={option.color}
                      >
                        {option.name}
                      </Chip>
                    </MenuItem>
                  ))}
                </div>
                <div className="flex items-center mt-2 py-2 justify-center text-xs rounded-lg bg-gray-100 dark:bg-gray-800">
                  <Typography
                    color="blue-gray"
                    className="flex items-center gap-2 font-semibold text-sm text-gray-500 dark:text-gray-300 cursor-pointer"
                    onClick={() => navigate("/workspace/settings")}
                  >
                    <PlusCircle size={18} />
                    Add new department
                  </Typography>
                </div>
              </div>
            ) : (
              <MenuItem className="flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">
                No departments available.
              </MenuItem>
            )}
          </MenuList>
        )}
      </Menu>
    </div>
  );
}

export default UserDepartmentModal;
