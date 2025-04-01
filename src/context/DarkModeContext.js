import { createContext, useContext, useEffect, useState } from "react";

const DarkModeContext = createContext();

export const DarkModeProvider = ({ children }) => {
    // Load dark mode preference from localStorage
    const storedPreference = JSON.parse(localStorage.getItem("userPreference")) || {};
    const [darkMode, setDarkMode] = useState(storedPreference.theme === "dark");

    // Function to toggle dark mode
    const toggleDarkMode = () => {
        const newTheme = darkMode ? "light" : "dark";
        setDarkMode(!darkMode);

        // Update localStorage
        const updatedPreference = { ...storedPreference, theme: newTheme };
        localStorage.setItem("userPreference", JSON.stringify(updatedPreference));

        // Apply dark mode class globally
        if (newTheme === "dark") {
        document.documentElement.classList.add("dark");
        } else {
        document.documentElement.classList.remove("dark");
        }
    };

    // Apply dark mode on initial load
    useEffect(() => {
        if (darkMode) {
        document.documentElement.classList.add("dark");
        } else {
        document.documentElement.classList.remove("dark");
        }
    }, [darkMode]);

    return (
        <DarkModeContext.Provider value={{ darkMode, toggleDarkMode }}>
        {children}
        </DarkModeContext.Provider>
    );
};

// Custom hook to use dark mode in components
export const useDarkMode = () => useContext(DarkModeContext);
