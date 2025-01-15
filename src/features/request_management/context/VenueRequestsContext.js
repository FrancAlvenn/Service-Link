import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const VenueRequestsContext = createContext();

export const VenueRequestsProvider = ({ children }) => {
  const [venueRequests, setVenueRequests] = useState([]);

  // Fetch job requests from the database
  useEffect(() => {
    fetchVenueRequests();
  }, []);

  const fetchVenueRequests = async () => {
    try {
      const { data } = await axios({
        method: "get",
        url: "/venue_request/",
        withCredentials: true,
      });
      setVenueRequests(data);
    } catch (error) {
      console.error("Error fetching job requests:", error);
    }
  };


  return (
    <VenueRequestsContext.Provider
      value={{
        venueRequests,
        setVenueRequests,
      }}
    >
      {children}
    </VenueRequestsContext.Provider>
  );
};
