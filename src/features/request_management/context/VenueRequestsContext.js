import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const VenueRequestsContext = createContext();

/**
 * The VenueRequestsProvider component is a context provider that wraps
 * the application with the VenueRequestsContext. It fetches venue requests
 * from the database and stores them in the context, allowing other
 * components to access the requests without having to fetch them again.
 *
 * @param {{ children: React.ReactNode }} props The props object
 * @param {React.ReactNode} props.children The child components of the provider
 */
export const VenueRequestsProvider = ({ children }) => {
  const [venueRequests, setVenueRequests] = useState([]);
  const [archivedVenueRequests, setArchivedVenueRequests] = useState([]);

  // Fetch job requests from the database
  useEffect(() => {
    fetchVenueRequests();
    fetchArchivedVenueRequests();
  }, []);

  const fetchVenueRequests = async () => {
    try {
      const { data } = await axios({
        method: "get",
        url: `${process.env.REACT_APP_API_URL}/venue_request/`,
        withCredentials: true,
      });
      setVenueRequests(data);
    } catch (error) {
      console.error("Error fetching job requests:", error);
    }
  };

  const fetchArchivedVenueRequests = async () => {
    try {
      const { data } = await axios({
        method: "get",
        url: `${process.env.REACT_APP_API_URL}/venue_request/archived`,
        withCredentials: true,
      });
      setArchivedVenueRequests(data);
    } catch (error) {
      console.error("Error fetching job requests:", error);
    }
  };

  return (
    <VenueRequestsContext.Provider
      value={{
        venueRequests,
        fetchVenueRequests,
        setVenueRequests,
        archivedVenueRequests,
        fetchArchivedVenueRequests,
        setArchivedVenueRequests,
      }}
    >
      {children}
    </VenueRequestsContext.Provider>
  );
};
