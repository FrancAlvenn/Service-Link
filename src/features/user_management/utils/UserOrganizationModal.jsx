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

import { UserContext } from "../../../context/UserContext";


function UserOrganizationModal({
  currentOrganizationId,
  userId,
  onOrganizationUpdate,
}) {
  const navigate = useNavigate();
  const [organizationOptions, setOrganizationOptions] = useState([]);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState(
    currentOrganizationId
  );

  const { user } = useContext(AuthContext);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const [loading, setLoading] = useState(true);

  const { allUserInfo, fetchUsers } = useContext(UserContext);

  useEffect(() => {
    const getOrganizations = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.REACT_APP_API_URL}/settings/organization`, {
          credentials: "include",
        });

        const data = await response.json();
        if (Array.isArray(data.organizations)) {
          setOrganizationOptions(data.organizations);
        } else {
          console.error("Invalid response: 'organizations' is not an array");
        }
      } catch (error) {
        console.error("Error fetching organization options:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.access_level === "admin") {
      setIsAuthorized(true);
    }

    getOrganizations();
  }, []);

  useEffect(() => {
    setSelectedOrganizationId(currentOrganizationId);
  }, [currentOrganizationId]);

  const handleOrganizationChange = async (organizationId) => {
    try {
      setSelectedOrganizationId(organizationId);

      const response = await fetch(`${process.env.REACT_APP_API_URL}/users/${userId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organization_id: organizationId }),
      });

      const data = await response.json();

      if (response.ok) {
        ToastNotification.success(
          "Success!",
          data.message || "Organization updated."
        );
        onOrganizationUpdate?.(organizationId);
        
        fetchUsers();
      } else {
        throw new Error(data.message || "Update failed.");
      }
    } catch (error) {
      ToastNotification.error(
        "Error!",
        "Failed to update user's organization."
      );
      console.error("User organization update failed:", error);
    }
  };

  const selectedOrganization = organizationOptions.find(
    (option) => option.id === selectedOrganizationId
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
              value={
                selectedOrganization?.organization || "Select Organization"
              }
              className={`text-center w-fit ${
                isAuthorized ? "cursor-pointer" : "cursor-not-allowed"
              } dark:bg-gray-800 dark:text-gray-200`}
              color={selectedOrganization?.color || "cyan"}
            />
          )}
        </MenuHandler>

        {isAuthorized && (
          <MenuList className="mt-2 divide-y divide-gray-100 dark:divide-gray-700 rounded-md bg-white dark:bg-gray-900 shadow-lg ring-2 ring-black/5 dark:ring-gray-700 border-none">
            {organizationOptions.length > 0 ? (
              <div className="flex flex-col">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
                  {organizationOptions.map((option) => (
                    <MenuItem
                      key={option.id}
                      className="flex justify-between items-center px-4 py-2 text-xs dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => handleOrganizationChange(option.id)}
                    >
                      <Chip
                        size="sm"
                        variant="ghost"
                        value={option.organization}
                        className="text-center w-fit cursor-pointer dark:bg-gray-700 dark:text-gray-300"
                        color={option.color}
                      >
                        {option.organization}
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
                    Add new organization
                  </Typography>
                </div>
              </div>
            ) : (
              <MenuItem className="flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">
                Loading organization options...
              </MenuItem>
            )}
          </MenuList>
        )}
      </Menu>
    </div>
  );
}

export default UserOrganizationModal;
