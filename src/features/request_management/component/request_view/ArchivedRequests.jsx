import {
  CardHeader,
  Typography,
  Button,
  CardBody,
  Chip,
  MenuList,
  MenuHandler,
  Menu,
} from "@material-tailwind/react";

import { ArrowClockwise, MagnifyingGlass } from "@phosphor-icons/react";
import { useContext, useEffect, useState } from "react";
import { JobRequestsContext } from "../../context/JobRequestsContext.js";
import SidebarView from "../../../../components/sidebar/SidebarView.jsx";
import { UserContext } from "../../../../context/UserContext.js";
import { getColumnConfig } from "../../utils/columnConfig.js";
import { AuthContext } from "../../../authentication/index.js";
import RequestFilter from "../../utils/requestFilter.js";
import axios from "axios";
import { PurchasingRequestsContext } from "../../context/PurchasingRequestsContext.js";
import { VehicleRequestsContext } from "../../context/VehicleRequestsContext.js";
import { VenueRequestsContext } from "../../context/VenueRequestsContext.js";
import Header from "../../../../layouts/header.js";
import ModalView from "../request_details_view/ModalView.jsx";

export function ArchivedRequests() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedReferenceNumber, setSelectedReferenceNumber] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { getUserByReferenceNumber } = useContext(UserContext);

  const [status, setStatus] = useState([]); // Stores departments from DB
  const [requestType, setRequestType] = useState("job_request"); // Default request type

  const {
    archivedJobRequests,
    fetchArchivedJobRequests,
    setArchivedJobRequests,
  } = useContext(JobRequestsContext);
  const {
    archivedPurchasingRequests,
    fetchArchivedPurchasingRequests,
    setArchivedPurchasingRequests,
  } = useContext(PurchasingRequestsContext);
  const {
    archivedVehicleRequests,
    fetchArchivedVehicleRequests,
    setArchivedVehicleRequests,
  } = useContext(VehicleRequestsContext);
  const {
    archivedVenueRequests,
    fetchArchivedVenueRequests,
    setArchivedVenueRequests,
  } = useContext(VenueRequestsContext);
  const { user } = useContext(AuthContext);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const [filters, setFilters] = useState({
    status: "",
    department: "",
  });

  const allRequests = [
    ...(Array.isArray(archivedJobRequests) ? archivedJobRequests : []),
    ...(Array.isArray(archivedPurchasingRequests)
      ? archivedPurchasingRequests
      : []),
    ...(Array.isArray(archivedVehicleRequests) ? archivedVehicleRequests : []),
    ...(Array.isArray(archivedVenueRequests) ? archivedVenueRequests : []),
  ];

  const getRequestData = () => {
    switch (requestType) {
      case "job_request":
        return {
          requests: archivedJobRequests,
          setRequests: setArchivedJobRequests,
          fetchRequests: fetchArchivedJobRequests,
        };
      case "purchasing_request":
        return {
          requests: archivedPurchasingRequests,
          setRequests: setArchivedPurchasingRequests,
          fetchRequests: fetchArchivedPurchasingRequests,
        };
      case "vehicle_request":
        return {
          requests: archivedVehicleRequests,
          setRequests: setArchivedVehicleRequests,
          fetchRequests: fetchArchivedVehicleRequests,
        };
      case "venue_request":
        return {
          requests: archivedVenueRequests,
          setRequests: setArchivedVenueRequests,
          fetchRequests: fetchArchivedVenueRequests,
        };
      default:
        return { requests: [], setRequests: () => {}, fetchRequests: () => {} };
    }
  };

  const {
    requests = [],
    setRequests = () => {},
    fetchRequests = () => {},
  } = getRequestData() || {};

  // Filter data based on search query
  const filteredRows = (Array.isArray(requests) ? requests : []).filter(
    (row) => {
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
    }
  );

  const fetchData = async () => {
    try {
      // Fetch status list from the backend
      const { data } = await axios.get("/settings/status", {
        withCredentials: true,
      });
      if (Array.isArray(data.status)) {
        setStatus(data.status);
      } else {
        console.error("Invalid response: 'status' is not an array");
      }
    } catch (error) {
      console.error("Error fetching status:", error);
    }
  };

  // Fetch user preferences and departments on mount
  useEffect(() => {
    fetchData();
  }, []);

  const requestTypeColor = {
    job_request: "blue",
    purchasing_request: "green",
    venue_request: "purple",
    vehicle_request: "orange",
  };

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
        className="rounded-none min-h-fit pb-6"
      >
        <Header
          title={"Archived Requests"}
          description={"See information about archived requests"}
        />
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between px-3 gap-4 mt-2 w-full">
          {/* Search Bar */}
          <div className="relative w-full max-w-[230px] min-w-[150px]">
            <input
              className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md pl-3 pr-28 py-2 focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
            />
            <span className="absolute top-1 right-1 flex items-center rounded py-1.5 px-3 text-black shadow-sm hover:shadow">
              <MagnifyingGlass size={16} />
            </span>
          </div>

          {/* Filter & Menus */}
          <div className="flex flex-col  lg:flex-row lg:justify-end lg:items-center gap-2 w-full">
            <div className="w-full">
              <RequestFilter filters={filters} onFilterChange={setFilters} />
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2 max-w-[230px] w-full">
              <span className="text-xs font-semibold whitespace-nowrap text-gray-700 text-center sm:text-left">
                GROUP BY
              </span>

              {/* Request Type Menu */}

              <Menu placement="bottom-end">
                <MenuHandler>
                  <div className="cursor-pointer w-fit">
                    <Chip
                      value={requestType
                        .replace("_", " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                      variant="filled"
                      color={requestTypeColor[requestType] || "gray"}
                      className="pointer-events-none" // Prevent Chip's default click
                    />
                  </div>
                </MenuHandler>

                <MenuList className="flex flex-col flex-wrap gap-2 px-3 py-2">
                  <Chip
                    value="Job Requests"
                    onClick={() => setRequestType("job_request")}
                    variant={requestType === "job_request" ? "filled" : "ghost"}
                    color={requestType === "job_request" ? "blue" : "gray"}
                    className="cursor-pointer w-fit"
                  />
                  <Chip
                    value="Purchasing Requests"
                    onClick={() => setRequestType("purchasing_request")}
                    variant={
                      requestType === "purchasing_request" ? "filled" : "ghost"
                    }
                    color={
                      requestType === "purchasing_request" ? "green" : "gray"
                    }
                    className="cursor-pointer w-fit"
                  />
                  <Chip
                    value="Vehicle Requests"
                    onClick={() => setRequestType("vehicle_request")}
                    variant={
                      requestType === "vehicle_request" ? "filled" : "ghost"
                    }
                    color={requestType === "vehicle_request" ? "amber" : "gray"}
                    className="cursor-pointer w-fit"
                  />
                  <Chip
                    value="Venue Requests"
                    onClick={() => setRequestType("venue_request")}
                    variant={
                      requestType === "venue_request" ? "filled" : "ghost"
                    }
                    color={requestType === "venue_request" ? "purple" : "gray"}
                    className="cursor-pointer w-fit"
                  />
                </MenuList>
              </Menu>
            </div>
          </div>
        </div>
      </CardHeader>
      <div className="flex justify-between h-full bg-white">
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

          {/* Sidebar for Request Details */}
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
    </div>
  );
}

export default ArchivedRequests;
