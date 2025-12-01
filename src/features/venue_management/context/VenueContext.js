import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const VenueContext = createContext();

/**
 * The VenueProvider component is a context provider that provides
 * the following values to its children components:
 *
 *   - venues: an array of venue records
 *   - fetchVenues: a function that fetches venues from the server
 *   - createVenue: a function to create a new venue
 *   - updateVenue: a function to update an existing venue
 *   - deleteVenue: a function to delete/archive a venue
 *   - venueUnavailability: an array of unavailability records
 *   - fetchVenueUnavailability: a function to fetch unavailability records
 *   - createVenueUnavailability: a function to create unavailability
 *   - deleteVenueUnavailability: a function to delete unavailability
 *
 * The component fetches venues from the server when mounted and
 * makes them available to its children components.
 *
 * @param {{ children: React.ReactNode }} props
 * @returns {React.ReactElement}
 */
export const VenueProvider = ({ children }) => {
  const [venues, setVenues] = useState([]);
  const [venueUnavailability, setVenueUnavailability] = useState([]);

  // Fetch venues from the database on mount
  useEffect(() => {
    fetchVenues();
    fetchVenueUnavailability();
  }, []);

  // Fetch all venues
  const fetchVenues = async () => {
    try {
      const { data } = await axios({
        method: "get",
        url: `${process.env.REACT_APP_API_URL}/venues`,
        withCredentials: true,
      });
      setVenues(data);
    } catch (error) {
      console.error("Error fetching venues:", error);
    }
  };

  // Create a new venue
  const createVenue = async (newVenue) => {
    try {
      const { data } = await axios({
        method: "post",
        url: `${process.env.REACT_APP_API_URL}/venues/`,
        data: newVenue,
        withCredentials: true,
      });
      setVenues((prevVenues) => [...prevVenues, data.newVenue]);
      return data;
    } catch (error) {
      console.error("Error creating venue:", error);
      throw error;
    }
  };

  // Update an existing venue
  const updateVenue = async (referenceNumber, updatedVenue) => {
    try {
      const { data } = await axios({
        method: "put",
        url: `${process.env.REACT_APP_API_URL}/venues/${referenceNumber}`,
        data: updatedVenue,
        withCredentials: true,
      });
      setVenues((prevVenues) =>
        prevVenues.map((venue) =>
          venue.reference_number === referenceNumber
            ? { ...venue, ...updatedVenue }
            : venue
        )
      );
      return data;
    } catch (error) {
      console.error("Error updating venue:", error);
      throw error;
    }
  };

  // Delete/Archive a venue
  const deleteVenue = async (referenceNumber) => {
    try {
      await axios({
        method: "delete",
        url: `${process.env.REACT_APP_API_URL}/venues/${referenceNumber}`,
        withCredentials: true,
      });
      setVenues((prevVenues) =>
        prevVenues.filter((venue) => venue.reference_number !== referenceNumber)
      );
    } catch (error) {
      console.error("Error deleting venue:", error);
      throw error;
    }
  };

  // Fetch all venue unavailability records
  const fetchVenueUnavailability = async (venueId = null) => {
    try {
      const url = venueId
        ? `${process.env.REACT_APP_API_URL}/venues/unavailability/venue/${venueId}`
        : `${process.env.REACT_APP_API_URL}/venues/unavailability`;
      const { data } = await axios({
        method: "get",
        url,
        withCredentials: true,
      });
      setVenueUnavailability(data);
      return data;
    } catch (error) {
      console.error("Error fetching venue unavailability:", error);
      return [];
    }
  };

  // Create a new venue unavailability
  const createVenueUnavailability = async (unavailabilityData) => {
    try {
      const { data } = await axios({
        method: "post",
        url: `${process.env.REACT_APP_API_URL}/venues/unavailability`,
        data: unavailabilityData,
        withCredentials: true,
      });
      await fetchVenueUnavailability();
      return data;
    } catch (error) {
      console.error("Error creating venue unavailability:", error);
      throw error;
    }
  };

  // Delete venue unavailability
  const deleteVenueUnavailability = async (unavailabilityId) => {
    try {
      await axios({
        method: "delete",
        url: `${process.env.REACT_APP_API_URL}/venues/unavailability/${unavailabilityId}`,
        withCredentials: true,
      });
      setVenueUnavailability((prev) =>
        prev.filter((item) => item.unavailability_id !== unavailabilityId)
      );
    } catch (error) {
      console.error("Error deleting venue unavailability:", error);
      throw error;
    }
  };

  return (
    <VenueContext.Provider
      value={{
        venues,
        fetchVenues,
        createVenue,
        updateVenue,
        deleteVenue,
        venueUnavailability,
        fetchVenueUnavailability,
        createVenueUnavailability,
        deleteVenueUnavailability,
      }}
    >
      {children}
    </VenueContext.Provider>
  );
};

export default VenueContext;

