import {
  CaretDown,
  UserCircle,
  X,
  CaretRight,
  CaretLeft,
  SealCheck,
} from "@phosphor-icons/react";
import { useContext, useEffect, useState } from "react";
import { JobRequestsContext } from "../../context/JobRequestsContext";
import { PurchasingRequestsContext } from "../../context/PurchasingRequestsContext";
import { VehicleRequestsContext } from "../../context/VehicleRequestsContext";
import { VenueRequestsContext } from "../../context/VenueRequestsContext";
import { AuthContext } from "../../../authentication/index";
import { UserContext } from "../../../../context/UserContext";
import axios from "axios";
import ToastNotification from "../../../../utils/ToastNotification";
import { Typography } from "@material-tailwind/react";
import ParticularsTab from "./ParticularsTab";
import ActivityTab from "./ActivityTab";
import RequestAccess from "./RequestAccess";
import DetailsTab from "./DetailsTab";
import Assignment from "./Assignment";
import StatusModal from "../../../../utils/statusModal";
import PrintableRequestForm from "../reporting_dashboard/PrintableRequestForm";
import TimelineTab from "./TimelineTab";

const DynamicStepper = ({ approvers }) => {
  const statusOptions = [
    { status: "approved", color: "bg-green-500" },
    { status: "pending", color: "bg-gray-500" },
    { status: "in-review", color: "bg-gray-500" },
    { status: "rejected", color: "bg-red-500" },
  ];

  // Group approvers by position
  const groupedByPosition = {};
  approvers.flat().forEach((approver) => {
    const position = approver.position?.position || "Unknown Position";
    if (!groupedByPosition[position]) {
      groupedByPosition[position] = [];
    }
    groupedByPosition[position].push(approver);
  });

  const totalSteps = Object.keys(groupedByPosition).length;
  const positions = Object.keys(groupedByPosition);

  return (
    <div className="flex items-center w-full relative">
      <div className="w-full h-px bg-gray-500 absolute top-1/2 transform -translate-y-1/2"></div>
      {positions.map((positionName, index) => {
        const approversInPosition = groupedByPosition[positionName];
        const status =
          approversInPosition.find((a) => a.status === "approved")?.status ||
          approversInPosition.find((a) => a.status === "rejected")?.status ||
          "Pending";

        return (
          <div key={positionName} className={`flex flex-col ${index === 0 ? "" : "items-center"} ${(index === totalSteps - 1 && index !== 0) ? "items-end" : ""} justify-between w-full relative z-10`}>
            <div
              onClick={() =>
                ToastNotification.info("Request Approval Status", approversInPosition.map(a => a.position.position).join(", ") + " - " + status.charAt(0).toUpperCase() + status.slice(1) + ".")
              }
              title={`${positionName} - ${status.charAt(0).toUpperCase() + status.slice(1)}`}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs bg-gray-500 cursor-pointer ${statusOptions.find((option) => option.status === status)?.color}`}
            >
              <div className="w-2 h-2 rounded-full bg-white"></div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const ModalView = ({ open, onClose, referenceNumber, asModal = false }) => {
  const [isOpen, setIsOpen] = useState(open);

  const {
    jobRequests,
    archivedJobRequests,
    fetchJobRequests,
    fetchArchivedJobRequests,
  } = useContext(JobRequestsContext);
  const {
    purchasingRequests,
    archivedPurchasingRequests,
    fetchPurchasingRequests,
    fetchArchivedPurchasingRequests,
  } = useContext(PurchasingRequestsContext);
  const {
    vehicleRequests,
    archivedVehicleRequests,
    fetchVehicleRequests,
    fetchArchivedVehicleRequests,
  } = useContext(VehicleRequestsContext);
  const {
    venueRequests,
    archivedVenueRequests,
    fetchVenueRequests,
    fetchArchivedVenueRequests,
  } = useContext(VenueRequestsContext);

  const { user } = useContext(AuthContext);
  const { getUserByReferenceNumber } = useContext(UserContext);

  const [request, setRequest] = useState(null);
  const [requestType, setRequestType] = useState(null);

  // Editable states
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingPurpose, setIsEditingPurpose] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedPurpose, setEditedPurpose] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);

  const [activeTab, setActiveTab] = useState("overview");

  const statusOptions = [
    { status: "Pending", color: "yellow" },
    { status: "Approved", color: "green" },
    { status: "Rejected", color: "red" },
  ];

  useEffect(() => {
    fetchAllRequests(); // fetch all active and archived requests on component mount
  }, []);

  // Fetch relevant request based on reference number
  useEffect(() => {
    if (!isOpen || !referenceNumber || !user?.reference_number) return;

    const type = referenceNumber.slice(0, 2);
    let combinedRequests = [];
    let typeName = "";

    const requestMap = {
      JR: {
        type: "job_request",
        data: [
          ...(Array.isArray(jobRequests) ? jobRequests : []),
          ...(Array.isArray(archivedJobRequests) ? archivedJobRequests : []),
        ],
      },
      PR: {
        type: "purchasing_request",
        data: [
          ...(Array.isArray(purchasingRequests) ? purchasingRequests : []),
          ...(Array.isArray(archivedPurchasingRequests)
            ? archivedPurchasingRequests
            : []),
        ],
      },
      SV: {
        type: "vehicle_request",
        data: [
          ...(Array.isArray(vehicleRequests) ? vehicleRequests : []),
          ...(Array.isArray(archivedVehicleRequests)
            ? archivedVehicleRequests
            : []),
        ],
      },
      VR: {
        type: "venue_request",
        data: [
          ...(Array.isArray(venueRequests) ? venueRequests : []),
          ...(Array.isArray(archivedVenueRequests)
            ? archivedVenueRequests
            : []),
        ],
      },
    };

    const mapped = requestMap[type];

    if (mapped) {
      typeName = mapped.type;
      combinedRequests = mapped.data;
    } else {
      console.warn("Unknown request type:", type);
      return;
    }

    if (!combinedRequests.length) {
      console.warn("Requests not yet loaded for", typeName);
      return;
    }

    const foundRequest = combinedRequests.find(
      (req) => req.reference_number === referenceNumber
    );

    if (foundRequest) {
      setRequestType(typeName);
      setRequest(foundRequest);
      setIsAuthorized(
        foundRequest?.authorized_access?.includes(user.reference_number) ||
          false
      );
    } else {
      setRequest(null);
      setIsAuthorized(false);
    }
  }, [
    isOpen,
    referenceNumber,
    user,
    jobRequests,
    archivedJobRequests,
    purchasingRequests,
    archivedPurchasingRequests,
    vehicleRequests,
    archivedVehicleRequests,
    venueRequests,
    archivedVenueRequests,
  ]);

  // Fetch all requests
  const fetchAllRequests = () => {
    fetchJobRequests();
    fetchPurchasingRequests();
    fetchVehicleRequests();
    fetchVenueRequests();
    fetchArchivedJobRequests();
    fetchArchivedPurchasingRequests();
    fetchArchivedVehicleRequests();
    fetchArchivedVenueRequests();
  };

  // Sync open state
  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  const handleClose = () => {
    setRequest(null);
    setRequestType(null);
    setEditedPurpose("");
    setEditedTitle("");

    setIsOpen(false);
    if (onClose) onClose();
  };

  const handleSidebarClick = (e) => e.stopPropagation();

  // Handle title editing
  const handleEditTitle = () => {
    setEditedTitle(request.title);
    setIsEditingTitle(true);
  };

  const handleSaveTitle = async () => {
    if (!editedTitle.trim() || editedTitle === request.title) {
      setIsEditingTitle(false);
      return;
    }
    try {
      await axios({
        method: "put",
        url: `${process.env.REACT_APP_API_URL}/${requestType}/${request.reference_number}`,
        data: {
          ...request,
          title: editedTitle,
          requester: user.reference_number,
        },
        withCredentials: true,
      });
      fetchAllRequests();
      setIsEditingTitle(false);
      setEditedTitle("");
    } catch (error) {
      console.error("Update failed:", error);
      ToastNotification.error("Error", "Failed to update title.");
    } finally {
      setIsEditingTitle(false);
    }
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === "Enter") handleSaveTitle();
    if (e.key === "Escape") setIsEditingTitle(false);
  };

  const handleEditPurpose = () => {
    setEditedPurpose(request.purpose);
    setIsEditingPurpose(true);
  };

  const handleSavePurpose = async () => {
    if (!editedPurpose.trim() || editedPurpose === request.purpose) {
      setIsEditingPurpose(false);
      return;
    }
    try {
      await axios({
        method: "put",
        url: `${process.env.REACT_APP_API_URL}/${requestType}/${request.reference_number}`,
        data: {
          ...request,
          purpose: editedPurpose,
          requester: user.reference_number,
        },
        withCredentials: true,
      });
      fetchAllRequests();
      setEditedPurpose("");
      setIsEditingPurpose(false);
    } catch (error) {
      console.error("Update failed:", error);
      ToastNotification.error("Error", "Failed to update purpose.");
    } finally {
      setIsEditingPurpose(false);
    }
  };

  const [openRequestAccess, setOpenRequestAccess] = useState(false);

  useEffect(() => {
    console.log(jobRequests);
  }, [request]);

  return (
    asModal && (
      <div
        className="p- lg:p-6 h-[calc(100vh-5rem)] overflow-y-auto"
        onClick={handleSidebarClick}
      >
        {/* modal-specific layout (you can keep the rest as-is inside here) */}
        {request ? (
          <div className="flex flex-col lg:flex-row w-full lg:h-[80vh] overflow-y-auto">
            {/* LEFT SIDE - Overview & Activity */}
            <div className="w-full lg:w-2/3 flex flex-col overflow-y-auto p-4">
              {/* Header */}
              <div className="flex items-center justify-between w-full mb-4">
                <div className="flex items-center gap-1 p-1 rounded-lg bg-white">
                  <CaretLeft
                    color="black"
                    size={20}
                    onClick={handleClose}
                    className="cursor-pointer"
                  />
                  <Typography
                    variant="title"
                    color="black"
                    className="flex items-center text-sm font-semibold"
                  >
                    Back
                  </Typography>
                </div>
              </div>

              {/* Title */}
              <h2 className="text-xl font-bold mb-4">
                {isAuthorized ? (
                  isEditingTitle ? (
                    <input
                      type="text"
                      className="border w-full border-gray-300 rounded-lg p-2"
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      onKeyDown={handleTitleKeyDown}
                      onBlur={handleSaveTitle}
                      autoFocus
                    />
                  ) : (
                    <p
                      // onClick={handleEditTitle}
                      className="w-full cursor-pointer"
                    >
                      {request.title}
                    </p>
                  )
                ) : (
                  <p className="w-full">{request.title}</p>
                )}
              </h2>

              {/* Status & Approvals */}
              <div className="flex items-center gap-3 mb-5">
                {/* Dynamic Stepper for Approvers */}
                {request?.approvers && <DynamicStepper approvers={request.approvers} />}
              </div>

              {/* Purpose */}
              <div className="flex flex-col p-3 gap-2 border-gray-400 border rounded-lg mb-4">
                <span className="flex items-center mb-2">
                  <UserCircle size={24} />
                  <p className="ml-2 text-sm">
                    <span className="font-semibold">
                      {getUserByReferenceNumber(request.requester)}
                    </span>{" "}
                    raised this request
                  </p>
                </span>
                <span className="flex flex-col gap-3">
                  <p className="text-sm font-semibold text-gray-600">Purpose</p>
                  {isAuthorized ? (
                    isEditingPurpose ? (
                      <textarea
                        className="text-sm p-2 border w-full border-gray-300 rounded-lg"
                        value={editedPurpose}
                        onChange={(e) => setEditedPurpose(e.target.value)}
                        onBlur={handleSavePurpose}
                        autoFocus
                      />
                    ) : (
                      <p
                        // onClick={handleEditPurpose}
                        className="text-sm cursor-pointer"
                      >
                        {request.purpose}
                      </p>
                    )
                  ) : (
                    <p className="text-sm">{request.purpose}</p>
                  )}
                </span>
              </div>

              {/* Particulars (conditional) */}
              {["job_request", "purchasing_request", "venue_request"].includes(
                requestType
              ) && (
                <ParticularsTab
                  request={request}
                  setRequest={setRequest}
                  requestType={requestType}
                  referenceNumber={referenceNumber}
                  fetchRequests={fetchAllRequests}
                  user={user}
                  isAuthorized={isAuthorized}
                />
              )}

              {/* Activity (reused component) */}
              <ActivityTab
                referenceNumber={referenceNumber}
                activeTab={"activity"}
              />
            </div>

            {/* RIGHT SIDE - Request Access, Details, Particulars, Assignment */}
            <div className="w-full lg:w-1/3 flex flex-col lg:border-l lg:h-[80vh] overflow-y-auto p-4 space-y-4 border-t lg:border-t-0 border-gray-300">
              {/* Request Access (Top) */}
              <div className="flex justify-between items-center ">
                <div title="Request Status" className="flex items-center">
                  <StatusModal
                    input={request.status}
                    referenceNumber={request.reference_number}
                    requestType={requestType}
                    title="Status"
                  />
                </div>
                <div className="flex gap-2 items-center">
                  {request.verified && (
                    <div
                      title={
                        "Verified by " +
                        getUserByReferenceNumber(request.verified_by)
                      }
                    >
                      <SealCheck size={24} variant="filled" color="blue" />
                    </div>
                  )}
                  {/* <RequestAccess selectedRequest={request} /> */}
                  <PrintableRequestForm
                    requestType={requestType}
                    requestData={request}
                  />
                </div>
              </div>

              <div className="flex flex-col lg:h-[70vh] overflow-y-auto">
                {/* Details */}
                <DetailsTab
                  selectedRequest={request}
                  setSelectedRequest={setRequest}
                  requestType={requestType}
                  fetchRequests={fetchAllRequests}
                  user={user}
                  isAuthorized={isAuthorized}
                />

                {/* Timeline */}
                <TimelineTab
                  referenceNumber={referenceNumber}
                  request={request}
                />

                {/* Assignment */}
                <Assignment
                  selectedRequest={request}
                  setSelectedRequest={setRequest}
                  requestType={requestType}
                  fetchRequests={fetchAllRequests}
                  user={user}
                  isAuthorized={isAuthorized}
                />
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-400">Loading request...</p>
        )}
      </div>
    )
  );
};

export default ModalView;