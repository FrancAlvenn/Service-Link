import React, { useContext, useState } from "react";
import { Button, Typography } from "@material-tailwind/react";
import axios from "axios";
import { AuthContext } from "../../authentication";
import ToastNotification from "../../../utils/ToastNotification";
import TicketContext from "../context/TicketContext";

const TicketForm = () => {
  const { user } = useContext(AuthContext);
  const { fetchTickets } = useContext(TicketContext);
  const [errorMessage, setErrorMessage] = useState("");

  const initialTicketState = {
    reference_number: user?.reference_number || "",
    title: "",
    description: "",
    category: "",
    priority: "Low",
    status: "Open",
    assigned_to: "",
    resolution_deadline: "",
    created_at: new Date().toISOString(),
  };

  const [ticket, setTicket] = useState(initialTicketState);

  const handleChange = (e) => {
    setTicket({ ...ticket, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setTicket(initialTicketState);
  };

  const submitTicket = async () => {
    try {
      const { status } = await axios.post("/tickets", ticket, { withCredentials: true });

      if (status === 201) {
        resetForm();
        ToastNotification.success("Success!", "Ticket created successfully.");
        fetchTickets();
      }
    } catch (error) {
      if (error.response?.status === 400) {
        setErrorMessage("Ticket creation failed. Please check your input.");
      } else {
        setErrorMessage("An unexpected error occurred. Try again later.");
      }
    }
  };

  return (
    <div className="h-full bg-white rounded-lg w-full px-3 flex flex-col justify-between">
      <div className="py-4 px-5 mb-5 shadow-sm">
        <Typography color="black" className="text-lg font-bold">
          Create Ticket
        </Typography>
        <Typography color="black" className="mt-1 font-normal text-sm">
          Fill out the details to submit a new ticket.
        </Typography>
      </div>

      <div className="flex flex-col gap-4 px-5 pb-4 overflow-y-auto">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            name="title"
            value={ticket.title}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            value={ticket.description}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
          <input
            type="text"
            name="category"
            value={ticket.category}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
          <select
            name="priority"
            value={ticket.priority}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            {["Low", "Medium", "High"].map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Assigned To</label>
          <input
            type="text"
            name="assigned_to"
            value={ticket.assigned_to}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Resolution Deadline</label>
          <input
            type="date"
            name="resolution_deadline"
            value={ticket.resolution_deadline}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>

        {errorMessage && <p className="text-red-500 text-xs">{errorMessage}</p>}

        <Button
          color="blue"
          className="w-full min-h-[40px] max-w-[160px] mt-3"
          onClick={submitTicket}
          disabled={!ticket.title || !ticket.category}
        >
          Submit Ticket
        </Button>
      </div>
    </div>
  );
};

export default TicketForm;
