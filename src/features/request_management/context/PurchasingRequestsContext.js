import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const PurchasingRequestsContext = createContext();

/**
 * The PurchasingRequestsProvider component is a context provider that wraps
 * the application with the JobRequestsContext. It fetches the purchasing
 * requests from the database and stores them in the context, allowing other
 * components to access the requests without having to fetch them again.
 *
 * @param {{ children: React.ReactNode }} props The props object
 * @param {React.ReactNode} props.children The child components of the provider
 */

export const PurchasingRequestsProvider = ({ children }) => {
  const [purchasingRequests, setPurchasingRequests] = useState([]);

  // Fetch job requests from the database
  useEffect(() => {
    fetchPurchasingRequests();
  }, []);

  const fetchPurchasingRequests = async () => {
    try {
      const { data } = await axios({
        method: "get",
        url: "/purchasing_request/",
        withCredentials: true,
      });
      setPurchasingRequests(data);
    } catch (error) {
      console.error("Error fetching job requests:", error);
    }
  };


  return (
    <PurchasingRequestsContext.Provider
      value={{
        purchasingRequests,
        setPurchasingRequests,
      }}
    >
      {children}
    </PurchasingRequestsContext.Provider>
  );
};
