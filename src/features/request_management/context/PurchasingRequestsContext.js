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
  const [archivedPurchasingRequests, setArchivedPurchasingRequests] = useState(
    []
  );

  // Fetch job requests from the database
  useEffect(() => {
    fetchPurchasingRequests();
    fetchArchivedPurchasingRequests();
  }, []);

  const fetchPurchasingRequests = async () => {
    try {
      const { data } = await axios({
        method: "get",
        url: `${process.env.REACT_APP_API_URL}/purchasing_request/`,
        withCredentials: true,
      });
      setPurchasingRequests(data);
    } catch (error) {
      console.error("Error fetching job requests:", error);
    }
  };

  const fetchArchivedPurchasingRequests = async () => {
    try {
      const { data } = await axios({
        method: "get",
        url: `${process.env.REACT_APP_API_URL}/purchasing_request/archived`,
        withCredentials: true,
      });
      setArchivedPurchasingRequests(data);
    } catch (error) {
      console.error("Error fetching job requests:", error);
    }
  };

  return (
    <PurchasingRequestsContext.Provider
      value={{
        purchasingRequests,
        fetchPurchasingRequests,
        setPurchasingRequests,
        archivedPurchasingRequests,
        fetchArchivedPurchasingRequests,
        setArchivedPurchasingRequests,
      }}
    >
      {children}
    </PurchasingRequestsContext.Provider>
  );
};
