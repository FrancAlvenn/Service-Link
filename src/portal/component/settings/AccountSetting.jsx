import { Typography, Button } from "@material-tailwind/react";
import {
  ArrowLeft,
  DeviceMobileCamera,
  Envelope,
  Lock,
  Tag,
  User,
} from "@phosphor-icons/react";
import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../features/authentication";
import { UserContext } from "../../../context/UserContext";
import ToastNotification from "../../../utils/ToastNotification";
import axios from "axios";
import DepartmentSelect from "../../../utils/select/departmentSelect";
import { SettingsContext } from "../../../features/settings/context/SettingsContext";

function AccountSetting({ onClose }) {
  const { user } = useContext(AuthContext);
  const { allUserInfo, fetchUsers } = useContext(UserContext);

  const [currentUser, setCurrentUser] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [passwords, setPasswords] = useState({
    password: "",
    confirmPassword: "",
  });

  const { departments } = useContext(SettingsContext);
  const [tempDepartmentId, setTempDepartmentId] = useState("");

  useEffect(() => {
    fetchUsers();
    if (user?.reference_number) {
      setCurrentUser(
        allUserInfo.find(
          (_user) => _user.reference_number === user?.reference_number
        )
      );
    }
  }, []);

  if (!currentUser) {
    return <p className="dark:text-white">Loading...</p>;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveField = async (key, newValue) => {
    try {
      if (key === "password") {
        if (!passwords.password || !passwords.confirmPassword) {
          ToastNotification.info("Notice!", "Please enter a password.");
          return;
        }
        if (passwords.password !== passwords.confirmPassword) {
          ToastNotification.info("Notice!", "Passwords don't match.");
          return;
        }
        await axios.put(`${process.env.REACT_APP_API_URL}/users/${currentUser.reference_number}`, {
          password: passwords.password,
        }, { withCredentials: true });
        ToastNotification.success("Success!", "Password updated.");
        setPasswords({ password: "", confirmPassword: "" });
      } else {
        // Validate phone number if the key is contact_number
        if (key === "contact_number") {
          const phoneRegex = /^[0-9]{11}$/;
          if (!phoneRegex.test(newValue ?? currentUser.contact_number)) {
            setCurrentUser((prev) => ({ ...prev, contact_number: "" }));
            ToastNotification.info(
              "Notice!",
              "Please enter a valid phone number."
            );
            return;
          }
        }

        // Use the newValue if provided; otherwise get currentUser[key]
        const valueToSave =
          newValue !== undefined ? newValue : currentUser[key];

        await axios.put(`${process.env.REACT_APP_API_URL}/users/${currentUser.reference_number}`, {
          [key]: valueToSave,
        });

        ToastNotification.success("Success!", `${key} updated.`);
      }

      setEditingField(null);
    } catch (error) {
      console.error(`Error updating ${key}:`, error);
      ToastNotification.error("Error!", "Something went wrong while updating.");
    }
  };

  return (
    <div className="fixed top-0 right-0 w-full max-w-[750px] h-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white z-100 p-6 overflow-y-auto">
      <div className="flex flex-col justify-between items-start mb-6 w-full">
        <div className="flex items-center justify-between w-full">
          <div className="p-1 rounded-md bg-gray-500 dark:bg-gray-700 mb-3">
            <ArrowLeft
              size={24}
              color="white"
              className="cursor-pointer"
              onClick={onClose}
            />
          </div>
        </div>

        <Typography
          variant="h5"
          className="font-bold text-xl mb-4 dark:text-white"
        >
          Account Settings
        </Typography>

        <div className="flex flex-col gap-3 pt-5 pb-2 px-5 border border-gray-200 dark:border-gray-700 rounded-lg w-full">
          <Typography className="text-sm font-semibold dark:text-gray-300">
            Personal Information
          </Typography>

          {[
            {
              label: "First Name",
              icon: <User size={20} />,
              key: "first_name",
              editable: true,
            },
            {
              label: "Last Name",
              icon: <User size={20} />,
              key: "last_name",
              editable: true,
            },
            {
              label: "Email",
              icon: <Envelope size={20} />,
              key: "email",
              editable: false,
            },
            {
              label: "Phone Number",
              icon: <DeviceMobileCamera size={20} />,
              key: "contact_number",
              editable: true,
            },
            {
              label: "Username",
              icon: <Tag size={20} />,
              key: "username",
              editable: true,
            },
            {
              label: "Department",
              icon: <Tag size={20} />,
              key: "department_id",
              editable: false, // make it editable
              customComponent:
                editingField === "department_id" ? (
                  <DepartmentSelect
                    value={currentUser.department_id}
                    onChange={(e) => {
                      const newId = e.target.value;
                      setCurrentUser((prev) => ({
                        ...prev,
                        department_id: newId,
                      }));
                      handleSaveField("department_id", newId);
                    }}
                  />
                ) : (
                  <Typography className="text-sm font-medium py-0 dark:text-gray-200">
                    {departments.find(
                      (d) => String(d.id) === String(currentUser.department_id)
                    )?.name ?? "Not Assigned"}
                  </Typography>
                ),
            },
          ].map(({ label, icon, key, editable, customComponent }) => (
            <div
              key={key}
              className="flex gap-2 py-4 px-2 items-center border-b border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
              onClick={() => editable && setEditingField(key)}
            >
              {icon}
              <div className="flex flex-col gap-0 w-full">
                <Typography className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {label}
                </Typography>
                {customComponent ? (
                  customComponent
                ) : editable && editingField === key ? (
                  <input
                    type="text"
                    name={key}
                    value={currentUser[key]}
                    onChange={handleChange}
                    className="text-sm p-2 w-full border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-black dark:text-white"
                    onBlur={() => handleSaveField(key)}
                    autoFocus
                  />
                ) : (
                  <Typography className="text-sm font-medium py-0 dark:text-gray-200">
                    {currentUser[key]}
                  </Typography>
                )}
              </div>
            </div>
          ))}

          {/* Password Section */}
          <div className="flex gap-2 py-4 px-2 items-center hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
            <Lock size={20} />
            <div className="flex flex-col gap-0 w-full">
              <Typography className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Password
              </Typography>
              {editingField === "password" ? (
                <>
                  <input
                    type="password"
                    name="password"
                    value={passwords.password}
                    onChange={(e) =>
                      setPasswords((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    placeholder="New Password"
                    className="text-sm p-2 w-full border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-black dark:text-white mb-2"
                  />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwords.confirmPassword}
                    onChange={(e) =>
                      setPasswords((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    placeholder="Confirm Password"
                    className="text-sm p-2 w-full border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-black dark:text-white"
                  />
                  <Button
                    variant="filled"
                    color="blue"
                    size="sm"
                    className="mt-2 dark:bg-blue-600"
                    onClick={() => handleSaveField("password")}
                  >
                    Confirm Password Change
                  </Button>
                  <Button
                    variant="filled"
                    color="red"
                    size="sm"
                    className="mt-2 dark:bg-red-600"
                    onClick={() => setEditingField(null)}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Typography
                  className="text-sm font-medium py-0 text-blue-500 dark:text-blue-400"
                  onClick={() => setEditingField("password")}
                >
                  Change Password
                </Typography>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccountSetting;
