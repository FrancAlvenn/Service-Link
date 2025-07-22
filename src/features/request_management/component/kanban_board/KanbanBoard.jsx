import React, { useContext, useEffect, useState } from "react";
import { DragDropContext } from "react-beautiful-dnd";
import Column from "./Column";
import {
  CardBody,
  CardHeader,
  Typography,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  Input,
  DialogFooter,
  Chip,
} from "@material-tailwind/react";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { JobRequestsContext } from "../../context/JobRequestsContext";
import { VenueRequestsContext } from "../../context/VenueRequestsContext";
import { VehicleRequestsContext } from "../../context/VehicleRequestsContext";
import { PurchasingRequestsContext } from "../../context/PurchasingRequestsContext";
import axios from "axios";
import { AuthContext } from "../../../authentication";
import ToastNotification from "../../../../utils/ToastNotification";
import SidebarView from "../../../../components/sidebar/SidebarView";
import RequestFilter from "../../utils/requestFilter";
import Header from "../../../../layouts/header";
import ModalView from "../request_details_view/ModalView";

export function KanbanBoard() {
  const [columns, setColumns] = useState([]);
  const [status, setStatus] = useState([]); // Stores departments from DB
  const [requestType, setRequestType] = useState("job_request"); // Default request type
  const [searchQuery, setSearchQuery] = useState("");

  const { jobRequests, fetchJobRequests, setJobRequests } =
    useContext(JobRequestsContext);
  const { purchasingRequests, fetchPurchasingRequests, setPurchasingRequests } =
    useContext(PurchasingRequestsContext);
  const { vehicleRequests, fetchVehicleRequests, setVehicleRequests } =
    useContext(VehicleRequestsContext);
  const { venueRequests, fetchVenueRequests, setVenueRequests } =
    useContext(VenueRequestsContext);
  const { user } = useContext(AuthContext);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedReferenceNumber, setSelectedReferenceNumber] = useState("");

  const [openModal, setOpenModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [actionTaken, setActionTaken] = useState("");

  const [filters, setFilters] = useState({
    status: "",
    department: "",
  });

  const fetchData = async () => {
    try {
      // Retrieve user preferences
      const userPreferences = JSON.parse(
        localStorage.getItem("userPreference")
      );
      if (userPreferences?.kanban_config) {
        setColumns(userPreferences.kanban_config.columns);
      }

      // Fetch status list from the backend
      const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/settings/status`, {
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

  const getRequestData = () => {
    switch (requestType) {
      case "job_request":
        return {
          requests: jobRequests,
          setRequests: setJobRequests,
          fetchRequests: fetchJobRequests,
        };
      case "purchasing_request":
        return {
          requests: purchasingRequests,
          setRequests: setPurchasingRequests,
          fetchRequests: fetchPurchasingRequests,
        };
      case "vehicle_request":
        return {
          requests: vehicleRequests,
          setRequests: setVehicleRequests,
          fetchRequests: fetchVehicleRequests,
        };
      case "venue_request":
        return {
          requests: venueRequests,
          setRequests: setVenueRequests,
          fetchRequests: fetchVenueRequests,
        };
      default:
        return { requests: [], setRequests: () => {}, fetchRequests: () => {} };
    }
  };

  const { requests, setRequests, fetchRequests } = getRequestData();

  const handleStatusChange = async (referenceNumber, status) => {
    try {
      const response = await axios.patch(
        `${process.env.REACT_APP_API_URL}/${requestType}/${referenceNumber}/status`,
        { requester: user.reference_number, status },
        { withCredentials: true }
      );
      if (response.status === 200) {
        fetchRequests();
      }
    } catch (error) {
      console.error("Status update failed:", error);
    }
  };

  const confirmStatusChange = async () => {
    try {
      await axios.patch(
        `${process.env.REACT_APP_API_URL}/${requestType}/${selectedReferenceNumber}/status`,
        { requester: user.reference_number, status: selectedStatus },
        { withCredentials: true }
      );

      // Log the request activity
      await axios.post(
        `${process.env.REACT_APP_API_URL}/request_activity`,
        {
          reference_number: selectedReferenceNumber,
          visibility: "external",
          type: "status_change",
          action: `Status updated to <i>${selectedStatus}</i>`,
          details: actionTaken,
          performed_by: user.reference_number,
        },
        { withCredentials: true }
      );

      // Refresh request data
      getRequestData().fetchRequests();
      ToastNotification.success(
        "Success!",
        "Status updated and activity logged."
      );
    } catch (error) {
      console.error("Error during status change:", error);
      ToastNotification.error("Error", "Failed to update status.");
    } finally {
      setOpenModal(false);
      setActionTaken("");
      setSelectedReferenceNumber("");
      setSelectedStatus("");
    }
  };

  const handleOnDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    if (!destination || source.droppableId === destination.droppableId) return;

    setSelectedReferenceNumber(draggableId.toString());
    setSelectedStatus(destination.droppableId);
    setOpenModal(true);
  };

  const filteredTasks = (tasks) => {
    return tasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery) ||
        task.reference_number.toLowerCase().includes(searchQuery);

      const matchesStatus = filters.status
        ? task.status === filters.status
        : true;

      const matchesDepartment = filters.department
        ? task.department
            ?.toLowerCase()
            .includes(filters.department.toLowerCase())
        : true;

      const matchesPriority =
        !filters.priority || task.priority === filters.priority;

      return (
        matchesSearch && matchesStatus && matchesDepartment && matchesPriority
      );
    });
  };

  const addColumn = async (status) => {
    if (!status) return;

    if (columns.some((column) => column.name === status)) {
      ToastNotification.info("Notice!", "Column already exists");
      return;
    }

    const newColumn = { id: columns.length + 1, name: status };
    const updatedColumns = [...columns, newColumn];

    try {
      await axios({
        method: "put",
        url: `${process.env.REACT_APP_API_URL}/settings/user_preference/${user.reference_number}`,
        data: {
          kanban_config: { columns: updatedColumns },
        },
        withCredentials: true,
      });
      setColumns(updatedColumns);
      localStorage.setItem(
        "userPreference",
        JSON.stringify({ kanban_config: { columns: updatedColumns } })
      );
      fetchData();
    } catch (error) {
      console.error("Failed to add column:", error);
    }
  };

  const requestTypeColor = {
    job_request: "blue",
    purchasing_request: "green",
    venue_request: "purple",
    vehicle_request: "orange",
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <CardHeader
        floated={false}
        shadow={false}
        className="rounded-none min-h-fit pb-2"
      >
        <Header title={"Kanban Board"} />

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
            <div className="flex lg:flex-row lg:justify-end items-center gap-2 w-fit">
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

              <Menu placement="bottom-end">
                <MenuHandler>
                  <div className="cursor-pointer w-fit">
                    <Chip
                      value="Add Column"
                      variant="ghost"
                      color="gray"
                      className="pointer-events-none"
                    />
                  </div>
                </MenuHandler>

                <MenuList className="flex flex-col flex-wrap gap-2 px-3 py-2">
                  {status.map((stat) => (
                    <Chip
                      key={stat.id}
                      value={stat.status}
                      onClick={() => addColumn(stat.status)}
                      variant="ghost"
                      color={stat.color || "gray"}
                      className="cursor-pointer w-fit"
                    />
                  ))}
                </MenuList>
              </Menu>
            </div>
          </div>
        </div>
      </CardHeader>

      <div className="flex justify-between h-full bg-white">
        <div
          className={`h-full bg-white rounded-lg w-full mt-0 p-1 flex justify-between transition-[max-width] duration-300 ${
            sidebarOpen ? "max-w-[55%]" : "w-full"
          }`}
        >
          <div className="flex flex-col gap-2 h-full w-full">
            <CardBody className="custom-scrollbar h-full pt-0">
              <DragDropContext onDragEnd={handleOnDragEnd}>
                <div className="flex justify-between items-center flex-row gap-3">
                  {columns.map((column) => (
                    <Column
                      key={column.name}
                      title={column.name}
                      tasks={filteredTasks(
                        (Array.isArray(requests) ? requests : []).filter(
                          (task) => task.status === column.name
                        )
                      )}
                      id={column.name}
                      columnID={column.id}
                      requestType={requestType}
                      setRequests={setRequests}
                      user={user}
                      columns={columns}
                      setColumns={setColumns}
                      fetchData={fetchData}
                      setSelectedReferenceNumber={setSelectedReferenceNumber}
                      setSidebarOpen={setSidebarOpen}
                    />
                  ))}
                </div>
              </DragDropContext>
            </CardBody>
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
        <Dialog
          open={openModal}
          handler={setOpenModal}
          size="sm"
          className="backdrop:bg-transparent"
        >
          <DialogHeader>Confirm Status Change</DialogHeader>
          <DialogBody>
            <div className="flex flex-col gap-4">
              <Typography variant="small" className="font-sans">
                You selected <strong>{selectedStatus}</strong>. Please enter the
                action taken before proceeding.
              </Typography>
              <Input
                type="text"
                placeholder="Action Taken"
                value={actionTaken}
                onChange={(e) => setActionTaken(e.target.value)}
              />
            </div>
          </DialogBody>
          <DialogFooter>
            <Button
              color="gray"
              onClick={() => setOpenModal(false)}
              className="mr-2 bg-gray-500 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmStatusChange}
              disabled={!actionTaken.trim()}
              className="bg-blue-500 cursor-pointer"
            >
              Confirm
            </Button>
          </DialogFooter>
        </Dialog>
      </div>
    </div>
  );
}

export default KanbanBoard;
