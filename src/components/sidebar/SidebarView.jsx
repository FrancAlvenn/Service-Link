import { CaretDown, UserCircle, X, CaretRight } from "@phosphor-icons/react";
import ToastNotification from "../../utils/ToastNotification";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../features/authentication";
import { VenueRequestsContext } from "../../features/request_management/context/VenueRequestsContext";
import { VehicleRequestsContext } from "../../features/request_management/context/VehicleRequestsContext";
import { PurchasingRequestsContext } from "../../features/request_management/context/PurchasingRequestsContext";
import { JobRequestsContext } from "../../features/request_management/context/JobRequestsContext";
import DetailsTab from "./DetailsTab";
import ParticularsTab from "./ParticularsTab";
import { UserContext } from "../../context/UserContext";
import StatusModal from "../../utils/statusModal";
import ApprovalStatusModal from "../../utils/approverStatusModal";
import {
  Button,
  Tab,
  TabPanel,
  Tabs,
  TabsBody,
  TabsHeader,
} from "@material-tailwind/react";
import RequestAccess from "./RequestAccess";
import ActivityTab from "./ActivityTab";
import Assignment from "./Assignment";

const SidebarView = ({ open, onClose, referenceNumber, requests }) => {
  const [isOpen, setIsOpen] = useState(open);
  const { jobRequests, fetchJobRequests } = useContext(JobRequestsContext);
  const { purchasingRequests, fetchPurchasingRequests } = useContext(
    PurchasingRequestsContext
  );
  const { vehicleRequests, fetchVehicleRequests } = useContext(
    VehicleRequestsContext
  );
  const { venueRequests, fetchVenueRequests } =
    useContext(VenueRequestsContext);
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

  // Fetch relevant request based on reference number
  useEffect(() => {
    if (isOpen && referenceNumber) {
      const type = referenceNumber.slice(0, 2);
      let requests, typeName;

      switch (type) {
        case "JR":
          typeName = "job_request";
          requests = jobRequests;
          break;
        case "PR":
          typeName = "purchasing_request";
          requests = purchasingRequests;
          break;
        case "SV":
          typeName = "vehicle_request";
          requests = vehicleRequests;
          break;
        case "VR":
          typeName = "venue_request";
          requests = venueRequests;
          break;
        default:
          console.warn("Unknown request type:", type);
          return;
      }

      setRequestType(typeName);
      setRequest({
        ...requests.find((req) => req.reference_number === referenceNumber),
      });

      const foundRequest = requests.find(
        (req) => req.reference_number === referenceNumber
      );
      setRequestType(typeName);
      setRequest(foundRequest);

      // Check if user is authorized
      if (foundRequest?.authorized_access) {
        setIsAuthorized(
          foundRequest.authorized_access.includes(user.reference_number)
        );
      } else {
        setIsAuthorized(false);
      }
    }
  }, [
    jobRequests,
    purchasingRequests,
    vehicleRequests,
    venueRequests,
    referenceNumber,
    isOpen,
    user,
  ]);

  // Fetch all requests
  const fetchAllRequests = () => {
    fetchJobRequests();
    fetchPurchasingRequests();
    fetchVehicleRequests();
    fetchVenueRequests();
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
        url: `/${requestType}/${request.reference_number}`,
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
        url: `/${requestType}/${request.reference_number}`,
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

  return (
    <div
      onClick={handleSidebarClick}
      className={`shadow-lg w-[650px] h-full p-5 bg-white transform transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "hidden"
      }`}
    >
      {request ? (
        <div className="flex flex-col overflow-y-auto h-full">
          {/* Close Button & Request Access */}
          <div className="flex items-center justify-between w-full mb-4">
            <div className="p-1 rounded-md bg-white">
              <CaretRight
                color="black"
                size={20}
                onClick={handleClose}
                className="cursor-pointer"
              />
            </div>
            <RequestAccess selectedRequest={request} />
          </div>

          {/* TABS SECTION */}
          <Tabs value={activeTab} onChange={setActiveTab}>
            <TabsHeader
              className="mb-2 text-xs font-sans"
              indicatorProps={{
                className: "shadow-none", // This controls the underline color
              }}
            >
              <Tab
                value="overview"
                className="text-sm font-sans"
                onClick={() => setActiveTab("overview")}
              >
                Overview
              </Tab>
              {["job_request", "purchasing_request", "venue_request"].includes(
                requestType
              ) && (
                <Tab
                  value="particulars"
                  className="text-sm font-sans"
                  onClick={() => setActiveTab("particulars")}
                >
                  Particulars
                </Tab>
              )}
              <Tab
                value="details"
                className="text-sm font-sans"
                onClick={() => setActiveTab("details")}
              >
                Details
              </Tab>
              <Tab
                value="activity"
                className="text-sm font-sans"
                onClick={() => setActiveTab("activity")}
              >
                Activity
              </Tab>
              <Tab
                value="assignment"
                className="text-sm font-sans"
                onClick={() => setActiveTab("assignment")}
              >
                Assignment
              </Tab>
            </TabsHeader>

            <TabsBody>
              {/* Overview Tab */}
              <TabPanel value="overview">
                {/* Editable Title */}
                <h2 className="text-xl font-bold mb-4">
                  {isAuthorized ? (
                    isEditingTitle ? (
                      <input
                        type="text"
                        className="border w-full border-gray-300 rounded-md p-2"
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        onKeyDown={handleTitleKeyDown}
                        onBlur={handleSaveTitle}
                        autoFocus
                      />
                    ) : (
                      <p
                        onClick={handleEditTitle}
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 mb-5">
                    <div title="Request Status">
                      <StatusModal
                        input={request.status}
                        referenceNumber={request.reference_number}
                        requestType={requestType}
                        title="Status"
                      />
                    </div>
                    <div title="Immediate Head Approval">
                      <ApprovalStatusModal
                        input={request.immediate_head_approval}
                        referenceNumber={request.reference_number}
                        approvingPosition="immediate_head_approval"
                        requestType={requestType}
                      />
                    </div>
                    <div title="Operations Director Approval">
                      <ApprovalStatusModal
                        input={request.operations_director_approval}
                        referenceNumber={request.reference_number}
                        approvingPosition="operations_director_approval"
                        requestType={requestType}
                      />
                    </div>
                    <div title="GSO Director Approval">
                      <ApprovalStatusModal
                        input={request.gso_director_approval}
                        referenceNumber={request.reference_number}
                        approvingPosition="gso_director_approval"
                        requestType={requestType}
                      />
                    </div>
                  </div>
                </div>

                {/* Editable Purpose */}
                <div className="flex flex-col p-3 gap-2 border-gray-400 border rounded-md">
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
                    <p className="text-sm font-semibold text-gray-600">
                      Purpose
                    </p>
                    {isAuthorized ? (
                      isEditingPurpose ? (
                        <textarea
                          className="text-sm p-2 border w-full border-gray-300 rounded-md"
                          value={editedPurpose}
                          onChange={(e) => setEditedPurpose(e.target.value)}
                          onBlur={handleSavePurpose}
                          autoFocus
                        />
                      ) : (
                        <p
                          onClick={handleEditPurpose}
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
              </TabPanel>
              {/* Particulars Tab (conditional) */}
              {["job_request", "purchasing_request", "venue_request"].includes(
                requestType
              ) && (
                <TabPanel value="particulars">
                  <ParticularsTab
                    request={request}
                    setRequest={setRequest}
                    requestType={requestType}
                    referenceNumber={referenceNumber}
                    fetchRequests={fetchAllRequests}
                    user={user}
                    isAuthorized={isAuthorized}
                  />
                </TabPanel>
              )}
              {/* Details Tab */}
              <TabPanel value="details">
                <DetailsTab
                  selectedRequest={request}
                  setSelectedRequest={setRequest}
                  requestType={requestType}
                  fetchRequests={fetchAllRequests}
                  user={user}
                  isAuthorized={isAuthorized}
                />
              </TabPanel>
              {/* Activity Tab */}
              <TabPanel value="activity">
                <ActivityTab
                  referenceNumber={referenceNumber}
                  activeTab={activeTab}
                />
              </TabPanel>

              {/* Assignment Tab - Placeholder */}
              <TabPanel value="assignment">
                <Assignment
                  selectedRequest={request}
                  setSelectedRequest={setRequest}
                  requestType={requestType}
                  fetchRequests={fetchAllRequests}
                  user={user}
                  isAuthorized={isAuthorized}
                />
              </TabPanel>
            </TabsBody>
          </Tabs>
        </div>
      ) : (
        <p className="text-center text-gray-400">Loading request...</p>
      )}
    </div>
  );
};

export default SidebarView;
