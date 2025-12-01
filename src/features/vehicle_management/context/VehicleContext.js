import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const VehicleContext = createContext();

export const VehicleProvider = ({ children }) => {
  const [vehicles, setVehicles] = useState([]);
  const [unavailabilityRecords, setUnavailabilityRecords] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

   // Fetch venues from the database on mount
  useEffect(() => {
    fetchVehicles();
    fetchVehicleUnavailability();
  }, []);

  // Fetch all vehicles
  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/vehicles`, {
        withCredentials: true,
      });
      setVehicles(response.data || []);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  // Create a new vehicle
  const createVehicle = async (vehicleData) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/vehicles`,
        vehicleData,
        { withCredentials: true }
      );
      await fetchVehicles();
      return response.data;
    } catch (error) {
      console.error("Error creating vehicle:", error);
      throw error;
    }
  };

  // Update a vehicle
  const updateVehicle = async (referenceNumber, vehicleData) => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/vehicles/${referenceNumber}`,
        vehicleData,
        { withCredentials: true }
      );
      await fetchVehicles();
      return response.data;
    } catch (error) {
      console.error("Error updating vehicle:", error);
      throw error;
    }
  };

  // Delete/Archive a vehicle
  const deleteVehicle = async (referenceNumber) => {
    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_API_URL}/vehicles/${referenceNumber}`,
        { withCredentials: true }
      );
      await fetchVehicles();
      return response.data;
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      throw error;
    }
  };

  // Fetch vehicle unavailability records
  const fetchVehicleUnavailability = async (vehicleId = null) => {
    try {
      setLoading(true);
      const url = vehicleId
        ? `${process.env.REACT_APP_API_URL}/vehicles/unavailability/vehicle/${vehicleId}`
        : `${process.env.REACT_APP_API_URL}/vehicles/unavailability`;
      const response = await axios.get(url, { withCredentials: true });

      const data = response.data || [];
      setUnavailabilityRecords(data);
      return data;
    } catch (error) {
      console.error("Error fetching vehicle unavailability:", error);
      setUnavailabilityRecords([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Create vehicle unavailability
  const createVehicleUnavailability = async (unavailabilityData) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/vehicles/unavailability`,
        unavailabilityData,
        { withCredentials: true }
      );
      await fetchVehicleUnavailability();
      return response.data;
    } catch (error) {
      console.error("Error creating vehicle unavailability:", error);
      throw error;
    }
  };

  // Update vehicle unavailability
  const updateVehicleUnavailability = async (unavailabilityId, unavailabilityData) => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/vehicles/unavailability/${unavailabilityId}`,
        unavailabilityData,
        { withCredentials: true }
      );
      if (unavailabilityData.vehicle_id) {
        await fetchVehicleUnavailability(unavailabilityData.vehicle_id);
      }
      return response.data;
    } catch (error) {
      console.error("Error updating vehicle unavailability:", error);
      throw error;
    }
  };

  // Delete vehicle unavailability
  const deleteVehicleUnavailability = async (unavailabilityId, vehicleId = null) => {
    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_API_URL}/vehicles/unavailability/${unavailabilityId}`,
        { withCredentials: true }
      );
      if (vehicleId) {
        await fetchVehicleUnavailability(vehicleId);
      }
      return response.data;
    } catch (error) {
      console.error("Error deleting vehicle unavailability:", error);
      throw error;
    }
  };

  // Fetch vehicle bookings
  const fetchVehicleBookings = async (vehicleId = null) => {
    try {
      setLoading(true);
      const url = vehicleId
        ? `${process.env.REACT_APP_API_URL}/vehicles/bookings/vehicle/${vehicleId}`
        : `${process.env.REACT_APP_API_URL}/vehicles/bookings`;
      const response = await axios.get(url, { withCredentials: true });
      const data = response.data || [];
      setBookings(data);
      return data;
    } catch (error) {
      console.error("Error fetching vehicle bookings:", error);
      setBookings([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Create vehicle booking
  const createVehicleBooking = async (bookingData) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/vehicles/bookings`,
        bookingData,
        { withCredentials: true }
      );
      await fetchVehicleBookings(bookingData.vehicle_id);
      return response.data;
    } catch (error) {
      console.error("Error creating vehicle booking:", error);
      throw error;
    }
  };

  // Update vehicle booking
  const updateVehicleBooking = async (bookingId, bookingData) => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/vehicles/bookings/${bookingId}`,
        bookingData,
        { withCredentials: true }
      );
      if (bookingData.vehicle_id) {
        await fetchVehicleBookings(bookingData.vehicle_id);
      }
      return response.data;
    } catch (error) {
      console.error("Error updating vehicle booking:", error);
      throw error;
    }
  };

  // Delete vehicle booking
  const deleteVehicleBooking = async (bookingId, vehicleId = null) => {
    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_API_URL}/vehicles/bookings/${bookingId}`,
        { withCredentials: true }
      );
      if (vehicleId) {
        await fetchVehicleBookings(vehicleId);
      }
      return response.data;
    } catch (error) {
      console.error("Error deleting vehicle booking:", error);
      throw error;
    }
  };

  return (
    <VehicleContext.Provider
      value={{
        vehicles,
        loading,
        fetchVehicles,
        createVehicle,
        updateVehicle,
        deleteVehicle,
        fetchVehicleUnavailability,
        createVehicleUnavailability,
        updateVehicleUnavailability,
        deleteVehicleUnavailability,
        fetchVehicleBookings,
        createVehicleBooking,
        updateVehicleBooking,
        deleteVehicleBooking,
      }}
    >
      {children}
    </VehicleContext.Provider>
  );
};

export default VehicleContext;

