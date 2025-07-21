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
  const [archivedVehicleRequests, setArchivedVehicleRequests] = useState([]);

  // Fetch job requests from the database
  useEffect(() => {
    fetchVehicleRequests();
    fetchArchivedVehicleRequests();
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

  const fetchArchivedVehicleRequests = async () => {
    try {
      const { data } = await axios({
        method: "get",
        url: "/vehicle_request/archived",
        withCredentials: true,
      });
      setArchivedVehicleRequests(data);
    } catch (error) {
      console.error("Error fetching job requests:", error);
     }
  };

  return (
    <VehicleRequestsContext.Provider
      value={{
        vehicleRequests,
        fetchVehicleRequests,
        setVehicleRequests,
        archivedVehicleRequests,
        setArchivedVehicleRequests,
        fetchArchivedVehicleRequests,
      }}
    >
      {children}
    </VehicleRequestsContext.Provider>
  );
};
