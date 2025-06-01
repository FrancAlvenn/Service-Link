import {
  Card,
  CardHeader,
  Input,
  Typography,
  Button,
  CardBody,
  Chip,
} from "@material-tailwind/react";

import { ArrowClockwise, MagnifyingGlass } from "@phosphor-icons/react";
import { useContext, useEffect, useState } from "react";
import { VenueRequestsContext } from "../../context/VenueRequestsContext.js";
import { formatDate } from "../../../../utils/dateFormatter.js";
import {
  getApprovalColor,
  getArchivedColor,
} from "../../utils/approvalColor.js";

import StatusModal from "../../../../utils/statusModal.js";
import ApprovalStatusModal from "../../../../utils/approverStatusModal.js";
import ArchiveStatusModal from "../../../../utils/archiveStatusModal.js";
import SidebarView from "../../../../components/sidebar/SidebarView.jsx";
import { UserContext } from "../../../../context/UserContext.js";
import { getColumnConfig } from "../../utils/columnConfig.js";
import RequestFilter from "../../utils/requestFilter.js";
import { useLocation } from "react-router-dom";
import Header from "../../../../layouts/header.js";
import ModalView from "../request_details_view/ModalView.jsx";

export function VenueRequests() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedReferenceNumber, setSelectedReferenceNumber] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { venueRequests, fetchVenueRequests } =
    useContext(VenueRequestsContext);
  const { getUserByReferenceNumber } = useContext(UserContext);

  function useQuery() {
    return new URLSearchParams(useLocation().search);
  }

  const query = useQuery();
  const preSelectedReference = query.get("referenceNumber");

  useEffect(() => {
    if (preSelectedReference) {
      setSelectedReferenceNumber(preSelectedReference);
      setSidebarOpen(true);
    }
  }, [preSelectedReference]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const [filters, setFilters] = useState({
    status: "",
    department: "",
  });

  // Filter data based on search query
  const filteredRows = (
    Array.isArray(venueRequests) ? venueRequests : []
  ).filter((row) => {
    const rowString = Object.entries(row)
      .filter(([key]) => key !== "details")
      .map(([_, value]) => value)
      .join(" ")
      .toLowerCase();

    const matchesSearch = rowString.includes(searchQuery.toLowerCase());

    const matchesStatus = !filters.status || row.status === filters.status;
    const matchesDepartment =
      !filters.department || row.department === filters.department;

    const matchesPriority =
      !filters.priority || row.priority === filters.priority;

    return (
      matchesSearch && matchesStatus && matchesDepartment && matchesPriority
    );
  });

  const requestType = "venue_request"; // Can be set dynamically based on the page or user input

  const columns = getColumnConfig(
    requestType,
    setSidebarOpen,
    setSelectedReferenceNumber,
    getUserByReferenceNumber
  );

  return (
    <div className="flex flex-col h-full bg-white">
      <CardHeader
        floated={false}
        shadow={false}
        className="rounded-none min-h-fit pb-1"
      >
        <Header
          title={"Venue Requests"}
          description={"See information about requests"}
        />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-3">
          <RequestFilter filters={filters} onFilterChange={setFilters} />
          <div className="relative w-full max-w-sm min-w-[200px]">
            <input
              className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md pl-3 pr-28 py-2 focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
              placeholder="Search"
              value={searchQuery}
              onChange={handleSearch}
            />
            <span className="absolute top-1 right-1 flex items-center rounded py-1.5 px-3 text-black shadow-sm hover:shadow">
              <MagnifyingGlass size={16} />
            </span>
          </div>
        </div>
      </CardHeader>
      <div className="flex justify-between h-full bg-white">
        {/* Main content with smooth transition for max-width */}
        <div
          className={`h-full bg-white w-full mt-0 px-3 flex flex-col justify-between transition-[max-width] duration-300 ${
            sidebarOpen ? "max-w-[55%]" : "w-full"
          }`}
        >
          <div className="flex flex-col gap-4 h-full">
            {/* Table Section */}
            <CardBody className="custom-scrollbar h-full pt-0">
              <table className="w-full min-w-max table-auto text-left">
                <thead className="sticky top-0 z-10 border-b border-blue-gray-100">
                  <tr>
                    {columns.map((col, index) => (
                      <th
                        key={index}
                        className="cursor-pointer bg-white p-4 transition-colors hover:bg-blue-gray-50"
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
                  {filteredRows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {columns.map((col, colIndex) => (
                        <td
                          key={colIndex}
                          className="px-4 py-5 w-fit font-normal"
                        >
                          {col.render(
                            row,
                            setSidebarOpen,
                            setSelectedReferenceNumber
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardBody>
          </div>
        </div>
      </div>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={() => setSidebarOpen(false)}
        >
          <div
            className="bg-white dark:bg-gray-900 w-full h-full lg:max-w-[80vw] lg:max-h-[90vh] overflow-y-auto rounded-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <ModalView
              open={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
              referenceNumber={selectedReferenceNumber}
              asModal={true}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default VenueRequests;
