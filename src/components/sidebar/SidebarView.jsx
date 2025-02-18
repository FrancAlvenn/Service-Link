import { CaretDown, FloppyDisk, UserCircle } from "@phosphor-icons/react";
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

const SidebarView = ({ open, onClose, referenceNumber }) => {
  const [isOpen, setIsOpen] = useState(open);
  const { jobRequests, fetchJobRequests } = useContext(JobRequestsContext);
  const { purchasingRequests, fetchPurchasingRequests } = useContext(PurchasingRequestsContext);
  const { vehicleRequests, fetchVehicleRequests } = useContext(VehicleRequestsContext);
  const { venueRequests, fetchVenueRequests } = useContext(VenueRequestsContext);
  const { user } = useContext(AuthContext);
  const { getUserByReferenceNumber } = useContext(UserContext);

  const [request, setRequest] = useState(null);
  const [requestType, setRequestType] = useState(null);

  // Editing states
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingPurpose, setIsEditingPurpose] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedPurpose, setEditedPurpose] = useState("");

  // Fetch job requests from the database
  useEffect(() => {
    if (isOpen && referenceNumber) {
      const type = referenceNumber.slice(0, 2);
      switch (type) {
        case "JR":
          setRequestType("job_request");
          break;
        case "PR":
          setRequestType("purchasing_request");
          break;
        case "SV":
          setRequestType("vehicle_request");
          break;
        case "VR":
          setRequestType("venue_request");
          break;
        default:
          console.warn("Unknown request type:", type);
      }

      const allRequests = [
        ...jobRequests,
        ...purchasingRequests,
        ...vehicleRequests,
        ...venueRequests,
      ];
      const found = allRequests.find((req) => req.reference_number === referenceNumber);
      setRequest(found);
    }
  }, [jobRequests, purchasingRequests, vehicleRequests, venueRequests, referenceNumber, isOpen]);

  // Fetch all requests
  const fetchAllRequests = () => {
    fetchJobRequests();
    fetchPurchasingRequests();
    fetchVehicleRequests();
    fetchVenueRequests();
  };

  // Sync local state with the parent "open" prop
  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  const handleSidebarClick = (e) => e.stopPropagation();

  // Handle title editing
  const handleEditTitle = () => {
    setIsEditingTitle(true);
    setEditedTitle(request.title);
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
          title: editedTitle
        },
        withCredentials: true
      })
      fetchAllRequests();
      // ToastNotification.success("Success", "Title updated successfully!");
    } catch (error) {
      console.error("Update failed:", error);
      ToastNotification.error("Error", "Failed to update title.");
    } finally {
      setIsEditingTitle(false);
    }
  };

  // Handle title input events
  const handleTitleKeyDown = (e) => {
    if (e.key === "Enter") handleSaveTitle();
    if (e.key === "Escape") setIsEditingTitle(false);
  };

  const handleTitleBlur = () => {
    handleSaveTitle();
  };

  // Handle purpose editing
  const handleEditPurpose = () => {
    setIsEditingPurpose(true);
    setEditedPurpose(request.purpose);
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
          purpose: editedPurpose },
        withCredentials: true
      });
      fetchAllRequests();
      // ToastNotification.success("Success", "Purpose updated successfully!");
    } catch (error) {
      console.error("Update failed:", error);
      ToastNotification.error("Error", "Failed to update purpose.");
    } finally {
      setIsEditingPurpose(false);
    }
  };

  // Handle purpose input events
  const handlePurposeKeyDown = (e) => {
    if (e.key === "Enter") handleSavePurpose();
    if (e.key === "Escape") setIsEditingPurpose(false);
  };

  const handlePurposeBlur = () => {
    handleSavePurpose();
  };

  return (
    <>
      {/* Overlay */}
      <div className={`fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`} onClick={handleClose}></div>

      {/* Sidebar */}
      <div onClick={handleSidebarClick} className={`fixed top-0 right-0 z-50 w-[650px] h-full p-5 bg-white transform transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
        {request ? (
          <div className="flex flex-col overflow-y-auto h-full">
            {/* Editable Title */}
            <h2 className="text-xl font-bold mb-4">
              {isEditingTitle ? (
                <input
                  type="text"
                  className="border w-full border-gray-300 rounded-md p-2"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  onKeyDown={handleTitleKeyDown}
                  onBlur={handleTitleBlur}
                  autoFocus
                />
              ) : (
                <p onClick={handleEditTitle} className="w-full cursor-pointer">{request.title}</p>
              )}
            </h2>

            {/* Editable Purpose */}
            <div className="flex flex-col p-3 gap-2 border-gray-400 border rounded-md">
              <span className="flex items-center mb-2">
                <UserCircle size={24} />
                <p className="ml-2 text-sm"><span className="font-semibold">{getUserByReferenceNumber(request.requester)}</span> raised this request</p>
              </span>
              <span className="flex flex-col gap-3">
                <p className="text-sm font-semibold text-gray-600">Purpose</p>
                {isEditingPurpose ? (
                  <textarea
                    className="text-sm p-2 border w-full border-gray-300 rounded-md"
                    value={editedPurpose}
                    onChange={(e) => setEditedPurpose(e.target.value)}
                    onKeyDown={handlePurposeKeyDown}
                    onBlur={handlePurposeBlur}
                    autoFocus
                  />
                ) : (
                  <p onClick={handleEditPurpose} className="text-sm cursor-pointer">{request.purpose}</p>
                )}
              </span>
            </div>

            <div className="flex flex-col gap-3 mt-3">
              <ParticularsTab
                request={request}
                setRequest={setRequest}
                requestType={"job_request"}
                referenceNumber={referenceNumber}
                fetchRequests={fetchAllRequests}
                user={user}
              />

              <div className="my-3 flex gap-1 p-3 border-gray-400 border rounded-md">
                <p className="text-sm font-semibold text-gray-600">Similar Requests</p>
                <CaretDown size={18} className="ml-auto cursor-pointer"  />
              </div>

              <DetailsTab
                selectedRequest={request}
                setSelectedRequest={setRequest}
                requestType={requestType}
                fetchRequests={fetchAllRequests}
                user={user}
              />

            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center h-full text-xl text-gray-600">No request found.</div>
        )}
      </div>
    </>
  );
};

export default SidebarView;
