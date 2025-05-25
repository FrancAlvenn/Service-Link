import { useState, useEffect, useContext } from "react";
import {
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Typography,
  Chip,
} from "@material-tailwind/react";
import { PlusCircle } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../authentication";
import ToastNotification from "../../../utils/ToastNotification";

function UserDesignationModal({
  currentDesignationId,
  userId,
  onDesignationUpdate,
}) {
  const navigate = useNavigate();
  const [designationOptions, setDesignationOptions] = useState([]);
  const [selectedDesignationId, setSelectedDesignationId] =
    useState(currentDesignationId);

  const { user } = useContext(AuthContext);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const getDesignations = async () => {
      try {
        const response = await fetch("/settings/designation", {
          credentials: "include",
        });

        const data = await response.json();
        if (Array.isArray(data.designations)) {
          setDesignationOptions(data.designations);
        } else {
          console.error("Invalid response: 'designations' is not an array");
        }
      } catch (error) {
        console.error("Error fetching designation options:", error);
      }
    };

    if (user?.access_level === "admin") {
      setIsAuthorized(true);
    }

    getDesignations();
  }, []);

  useEffect(() => {
    setSelectedDesignationId(currentDesignationId);
  }, [currentDesignationId]);

  const handleDesignationChange = async (designationId) => {
    try {
      setSelectedDesignationId(designationId);

      const response = await fetch(`/users/${userId}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ designation_id: designationId }),
      });

      const data = await response.json();

      if (response.ok) {
        ToastNotification.success(
          "Success!",
          data.message || "Designation updated."
        );
        onDesignationUpdate?.(designationId);
      } else {
        throw new Error(data.message || "Update failed.");
      }
    } catch (error) {
      ToastNotification.error("Error!", "Failed to update user's designation.");
      console.error("User designation update failed:", error);
    }
  };

  const selectedDesignation = designationOptions.find(
    (option) => option.id === selectedDesignationId
  );

  return (
    <div className="flex flex-col gap-2">
      <Menu placement="bottom-start">
        <MenuHandler>
          <Chip
            size="sm"
            variant="ghost"
            value={selectedDesignation?.name || "Select Designation"}
            className={`text-center w-fit ${
              isAuthorized ? "cursor-pointer" : "cursor-not-allowed"
            } dark:bg-gray-800 dark:text-gray-200`}
            color={selectedDesignation?.color || "gray"}
          />
        </MenuHandler>
        {isAuthorized && (
          <MenuList className="mt-2 divide-y divide-gray-100 dark:divide-gray-700 rounded-md bg-white dark:bg-gray-900 shadow-lg ring-2 ring-black/5 dark:ring-gray-700 border-none">
            {designationOptions.length > 0 ? (
              <div className="flex flex-col">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
                  {designationOptions.map((option) => (
                    <MenuItem
                      key={option.id}
                      className="flex justify-between items-center px-4 py-2 text-xs dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => handleDesignationChange(option.id)}
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
                    Add new designation
                  </Typography>
                </div>
              </div>
            ) : (
              <MenuItem className="flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">
                Loading designation options...
              </MenuItem>
            )}
          </MenuList>
        )}
      </Menu>
    </div>
  );
}

export default UserDesignationModal;
