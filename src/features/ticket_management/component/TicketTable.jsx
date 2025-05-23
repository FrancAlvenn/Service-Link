import {
    CardHeader,
    Typography,
    Button,
    CardBody,
  } from "@material-tailwind/react";
  import { ArrowClockwise, MagnifyingGlass } from "@phosphor-icons/react";
  import { useContext, useMemo, useState } from "react";
  import { getTicketColumnConfig } from "../utils/ticketColumnConfig.js";
  import { TicketContext } from "../context/TicketContext.js";
  import TicketSidebar from "./TicketSidebar.jsx";
  
  const TicketTable = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
  
    const { tickets, fetchTickets, deleteTicket } = useContext(TicketContext);
  
    // Memoize the ticket columns
    const columns = useMemo(
      () => getTicketColumnConfig({ setIsSidebarOpen, setSelectedTicket }),
      [setIsSidebarOpen, setSelectedTicket]
    );
  
    // Handle search query changes
    const handleSearch = (e) => setSearchQuery(e.target.value);
  
    // Filter tickets based on search query
    const filteredRows = useMemo(() => {
      if (!Array.isArray(tickets)) return [];
      return tickets.filter((ticket) => {
        const ticketString = Object.entries(ticket)
          .filter(([key]) => key !== "details")
          .map(([_, value]) => value)
          .join(" ")
          .toLowerCase();
        return ticketString.includes(searchQuery.toLowerCase());
      });
    }, [tickets, searchQuery]);
  
    return (
      <div className="h-full bg-white rounded-lg w-full mt-0 px-3 flex flex-col justify-between">
        <div className="flex flex-col gap-4 h-full">
          {/* Header */}
          <CardHeader floated={false} shadow={false} className="rounded-none pb-6">
            <div className="mb-1 flex items-center justify-between gap-5">
              <div>
                <Typography color="black" className="text-lg font-bold">
                  Ticket Management
                </Typography>
                <Typography color="gray" className="mt-1 font-normal text-sm">
                  View and manage support tickets.
                </Typography>
              </div>
              <Button
                className="flex items-center gap-2 bg-blue-500"
                size="sm"
                onClick={fetchTickets}
              >
                <ArrowClockwise strokeWidth={2} className="h-4 w-4" />
                Refresh
              </Button>
            </div>
  
            {/* Search Input */}
            <div className="flex items-center justify-end px-3 gap-4">
              <div className="relative w-full max-w-sm min-w-[200px]">
                <input
                  className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md pl-3 pr-28 py-2 focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                  placeholder="Search tickets"
                  value={searchQuery}
                  onChange={handleSearch}
                />
                <span className="absolute top-1 right-1 flex items-center rounded py-1.5 px-3 text-black shadow-sm hover:shadow">
                  <MagnifyingGlass size={16} />
                </span>
              </div>
            </div>
          </CardHeader>
  
          {/* Table Body */}
          <CardBody className="custom-scrollbar h-full pt-0">
            <table className="w-full min-w-max table-auto text-left">
              <thead className="sticky top-0 z-10 border-b border-blue-gray-100 bg-white">
                <tr>
                  {columns.map((col, index) => (
                    <th
                      key={index}
                      className="cursor-pointer p-4 transition-colors hover:bg-blue-gray-50"
                    >
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="leading-none opacity-70 capitalize font-semibold"
                      >
                        {col.header}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>
  
              <tbody>
                {filteredRows.length > 0 ? (
                  filteredRows.map((ticket, rowIndex) => (
                    <tr key={rowIndex}>
                      {columns.map((col, colIndex) => (
                        <td key={colIndex} className="px-4 py-5 w-fit font-normal">
                          {col.render
                            ? col.render(ticket, setIsSidebarOpen, setSelectedTicket)
                            : ticket[col.key] || "N/A"}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length} className="text-center py-4">
                      <Typography variant="small" color="gray">
                        No tickets available.
                      </Typography>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardBody>
        </div>
  
        {/* Ticket Sidebar */}
        <TicketSidebar
          open={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          referenceNumber={selectedTicket}
          ticketId={selectedTicket}
          tickets={tickets}
          fetchTickets={fetchTickets}
          deleteTicket={deleteTicket}
        />
      </div>
    );
  };
  
  export default TicketTable;
  