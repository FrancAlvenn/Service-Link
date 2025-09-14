import { useState, useEffect, useContext } from "react";
import {
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Chip,
  Spinner,
  Typography,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
} from "@material-tailwind/react";
import { AnimatePresence, motion } from "framer-motion";
import { UserContext } from "../../../context/UserContext";
import ToastNotification from "../../../utils/ToastNotification";
import { AuthContext } from "../../authentication";

function UserAccountActiveModal({ currentStatus, userId, onStatusUpdate }) {
  const [statusOptions, setStatusOptions] = useState([
    { id: 1, name: "active", color: "green" },
    { id: 2, name: "inactive", color: "red" },
    // { id: 3, name: "suspended", color: "amber" },
  ]);
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [pendingStatus, setPendingStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const { user } = useContext(AuthContext);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const { fetchUsers } = useContext(UserContext);

  useEffect(() => {
    if (user?.access_level === "admin") {
      setIsAuthorized(true);
    }
  }, [user]);

  useEffect(() => {
    setSelectedStatus(currentStatus);
  }, [currentStatus]);

  const handleStatusChange = async (statusName) => {
    try {
      setLoading(true);
      setSelectedStatus(statusName);

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/users/${userId}`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: statusName }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        ToastNotification.success(
          "Success!",
          data.message || "Status updated."
        );
        onStatusUpdate?.(statusName);
        fetchUsers();
      } else {
        throw new Error(data.message || "Update failed.");
      }
    } catch (error) {
      ToastNotification.error("Error!", "Failed to update user's status.");
      console.error("User status update failed:", error);
    } finally {
      setLoading(false);
      setPendingStatus(null);
    }
  };

  const selectedOption = statusOptions.find(
    (opt) => opt.name === selectedStatus
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
              value={selectedOption?.name || "Select Status"}
              className={`text-center w-fit ${
                isAuthorized ? "cursor-pointer" : "cursor-not-allowed"
              } dark:bg-gray-800 dark:text-gray-200`}
              color={selectedOption?.color || "cyan"}
            />
          )}
        </MenuHandler>

        {isAuthorized && (
          <MenuList className="mt-2 divide-y divide-gray-100 dark:divide-gray-700 rounded-md bg-white dark:bg-gray-900 shadow-lg ring-2 ring-black/5 dark:ring-gray-700 border-none">
            {statusOptions.length > 0 ? (
              <div className="flex flex-col">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
                  {statusOptions.map((option) => (
                    <MenuItem
                      key={option.id}
                      className="flex justify-between items-center px-4 py-2 text-xs dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => setPendingStatus(option.name)} // <-- store pending
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
              </div>
            ) : (
              <MenuItem className="flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">
                No statuses available.
              </MenuItem>
            )}
          </MenuList>
        )}
      </Menu>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {pendingStatus && (
          <Dialog
            open={!!pendingStatus}
            handler={() => setPendingStatus(null)}
            size="sm"
            className="dark:text-gray-100 dark:bg-gray-800"
          >
            <DialogHeader className="text-gray-900 dark:text-gray-200">
              Confirm Status Change
            </DialogHeader>

            <DialogBody className="w-full bg-white dark:bg-gray-800">
              <Typography className="font-normal text-sm text-gray-800 dark:text-gray-300">
                Are you sure you want to change this user’s status to{" "}
                <span className="font-semibold">{pendingStatus}</span>?
              </Typography>
            </DialogBody>

            <DialogFooter className="flex gap-2 w-full bg-white dark:bg-gray-800">
              <Button
                color="gray"
                onClick={() => setPendingStatus(null)}
                className=" bg-gray-500 dark:bg-gray-700 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleStatusChange(pendingStatus)}
                className="bg-blue-500 dark:bg-blue-600 cursor-pointer"
              >
                Confirm
              </Button>
            </DialogFooter>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
}

export default UserAccountActiveModal;
