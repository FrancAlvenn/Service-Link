import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState( JSON.parse(localStorage.getItem("user")) || null);
  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem("isAuthenticated") === "true");

    // On initial load, check if authentication data is available in localStorage
    useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const storedAuthStatus = localStorage.getItem('isAuthenticated') === 'true';

    if (storedAuthStatus) {
        setUser(storedUser);
        setIsAuthenticated(true);
    }
    }, []);


  const setAuthData = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("isAuthenticated", true);
  };

  const clearAuthData = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, setAuthData, clearAuthData }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
