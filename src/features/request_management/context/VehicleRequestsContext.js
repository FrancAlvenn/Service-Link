import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const VehicleRequestsContext = createContext();

/**
 * Provider that fetches vehicle requests from the API and makes them available
 * through the context. The fetched vehicle requests are stored in the state
 * and provided to the wrapped components.
 * @param {{children: React.ReactNode}} props
 * @returns {React.ReactElement}
 */
export const VehicleRequestsProvider = ({ children }) => {
  const [vehicleRequests, setVehicleRequests] = useState([]);

  // Fetch job requests from the database
  useEffect(() => {
    fetchVehicleRequests();
  }, []);

  const fetchVehicleRequests = async () => {
    try {
      const { data } = await axios({
        method: "get",
        url: "/vehicle_request/",
        withCredentials: true,
      });
      setVehicleRequests(data);
    } catch (error) {
      console.error("Error fetching job requests:", error);
    }
  };


  return (
    <VehicleRequestsContext.Provider
      value={{
        vehicleRequests,
        fetchVehicleRequests,
        setVehicleRequests
      }}
    >
      {children}
    </VehicleRequestsContext.Provider>
  );
};
