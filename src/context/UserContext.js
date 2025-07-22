import { createContext, useEffect, useState } from "react";
import axios from "axios";

// Create a context for user data
export const UserContext = createContext();

/**
 * The UserProvider component is a context provider that provides
 * the following values to its children components:
 *
 *   - allUserInfo: an array containing all user information
 *   - fetchUsers: a function that fetches the user data from the server
 *   - fetchUserInfo: a function that fetches user info by reference number
 *   - getUserByReferenceNumber: a function that returns the full name of a user by reference number
 *
 * The component fetches user data from the server when mounted and
 * makes them available to its children components.
 *
 * @param {{ children: React.ReactNode }} props
 * @returns {React.ReactElement}
 */
export const UserProvider = ({ children }) => {
  const [allUserInfo, setAllUserInfo] = useState(null);

  // Fetch user data from the database when the component mounts
  useEffect(() => {
    fetchUsers();
  }, []);

  // Function to fetch all user data from the server
  const fetchUsers = async () => {
    try {
      const { data } = await axios({
        method: "get",
        url: `${process.env.REACT_APP_API_URL}/users`, // This is the endpoint that retrieves the user data
        withCredentials: true,
      });
      setAllUserInfo(data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  // Fetch user info by reference number
  const fetchUserInfo = async (reference_number) => {
    try {
      const { data } = await axios({
        method: "get",
        url: `${process.env.REACT_APP_API_URL}/users/${reference_number}`, // This is the endpoint that retrieves user data by reference number
        withCredentials: true,
      });
      setAllUserInfo(data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  // Get user by reference number
  const getUserByReferenceNumber = (referenceNumber) => {
    if (!allUserInfo) return referenceNumber; // If no user info available, return the reference number

    const user = allUserInfo.find(
      (user) => user.reference_number === referenceNumber
    );
    return user ? `${user.first_name} ${user.last_name}` : referenceNumber;
  };

  //Get user email by reference number
  const getUserEmailByReferenceNumber = (referenceNumber) => {
    if (!allUserInfo) return referenceNumber; // If no user info available, return the email

    const user = allUserInfo.find(
      (user) => user.reference_number === referenceNumber
    );
    return user ? user.email : referenceNumber;
  };

  //Create user
  const createUser = async (userData) => {
    try {
      const { data } = await axios({
        method: "post",
        url: `${process.env.REACT_APP_API_URL}/users`, // This is the endpoint that creates a new user
        data: userData,
        withCredentials: true,
      });
      setAllUserInfo(data);
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  //Update user by ID
  const updateUser = async (referenceNumber, updatedData) => {
    try {
      const { data } = await axios({
        method: "put",
        url: `${process.env.REACT_APP_API_URL}/users/${referenceNumber}`, // This is the endpoint that updates user data by reference number
        data: updatedData,
        withCredentials: true,
      });
      setAllUserInfo(data);
    } catch (error) {
      console.error("Error updating user data:", error);
    }
  };

  //Archive user by ID
  const archiveUser = async (referenceNumber) => {
    try {
      const { data } = await axios({
        method: "delete",
        url: `${process.env.REACT_APP_API_URL}/users/${referenceNumber}`, // This is the endpoint that archives user data by reference number
        withCredentials: true,
      });
      setAllUserInfo(data);
    } catch (error) {
      console.error("Error archiving user data:", error);
    }
  };

  return (
    <UserContext.Provider
      value={{
        allUserInfo,
        fetchUsers,
        fetchUserInfo,
        getUserByReferenceNumber,
        getUserEmailByReferenceNumber,
        updateUser,
        archiveUser,
        createUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
