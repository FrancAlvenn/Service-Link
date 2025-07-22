import { UserCircle } from "@phosphor-icons/react";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { Button, Input } from "@material-tailwind/react";
import { AuthContext } from "../../authentication";
import { UserContext } from "../../../context/UserContext";
import ToastNotification from "../../../utils/ToastNotification";
import { formatDate } from "../../../utils/dateFormatter";

const TicketSidebar = ({ open, onClose, ticketId, tickets, fetchTickets, deleteTicket }) => {
  const [isOpen, setIsOpen] = useState(open);
  const { user } = useContext(AuthContext);
  const { getUserByReferenceNumber } = useContext(UserContext);

  const [ticket, setTicket] = useState(null);
  const [editedFields, setEditedFields] = useState({});
  const [editingField, setEditingField] = useState(null);

  const ticketFieldConfig = [
    { key: "ticket_id", label: "Ticket ID", type: "text", readOnly: true },
    { key: "title", label: "Title", type: "text" },
    { key: "description", label: "Description", type: "textarea" },
    { key: "status", label: "Status", type: "text" },
    { key: "priority", label: "Priority", type: "text" },
    { key: "assigned_to", label: "Assigned To", type: "text" },
    { key: "createdAt", label: "Created At", type: "date", readOnly: true },
    { key: "updatedAt", label: "Updated At", type: "date", readOnly: true },
  ];

  useEffect(() => {
    if (isOpen && ticketId) {
      const foundTicket = tickets.find((ticket) => ticket.ticket_id === ticketId);
      setTicket(foundTicket);
    }
  }, [tickets, ticketId, isOpen]);

  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  const handleClose = () => {
    setTicket(null);
    setEditedFields({});
    setIsOpen(false);
    if (onClose) onClose();
  };

  const handleSidebarClick = (e) => e.stopPropagation();

  const handleFieldChange = (field, value) => {
    setEditedFields((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (field) => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/tickets/${ticket.ticket_id}`,
        {
          ...ticket,
          [field]: editedFields[field],
          requester: user.reference_number,
        },
        { withCredentials: true }
      );
      fetchTickets();
      ToastNotification.success("Success", `${field} updated successfully.`);
    } catch (error) {
      console.error("Update failed:", error);
      ToastNotification.error("Error", `Failed to update ${field}.`);
    } finally {
      setEditingField(null);
      setEditedFields((prev) => {
        const newFields = { ...prev };
        delete newFields[field];
        return newFields;
      });
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/tickets/${ticket.ticket_id}`, { withCredentials: true });
      fetchTickets();
      ToastNotification.success("Success", "Ticket deleted successfully.");
    } catch (error) {
      console.error("Delete failed:", error);
      ToastNotification.error("Error", `Failed to delete ticket.`);
    } finally {
      handleClose();
    }
  };

  const handleKeyDown = (e, field) => {
    if (e.key === "Enter") handleSave(field);
    if (e.key === "Escape") setEditingField(null);
  };

  const renderFieldValue = (field, value) => {
    if (field.type === "date" && value) return formatDate(value);
    if (!value && !field.readOnly) return <span className="text-gray-500">Click to edit</span>;
    return value || "N/A";
  };

  return (
    <>
      {/* Sidebar Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={handleClose}
      ></div>

      {/* Sidebar Container */}
      <div
        onClick={handleSidebarClick}
        className={`fixed top-0 right-0 z-50 w-[650px] h-full p-5 bg-white transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {ticket ? (
          <div className="flex flex-col overflow-y-auto h-full">
            {/* Ticket Title (Editable) */}
            <h2 className="text-xl font-bold mb-4">
              {editingField === "title" ? (
                <input
                  type="text"
                  className="border w-full border-gray-300 rounded-md p-2 text-xl font-bold"
                  value={editedFields.title ?? ticket.title}
                  onChange={(e) => handleFieldChange("title", e.target.value)}
                  onBlur={() => handleSave("title")}
                  onKeyDown={(e) => handleKeyDown(e, "title")}
                  autoFocus
                />
              ) : (
                <p onClick={() => setEditingField("title")} className="cursor-pointer">
                  {ticket.title || "Click to edit"}
                </p>
              )}
            </h2>

            {/* Ticket Details */}
            <div className="flex flex-col p-3 gap-2 border-gray-400 border rounded-md">
              {ticketFieldConfig.map((field) => {
                if (field.key === "title") return null;
                const value = ticket[field.key];

                return (
                  <div key={field.key} className="mb-3 flex justify-between items-center">
                    <p className="text-sm font-semibold capitalize">{field.label}</p>

                    {field.readOnly ? (
                      <p className="text-sm w-[60%] truncate">{renderFieldValue(field, value)}</p>
                    ) : editingField === field.key ? (
                      <input
                        type={field.type === "date" ? "date" : "text"}
                        className="text-sm p-2 border border-gray-300 rounded-md w-[60%]"
                        value={editedFields[field.key] ?? value}
                        onChange={(e) => handleFieldChange(field.key, e.target.value)}
                        onBlur={() => handleSave(field.key)}
                        onKeyDown={(e) => handleKeyDown(e, field.key)}
                        autoFocus
                      />
                    ) : (
                      <p
                        onClick={() => setEditingField(field.key)}
                        className="text-sm cursor-pointer w-[60%] truncate"
                      >
                        {renderFieldValue(field, value)}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <Button color="red" onClick={() => deleteTicket(ticket.ticket_id)} className="w-full min-h-[40px] max-w-[160px] mt-3">
              Delete Ticket
            </Button>
          </div>
        ) : (
          <div className="flex justify-center items-center h-full text-xl text-gray-600">
            No ticket found.
          </div>
        )}
      </div>
    </>
  );
};

export default TicketSidebar;
