import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const VenueContext = createContext();

export const VenueProvider = ({ children }) => {
  const [venues, setVenues] = useState([]);
  const [venueUnavailability, setVenueUnavailability] = useState([]);
  const [venueBookings, setVenueBookings] = useState([]); // ← NEW
  const [loading, setLoading] = useState(false);

  // Fetch on mount
  useEffect(() => {
    fetchVenues();
    fetchVenueUnavailability();
    fetchVenueBookings();
  }, []);

  // Fetch all venues
  const fetchVenues = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/venues`, {
        withCredentials: true,
      });
      setVenues(data || []);
    } catch (error) {
      console.error("Error fetching venues:", error);
      setVenues([]);
    } finally {
      setLoading(false);
    }
  };

  // Create venue
  const createVenue = async (venueData) => {
    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/venues`,
        venueData,
        { withCredentials: true }
      );
      await fetchVenues();
      return data;
    } catch (error) {
      console.error("Error creating venue:", error);
      throw error;
    }
  };

  // Update venue
  const updateVenue = async (referenceNumber, venueData) => {
    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/venues/${referenceNumber}`,
        venueData,
        { withCredentials: true }
      );
      await fetchVenues();
      return data;
    } catch (error) {
      console.error("Error updating venue:", error);
      throw error;
    }
  };

  // Delete/Archive venue
  const deleteVenue = async (referenceNumber) => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/venues/${referenceNumber}`,
        { withCredentials: true }
      );
      await fetchVenues();
    } catch (error) {
      console.error("Error deleting venue:", error);
      throw error;
    }
  };

  // ================================
  // UNVAILABILITY
  // ================================

  const fetchVenueUnavailability = async (venueId = null) => {
    try {
      setLoading(true);
      const url = venueId
        ? `${process.env.REACT_APP_API_URL}/venues/unavailability/venue/${venueId}`
        : `${process.env.REACT_APP_API_URL}/venues/unavailability`;
      const { data } = await axios.get(url, { withCredentials: true });

      const records = data || [];
      setVenueUnavailability(records);
      return records; // ← Important: return data!
    } catch (error) {
      console.error("Error fetching venue unavailability:", error);
      setVenueUnavailability([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createVenueUnavailability = async (unavailabilityData) => {
    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/venues/unavailability`,
        unavailabilityData,
        { withCredentials: true }
      );
      await fetchVenueUnavailability(unavailabilityData.venue_id);
      return data;
    } catch (error) {
      console.error("Error creating venue unavailability:", error);
      throw error;
    }
  };

  const deleteVenueUnavailability = async (unavailabilityId, venueId = null) => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/venues/unavailability/${unavailabilityId}`,
        { withCredentials: true }
      );
      if (venueId) {
        await fetchVenueUnavailability(venueId);
      } else {
        await fetchVenueUnavailability();
      }
    } catch (error) {
      console.error("Error deleting venue unavailability:", error);
      throw error;
    }
  };

  // ================================
  // BOOKINGS - NEW SECTION
  // ================================

  const fetchVenueBookings = async (venueId = null) => {
    try {
      setLoading(true);
      const url = venueId
        ? `${process.env.REACT_APP_API_URL}/venues/bookings/venue/${venueId}`
        : `${process.env.REACT_APP_API_URL}/venues/bookings`;
      const { data } = await axios.get(url, { withCredentials: true });

      const records = data || [];
      setVenueBookings(records);
      return records;
    } catch (error) {
      console.error("Error fetching venue bookings:", error);
      setVenueBookings([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createVenueBooking = async (bookingData) => {
    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/venues/bookings`,
        bookingData,
        { withCredentials: true }
      );
      await fetchVenueBookings(bookingData.venue_id);
      return data;
    } catch (error) {
      console.error("Error creating venue booking:", error);
      throw error;
    }
  };

  const updateVenueBooking = async (bookingId, bookingData) => {
    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/venues/bookings/${bookingId}`,
        bookingData,
        { withCredentials: true }
      );
      if (bookingData.venue_id) {
        await fetchVenueBookings(bookingData.venue_id);
      }
      return data;
    } catch (error) {
      console.error("Error updating venue booking:", error);
      throw error;
    }
  };

  const deleteVenueBooking = async (bookingId, venueId = null) => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/venues/bookings/${bookingId}`,
        { withCredentials: true }
      );
      if (venueId) {
        await fetchVenueBookings(venueId);
      }
      return { success: true };
    } catch (error) {
      console.error("Error deleting venue booking:", error);
      throw error;
    }
  };

  return (
    <VenueContext.Provider
      value={{
        venues,
        loading,
        fetchVenues,
        createVenue,
        updateVenue,
        deleteVenue,

        venueUnavailability,
        fetchVenueUnavailability,
        createVenueUnavailability,
        deleteVenueUnavailability,

        venueBookings,
        fetchVenueBookings,
        createVenueBooking,
        updateVenueBooking,
        deleteVenueBooking,
      }}
    >
      {children}
    </VenueContext.Provider>
  );
};

export default VenueContext;