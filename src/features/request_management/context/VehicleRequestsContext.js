import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const VehicleRequestsContext = createContext();

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
        setVehicleRequests,
      }}
    >
      {children}
    </VehicleRequestsContext.Provider>
  );
};
