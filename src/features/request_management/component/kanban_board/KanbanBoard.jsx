import React, { useContext, useEffect, useState, useRef } from "react";
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
  DialogFooter,
  Chip,
  Spinner,
} from "@material-tailwind/react";
import { MagnifyingGlass, Sparkle, ArrowClockwise } from "@phosphor-icons/react";
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
import { GoogleGenAI } from "@google/genai";

// ---------------------------------------------------------------------
// Gemini initialisation (frontend only)
// ---------------------------------------------------------------------
const genAI = new GoogleGenAI({
  apiKey: process.env.REACT_APP_GEMINI_API_KEY,
  apiVersion: "v1",
});

export function KanbanBoard() {
  const [columns, setColumns] = useState([]);
  const [status, setStatus] = useState([]);
  const [requestType, setRequestType] = useState("job_request");
  const [searchQuery, setSearchQuery] = useState("");

  const { jobRequests, fetchJobRequests, setJobRequests } = useContext(JobRequestsContext);
  const { purchasingRequests, fetchPurchasingRequests, setPurchasingRequests } = useContext(PurchasingRequestsContext);
  const { vehicleRequests, fetchVehicleRequests, setVehicleRequests } = useContext(VehicleRequestsContext);
  const { venueRequests, fetchVenueRequests, setVenueRequests } = useContext(VenueRequestsContext);
  const { user } = useContext(AuthContext);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedReferenceNumber, setSelectedReferenceNumber] = useState("");

  /* ---------- Confirmation modal state ---------- */
  const [openModal, setOpenModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedReason, setSelectedReason] = useState("");
  const [additionalComment, setAdditionalComment] = useState("");
  const [actionTaken, setActionTaken] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const textareaRef = useRef(null);

  const [filters, setFilters] = useState({ status: "", department: "" });

  /* ------------------- Fetch preferences & statuses ------------------- */
  const fetchData = async () => {
    try {
      const pref = JSON.parse(localStorage.getItem("userPreference"));
      if (pref?.kanban_config) setColumns(pref.kanban_config.columns);

      const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/settings/status`, {
        withCredentials: true,
      });
      if (Array.isArray(data.status)) setStatus(data.status);
    } catch (e) {
      console.error("Error fetching data:", e);
    }
  };
  useEffect(() => { fetchData(); }, []);

  /* ------------------- Request-type helpers ------------------- */
  const getRequestData = () => {
    switch (requestType) {
      case "job_request":
        return { requests: jobRequests, setRequests: setJobRequests, fetchRequests: fetchJobRequests };
      case "purchasing_request":
        return { requests: purchasingRequests, setRequests: setPurchasingRequests, fetchRequests: fetchPurchasingRequests };
      case "vehicle_request":
        return { requests: vehicleRequests, setRequests: setVehicleRequests, fetchRequests: fetchVehicleRequests };
      case "venue_request":
        return { requests: venueRequests, setRequests: setVenueRequests, fetchRequests: fetchVenueRequests };
      default:
        return { requests: [], setRequests: () => {}, fetchRequests: () => {} };
    }
  };
  const { requests, setRequests, fetchRequests } = getRequestData();

  /* ------------------- Reason lists ------------------- */
  const positiveReasons = [
    { id: 1, value: "Completed successfully" },
    { id: 2, value: "Requirements fully met" },
    { id: 3, value: "Approved and finalized" },
    { id: 4, value: "Delivered as expected" },
    { id: 5, value: "Verified and confirmed" },
    { id: 6, value: "Processed without issues" },
    { id: 7, value: "Other" },
  ];
  const negativeReasons = [
    { id: 1, value: "Incomplete or pending" },
    { id: 2, value: "Missing requirements" },
    { id: 3, value: "Rejected or denied" },
    { id: 4, value: "Cancelled by requester" },
    { id: 5, value: "Resource unavailable" },
    { id: 6, value: "Failed verification" },
    { id: 7, value: "Other" },
  ];
  const isPositiveStatus = (s) =>
    ["completed", "approved", "done", "finished", "verified"].some((kw) =>
      s?.toLowerCase().includes(kw)
    );

  /* ------------------- Drag-end handling ------------------- */
  const handleOnDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    if (!destination || source.droppableId === destination.droppableId) return;

    setSelectedReferenceNumber(draggableId.toString());
    setSelectedStatus(destination.droppableId);
    setSelectedReason("");
    setAdditionalComment("");
    setActionTaken("");
    setOpenModal(true);
  };

  const handleReasonChange = (e) => {
    const r = e.target.value;
    setSelectedReason(r);
    setActionTaken(additionalComment ? `${r}: ${additionalComment}` : r);
  };
  const handleCommentChange = (e) => {
    const c = e.target.value;
    setAdditionalComment(c);
    setActionTaken(selectedReason ? `${selectedReason}: ${c}` : c);
  };

  /* ------------------- AI Helpers ------------------- */
  const generateReason = async () => {
    if (!selectedStatus) return;
    setAiLoading(true);
    try {
      const prompt = `You are a professional admin. Write a short, polite reason for changing a request status to "${selectedStatus}". Keep under 50 words.`;

      const result = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      const text = result.text?.trim();
      if (text) {
        setAdditionalComment(text);
        setActionTaken(selectedReason ? `${selectedReason}: ${text}` : text);
      }
    } catch (err) {
      ToastNotification.error("AI Error", "Failed to generate reason.");
    } finally {
      setAiLoading(false);
    }
  };

  const rephraseComment = async () => {
    if (!additionalComment.trim()) return;
    setAiLoading(true);
    try {
      const prompt = `Rephrase this comment professionally and concisely (under 60 words):\n"${additionalComment}"`;

      const result = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      const text = result.text?.trim();
      if (text) {
        setAdditionalComment(text);
        setActionTaken(selectedReason ? `${selectedReason}: ${text}` : text);
      }
    } catch (err) {
      ToastNotification.error("AI Error", "Failed to rephrase.");
    } finally {
      setAiLoading(false);
    }
  };

  /* ------------------- Confirm status change ------------------- */
  const confirmStatusChange = async () => {
    if (!actionTaken.trim()) {
      ToastNotification.error("Error!", "Please provide a reason or comment.");
      return;
    }

    try {
      await axios.patch(
        `${process.env.REACT_APP_API_URL}/${requestType}/${selectedReferenceNumber}/status`,
        { requester: user.reference_number, status: selectedStatus, action: actionTaken },
        { withCredentials: true }
      );

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

      fetchRequests();
      ToastNotification.success("Success!", "Status updated and logged.");
    } catch (e) {
      console.error("Status change error:", e);
      ToastNotification.error("Error", "Failed to update status.");
    } finally {
      setOpenModal(false);
      setSelectedReason("");
      setAdditionalComment("");
      setActionTaken("");
      setSelectedReferenceNumber("");
      setSelectedStatus("");
    }
  };

  /* ------------------- Filters & column add ------------------- */
  const filteredTasks = (tasks) => {
    return tasks.filter((t) => {
      const s = t.title?.toLowerCase().includes(searchQuery) ||
                t.reference_number?.toLowerCase().includes(searchQuery);
      const st = filters.status ? t.status === filters.status : true;
      const dep = filters.department
        ? t.department?.toLowerCase().includes(filters.department.toLowerCase())
        : true;
      const pri = !filters.priority || t.priority === filters.priority;
      return s && st && dep && pri;
    });
  };

  const addColumn = async (statusName) => {
    if (!statusName) return;
    if (columns.some((c) => c.name === statusName)) {
      ToastNotification.info("Notice!", "Column already exists");
      return;
    }
    const newCol = { id: columns.length + 1, name: statusName };
    const upd = [...columns, newCol];
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/settings/user_preference/${user.reference_number}`,
        { kanban_config: { columns: upd } },
        { withCredentials: true }
      );
      setColumns(upd);
      localStorage.setItem(
        "userPreference",
        JSON.stringify({ kanban_config: { columns: upd } })
      );
      fetchData();
    } catch (e) {
      console.error("Add column error:", e);
    }
  };

  const requestTypeColor = {
    job_request: "blue",
    purchasing_request: "green",
    venue_request: "purple",
    vehicle_request: "orange",
  };

  /* ------------------- Render ------------------- */
  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <CardHeader floated={false} shadow={false} className="rounded-none min-h-fit pb-2">
        <Header title="Kanban Board" />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between px-3 gap-4 mt-2 w-full">
          {/* Search */}
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

          {/* Filters + Menus */}
          <div className="flex flex-col lg:flex-row lg:justify-end lg:items-center gap-2 w-full">
            <div className="w-full"><RequestFilter filters={filters} onFilterChange={setFilters} /></div>

            <div className="flex lg:flex-row lg:justify-end items-center gap-2 w-fit">
              <span className="text-xs font-semibold whitespace-nowrap text-gray-700 text-center sm:text-left">
                GROUP BY
              </span>

              {/* Request-type selector */}
              <Menu placement="bottom-end">
                <MenuHandler>
                  <div className="cursor-pointer w-fit">
                    <Chip
                      value={requestType.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                      variant="filled"
                      color={requestTypeColor[requestType] || "gray"}
                      className="pointer-events-none"
                    />
                  </div>
                </MenuHandler>
                <MenuList className="flex flex-col flex-wrap gap-2 px-3 py-2">
                  <Chip value="Job Requests" onClick={() => setRequestType("job_request")}
                    variant={requestType === "job_request" ? "filled" : "ghost"}
                    color={requestType === "job_request" ? "blue" : "gray"} className="cursor-pointer w-fit" />
                  <Chip value="Purchasing Requests" onClick={() => setRequestType("purchasing_request")}
                    variant={requestType === "purchasing_request" ? "filled" : "ghost"}
                    color={requestType === "purchasing_request" ? "green" : "gray"} className="cursor-pointer w-fit" />
                  <Chip value="Vehicle Requests" onClick={() => setRequestType("vehicle_request")}
                    variant={requestType === "vehicle_request" ? "filled" : "ghost"}
                    color={requestType === "vehicle_request" ? "amber" : "gray"} className="cursor-pointer w-fit" />
                  <Chip value="Venue Requests" onClick={() => setRequestType("venue_request")}
                    variant={requestType === "venue_request" ? "filled" : "ghost"}
                    color={requestType === "venue_request" ? "purple" : "gray"} className="cursor-pointer w-fit" />
                </MenuList>
              </Menu>

              {/* Add column */}
              <Menu placement="bottom-end">
                <MenuHandler>
                  <div className="cursor-pointer w-fit">
                    <Chip value="Add Column" variant="ghost" color="gray" className="pointer-events-none" />
                  </div>
                </MenuHandler>
                <MenuList className="flex flex-col flex-wrap gap-2 px-3 py-2">
                  {status.map((s) => (
                    <Chip
                      key={s.id}
                      value={s.status}
                      onClick={() => addColumn(s.status)}
                      variant="ghost"
                      color={s.color || "gray"}
                      className="cursor-pointer w-fit"
                    />
                  ))}
                </MenuList>
              </Menu>
            </div>
          </div>
        </div>
      </CardHeader>

      {/* Board */}
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
                  {columns.map((col) => (
                    <Column
                      key={col.name}
                      title={col.name}
                      tasks={filteredTasks(
                        (Array.isArray(requests) ? requests : []).filter((t) => t.status === col.name)
                      )}
                      id={col.name}
                      columnID={col.id}
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

        {/* Sidebar */}
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

        {/* ---------- Confirmation Dialog with AI ---------- */}
        <Dialog open={openModal} handler={setOpenModal} size="sm">
          <DialogHeader className="text-lg text-gray-900 dark:text-gray-200">
            Confirm Status Change
          </DialogHeader>

          <DialogBody>
            <Typography
              variant="small"
              className="mb-2 text-xs font-medium text-gray-700 dark:text-gray-300"
            >
              Select a reason for this action:
            </Typography>
            <select
              value={selectedReason}
              onChange={handleReasonChange}
              className="w-full border text-sm font-medium border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 mb-2 normal-case"
              required
            >
              <option value="">Select Reason</option>
              {(isPositiveStatus(selectedStatus) ? positiveReasons : negativeReasons).map((r) => (
                <option key={r.id} value={r.value}>
                  {r.value}
                </option>
              ))}
            </select>

            <Typography
              variant="small"
              className="mb-2 text-xs font-medium text-gray-700 dark:text-gray-300"
            >
              Additional comments (optional):
            </Typography>

            {/* Textarea + floating AI buttons */}
            <div className="relative">
              <textarea
                ref={textareaRef}
                className="w-full text-sm font-medium text-gray-700 dark:text-gray-300 px-3 py-2 pr-20 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 resize-none"
                rows={4}
                placeholder="Enter comments or use AI..."
                value={additionalComment}
                onChange={handleCommentChange}
              />

              {/* AI buttons (same bg as textarea) */}
              <div className="absolute bottom-2 right-2 flex gap-1 bg-white dark:bg-gray-800 p-1 md:flex-row flex-col p-1 rounded-md">
                <button
                  onClick={generateReason}
                  disabled={aiLoading || !selectedStatus}
                  className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition disabled:opacity-50"
                  title="Generate reason"
                >
                  {aiLoading ? <Spinner className="h-4 w-4" /> : <Sparkle size={16} />}
                </button>
                <button
                  onClick={rephraseComment}
                  disabled={aiLoading || !additionalComment.trim()}
                  className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded transition disabled:opacity-50"
                  title="Rephrase comment"
                >
                  <ArrowClockwise size={16} />
                </button>
              </div>
            </div>
          </DialogBody>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outlined"
              color="red"
              onClick={() => setOpenModal(false)}
              className="flex items-center gap-1 px-4 py-2 border rounded-md hover:text-red-500 dark:border-gray-600 normal-case"
            >
              Cancel
            </Button>
            <Button
              color="green"
              onClick={confirmStatusChange}
              className="flex items-center gap-1 px-4 py-2 normal-case"
              disabled={!actionTaken.trim()}
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