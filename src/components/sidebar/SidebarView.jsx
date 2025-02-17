import { FloppyDisk, PencilSimpleLine, Plus, Prohibit, UserCircle, X } from "@phosphor-icons/react";
import ToastNotification from "../../utils/ToastNotification";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../features/authentication";
import { VenueRequestsContext } from "../../features/request_management/context/VenueRequestsContext";
import { VehicleRequestsContext } from "../../features/request_management/context/VehicleRequestsContext";
import { PurchasingRequestsContext } from "../../features/request_management/context/PurchasingRequestsContext";
import { JobRequestsContext } from "../../features/request_management/context/JobRequestsContext";

const SidebarView =  ({ open, onClose, referenceNumber }) => {
  const [isOpen, setIsOpen] = useState(open);
  const { jobRequests, fetchJobRequests } = useContext(JobRequestsContext);
  const { purchasingRequests, fetchPurchasingRequests } = useContext(PurchasingRequestsContext);
  const { vehicleRequests, fetchVehicleRequests } = useContext(VehicleRequestsContext);
  const { venueRequests, fetchVenueRequests } = useContext(VenueRequestsContext);

  const [request, setRequest] = useState(null);
  const [requestType, setRequestType] = useState(null);
  const { user } = useContext(AuthContext);

  // Popup state
  const [showPopup, setShowPopup] = useState(false);

  // To track edit mode for particulars
  const [editingIndex, setEditingIndex] = useState(null);
  const [editedParticular, setEditedParticular] = useState({
    particulars: "",
    quantity: "",
    description: "",
  });

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
      const found = allRequests.find(
        (request) => request.reference_number === referenceNumber
      );
      setRequest(found);
    }
  }, [jobRequests, purchasingRequests, vehicleRequests, venueRequests, referenceNumber, isOpen]);

  // Fetch all requests
  function fetchAllRequests() {
    fetchJobRequests();
    fetchPurchasingRequests();
    fetchVehicleRequests();
    fetchVenueRequests();
  }

  // Sync local state with the parent "open" prop
  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  // Prevent clicks within the sidebar from closing the sidebar
  const handleSidebarClick = (e) => e.stopPropagation();

  // Handle detail remove button click
  const handleDetailRemove = async (index) => {
    const updatedDetails = [...request.details];
    updatedDetails.splice(index, 1);
    setRequest((prevRequest) => ({
      ...prevRequest,
      details: updatedDetails,
    }));

    // Update the database
    if (referenceNumber) {
      await axios({
        method: "put",
        url: `/${requestType}/${referenceNumber}`,
        data: {
          requester: user.reference_number,
          details: updatedDetails,
        },
        withCredentials: true
      }).then((res) => {
        if (res.status === 200) {
          fetchJobRequests();
          ToastNotification.success('Success!', res.data.message);
        }
      }).catch((error) => {
        ToastNotification.error('Error!', 'Failed to update details.');
      });
    }
  };

  // Toggle edit mode and handle changes for particular details
  const handleEditClick = (index) => {
    setEditingIndex(index);
    setEditedParticular({
      ...request.details[index],
    });
  };

  const handleSaveEdit = async (index) => {
    const updatedDetails = [...request.details];
    updatedDetails[index] = editedParticular;
    setRequest((prevRequest) => ({
      ...prevRequest,
      details: updatedDetails,
    }));

    // Update the database
    await axios({
      method: "put",
      url: `/${requestType}/${referenceNumber}`,
      data: {
        requester: user.reference_number,
        details: updatedDetails,
      },
      withCredentials: true
    }).then((res) => {
      if (res.status === 200) {
        fetchJobRequests();
        ToastNotification.success('Success!', res.data.message);
      }
    }).catch((error) => {
      ToastNotification.error('Error!', 'Failed to update details.');
    });

    setEditingIndex(null);
  };

  const handleAddParticular = () => {
    const newDetail = {
      particulars: "",
      quantity: 0,
      description: "",
    };
    setRequest((prevRequest) => ({
      ...prevRequest,
      details: [...prevRequest.details, newDetail],
    }));
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={handleClose}
      ></div>

      {/* Sidebar */}
      <div onClick={handleSidebarClick} className={`fixed top-0 right-0 z-50 w-[650px] h-full p-5 bg-white transform transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
        {request ? (
          <div className="flex flex-col overflow-y-auto h-full">
            <h2 className="text-xl font-bold mb-4">{request.title}</h2>
            <div className="flex flex-col p-3 gap-2 border-gray-400 border rounded-md">
              <span className="flex items-center mb-2">
                <UserCircle size={24} />
                <p className="ml-2 text-sm"><span className="font-semibold">{request.requester}</span> raised this request</p>
              </span>
              <span className="flex flex-col gap-3">
                <p className="text-sm font-semibold text-gray-600">Purpose</p>
                <p className="text-sm">{request.purpose}</p>
              </span>
            </div>
            <div className="flex flex-col gap-3 overflow-y-auto">
              <p className="text-sm font-semibold mt-5 text-gray-600">Particulars</p>
              <div className="flex flex-col gap-3 overflow-y-auto max-h-[300px]">
                {request.details.map((detail, index) => (
                  <div key={index} className="flex flex-col gap-1 p-3 border-gray-400 border rounded-md">
                    <span className="flex gap-4 items-center">
                      {editingIndex === index ? (
                        <input
                          type="text"
                          className="text-sm p-1 min-w-20 w-full max-w-32  border border-gray-300 rounded-md"
                          value={editedParticular.particulars}
                          onChange={(e) => setEditedParticular({ ...editedParticular, particulars: e.target.value })}
                        />
                      ) : (
                        <p className="text-sm font-semibold">{detail.particulars}</p>
                      )}
                      {editingIndex === index ? (
                        <input
                          type="number"
                          className="text-sm p-1 w-20 border border-gray-300 rounded-md"
                          value={editedParticular.quantity}
                          onChange={(e) => setEditedParticular({ ...editedParticular, quantity: e.target.value })}
                        />
                      ) : (
                        <p className="text-sm font-semibold">x{detail.quantity}</p>
                      )}
                      <span className="flex gap-3 ml-auto">
                        {editingIndex === index ? (
                          <span className="flex gap-3">
                            <button className="hover:scale-[1.2] hover:text-green-500" title="Save" onClick={() => handleSaveEdit(index)}><FloppyDisk size={18}></FloppyDisk></button>
                            <button className="hover:scale-[1.2] hover:text-red-500" title="Cancel" onClick={() => handleEditClick(null)}><Prohibit size={18}></Prohibit></button>
                          </span>
                        ) : (
                          <button className="hover:scale-[1.2] hover:text-blue-500" title="Edit" onClick={() => handleEditClick(index)}><PencilSimpleLine size={18} ></PencilSimpleLine></button>
                        )}
                        <X size={18} className="cursor-pointer hover:scale-[1.2] hover:text-red-500" title="Delete" onClick={() => handleDetailRemove(index)} />
                      </span>
                    </span>
                    {editingIndex === index ? (
                      <textarea
                        className="w-full p-1 mt-1 text-sm border border-gray-300 rounded-md"
                        value={editedParticular.description}
                        onChange={(e) => setEditedParticular({ ...editedParticular, description: e.target.value })}
                      />
                    ) : (
                      <p className="text-sm">{detail.description}</p>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex gap-1 p-3 border-gray-400 border rounded-md  hover:text-green-500" onClick={handleAddParticular}>
                <button className="text-sm text-center"> Add Particular</button>
                <Plus size={18} className="ml-auto cursor-pointer hover:scale-[1.2] hover:text-green-500" title="Add Particular" onClick={handleAddParticular} />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center h-full text-xl text-gray-600">
            <p>No request found.</p>
          </div>
        )}
      </div>
    </>
  );
};

export default SidebarView;
