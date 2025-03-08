import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext();

/**
 * The AuthProvider component is responsible for managing the authentication state
 * of the application. It holds the user data and authentication status in its
 * state, and provides methods to set and clear the authentication data. The
 * component also checks for authentication data in localStorage on initial
 * load and updates the state accordingly.
 *
 * The value of the context is an object with the following properties:
 *
 * - user: The user data, or null if the user is not authenticated.
 * - isAuthenticated: A boolean indicating whether the user is authenticated.
 * - setAuthData(userData): A function to set the user data and update the
 *   authentication status to true.
 * - clearAuthData(): A function to clear the user data and update the
 *   authentication status to false.
 *
 * The AuthProvider component expects a single child component, which is the
 * application component tree.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState( JSON.parse(localStorage.getItem("user")) || null);
  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem("isAuthenticated") === "true");
  const [userPreference, setUserPreference] = useState(localStorage.getItem("userPreference") || null);

    // On initial load, check if authentication data is available in localStorage
    useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const storedAuthStatus = localStorage.getItem('isAuthenticated') === 'true';
    const storedUserPreference = localStorage.getItem('userPreference');

    if (storedAuthStatus) {
        setUser(storedUser);
        setIsAuthenticated(true);
        setUserPreference(storedUserPreference);
    }
    }, []);


/**
 * Sets the user data and updates the authentication status to true.
 * Stores the user data and authentication status in localStorage.
 *
 * @param {object} userData - The user data to be set.
 */
  const setAuthData = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("isAuthenticated", true);
  };

/**
 * Clears the user data and updates the authentication status to false.
 * Removes the user data and authentication status from localStorage.
 */
  const clearAuthData = () => {
    setUser(null);
    setIsAuthenticated(false);
    setUserPreference(null);
    localStorage.removeItem("user");
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userPreference");
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, userPreference, setUserPreference, setAuthData, clearAuthData }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
