import { Switch, Typography } from "@material-tailwind/react";
import { ArrowLeft } from "@phosphor-icons/react";
import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../../features/authentication";

// Utility function to normalize various forms of truthy/falsy values to boolean
const normalizeBoolean = (value) => {
  return value === true || value === "true" || value === 1 || value === "1";
};

function ThemeSetting({ onClose }) {
  const { user } = useContext(AuthContext);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const fetchThemePreference = async () => {
      try {
        const userPreferences = JSON.parse(
          localStorage.getItem("userPreference")
        );

        if (userPreferences?.theme !== undefined) {
          const isDark = normalizeBoolean(userPreferences.theme);
          setDarkMode(isDark);
        } else {
          const { data } = await axios.get(
            `/settings/user_preference/${user.reference_number}`,
            { withCredentials: true }
          );
          if (data?.theme !== undefined) {
            const isDark = normalizeBoolean(data.theme);
            setDarkMode(isDark);
            localStorage.setItem(
              "userPreference",
              JSON.stringify({
                ...data,
                theme: isDark,
              })
            );
          }
        }
      } catch (error) {
        console.error("Error fetching theme preference:", error);
      }
    };

    fetchThemePreference();
  }, [user.reference_number]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const updateThemePreference = async () => {
    const newTheme = !darkMode;
    setDarkMode(newTheme);

    try {
      await axios.put(
        `/settings/user_preference/${user.reference_number}`,
        { theme: newTheme },
        { withCredentials: true }
      );

      const existingPrefs = JSON.parse(
        localStorage.getItem("userPreference") || "{}"
      );
      localStorage.setItem(
        "userPreference",
        JSON.stringify({
          ...existingPrefs,
          theme: newTheme,
        })
      );
    } catch (error) {
      console.error("Failed to update theme preference:", error);
    }
  };

  return (
    <div className="fixed top-0 right-0 w-full max-w-[750px] h-full bg-white dark:bg-gray-900 dark:text-gray-100 z-100 p-6 overflow-y-auto">
      <div className="flex flex-col justify-between items-start mb-6 w-full gap-4">
        {/* Header */}
        <div className="flex items-center justify-between w-full">
          <div
            className="p-2 rounded-md bg-gray-500 dark:bg-gray-700 cursor-pointer"
            onClick={onClose}
          >
            <ArrowLeft size={24} color="white" />
          </div>
        </div>

        {/* Theme Toggle */}
        <div className="flex flex-col gap-3 pt-2 pb-2 px-5 border border-gray-300 dark:border-gray-700 rounded-lg w-full">
          <div className="flex items-center justify-between w-full py-3">
            <Typography className="text-sm font-medium text-gray-900 dark:text-gray-100 py-0">
              Dark Mode
            </Typography>
            <Switch
              color="blue"
              checked={darkMode}
              onChange={updateThemePreference}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ThemeSetting;
