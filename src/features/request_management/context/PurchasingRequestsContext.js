import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const PurchasingRequestsContext = createContext();

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
