import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const TicketContext = createContext();

/**
 * The TicketProvider component is a context provider that provides
 * the following values to its children components:
 *
 *   - tickets: an array of ticket records
 *   - fetchTickets: a function that fetches tickets from the server
 *   - createTicket: a function to create a new ticket
 *   - updateTicket: a function to update an existing ticket
 *   - deleteTicket: a function to delete a ticket
 *
 * This component fetches tickets from the server when mounted and
 * makes them available to its children components.
 *
 * @param {{ children: React.ReactNode }} props
 * @returns {React.ReactElement}
 */
export const TicketProvider = ({ children }) => {
  const [tickets, setTickets] = useState([]);

  // Fetch tickets from the database on mount
  useEffect(() => {
    fetchTickets();
  }, []);

  // Fetch all tickets
  const fetchTickets = async () => {
    try {
      const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/ticket/`, {
        withCredentials: true,
      });
      setTickets(data);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    }
  };

  // Create a new ticket
  const createTicket = async (newTicket) => {
    try {
      const { data } = await axios.post(`${process.env.REACT_APP_API_URL}/ticket/`, newTicket, {
        withCredentials: true,
      });
      setTickets((prevTickets) => [...prevTickets, data]);
    } catch (error) {
      console.error("Error creating ticket:", error);
    }
  };

  // Update an existing ticket
  const updateTicket = async (ticketId, updatedTicket) => {
    try {
      const { data } = await axios.put(`${process.env.REACT_APP_API_URL}/ticket/${ticketId}`, updatedTicket, {
        withCredentials: true,
      });
      setTickets((prevTickets) =>
        prevTickets.map((ticket) =>
          ticket.ticket_id === ticketId ? { ...ticket, ...data } : ticket
        )
      );
    } catch (error) {
      console.error("Error updating ticket:", error);
    }
  };

  // Delete a ticket
  const deleteTicket = async (ticketId) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/ticket/${ticketId}`, {
        withCredentials: true,
      });
      setTickets((prevTickets) =>
        prevTickets.filter((ticket) => ticket.ticket_id !== ticketId)
      );
    } catch (error) {
      console.error("Error deleting ticket:", error);
    }
  };

  return (
    <TicketContext.Provider
      value={{
        tickets,
        fetchTickets,
        createTicket,
        updateTicket,
        deleteTicket,
      }}
    >
      {children}
    </TicketContext.Provider>
  );
};

export default TicketContext;
