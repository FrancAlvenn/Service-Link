import {
  FloppyDisk,
  PencilSimpleLine,
  Plus,
  Prohibit,
  X,
} from "@phosphor-icons/react";
import { useState } from "react";
import axios from "axios";
import { Button, Typography } from "@material-tailwind/react";
import ToastNotification from "../../../../utils/ToastNotification";

const ParticularsTab = ({
  request,
  setRequest,
  requestType,
  referenceNumber,
  fetchRequests,
  user,
  isAuthorized,
}) => {
  const [editingIndex, setEditingIndex] = useState(null);
  const [editedParticular, setEditedParticular] = useState({
    particulars: "",
    quantity: "",
    description: "",
  });

  const handleEditClick = (index) => {
    setEditingIndex(index);
    setEditedParticular({ ...request.details[index] });
  };

  const handleSaveEdit = async (index) => {
    const updatedDetails = [...request.details];
    updatedDetails[index] = editedParticular;
    setRequest((prevRequest) => ({
      ...prevRequest,
      details: updatedDetails,
    }));

    try {
      const res = await axios.put(
        `${process.env.REACT_APP_API_URL}/${requestType}/${referenceNumber}`,
        {
          requester: user.reference_number,
          details: updatedDetails,
        },
        { withCredentials: true }
      );

      if (res.status === 200) {
        fetchRequests();
        ToastNotification.success("Success!", res.data.message);
      }
    } catch (error) {
      ToastNotification.error("Error!", "Failed to update details.");
    }

    setEditingIndex(null);
  };

  const handleDetailRemove = async (index) => {
    const updatedDetails = [...request.details];
    updatedDetails.splice(index, 1);
    setRequest((prevRequest) => ({
      ...prevRequest,
      details: updatedDetails,
    }));

    try {
      const res = await axios.put(
        `${process.env.REACT_APP_API_URL}/${requestType}/${referenceNumber}`,
        {
          requester: user.reference_number,
          details: updatedDetails,
        },
        { withCredentials: true }
      );

      if (res.status === 200) {
        fetchRequests();
        ToastNotification.success("Success!", res.data.message);
      }
    } catch (error) {
      ToastNotification.error("Error!", "Failed to update details.");
    }
  };

  const handleAddParticular = () => {
    const newDetail = { particulars: "", quantity: 0, description: "" };
    setRequest((prevRequest) => ({
      ...prevRequest,
      details: [...prevRequest.details, newDetail],
    }));
  };

  return (
    <div className="flex flex-col gap-4 p-3 mb-3 border-gray-400 border rounded-md">
      <p className="text-sm font-semibold text-gray-600">Particulars</p>

      <table className="table-auto rounded-lg  -gray-300 w-full text-sm">
        <thead>
          {request.details.length > 0 && (
            <tr className="bg-gray-100 text-left">
              <th className="p-2">Item</th>
              <th className="p-2">Quantity</th>
              <th className="p-2">Description</th>
              {isAuthorized && <th className=" p-2">Actions</th>}
            </tr>
          )}
        </thead>
        <tbody>
          {request.details.length === 0 ? (
            <tr>
              <td
                colSpan={isAuthorized ? 4 : 3}
                className="text-center py-4 text-gray-500 italic"
              >
                No Particulars
              </td>
            </tr>
          ) : (
            request.details.map((detail, index) => (
              <tr key={index} className="-t">
                {/* Particulars */}
                <td className="p-3">
                  {isAuthorized && editingIndex === index ? (
                    <input
                      type="text"
                      className="w-full p-1 -gray-300 rounded font-normal"
                      value={editedParticular.particulars}
                      onChange={(e) =>
                        setEditedParticular({
                          ...editedParticular,
                          particulars: e.target.value,
                        })
                      }
                    />
                  ) : (
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-normal"
                    >
                      {detail.particulars}
                    </Typography>
                  )}
                </td>

                {/* Quantity */}
                <td className="p-3">
                  {isAuthorized && editingIndex === index ? (
                    <input
                      type="number"
                      className="w-full p-1 -gray-300 rounded"
                      value={editedParticular.quantity}
                      onChange={(e) =>
                        setEditedParticular({
                          ...editedParticular,
                          quantity: e.target.value,
                        })
                      }
                    />
                  ) : (
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-normal"
                    >
                      {detail.quantity}
                    </Typography>
                  )}
                </td>

                {/* Description */}
                <td className="p-3">
                  {isAuthorized && editingIndex === index ? (
                    <textarea
                      className="w-full p-1 -gray-300 rounded"
                      value={editedParticular.description}
                      onChange={(e) =>
                        setEditedParticular({
                          ...editedParticular,
                          description: e.target.value,
                        })
                      }
                    />
                  ) : (
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-normal"
                    >
                      {detail.description}
                    </Typography>
                  )}
                </td>

                {/* Actions */}
                {/* {isAuthorized && (
                  <td className="p-3 w-full flex items-center">
                    {editingIndex === index ? (
                      <div className="flex gap-2 justify-center">
                        <button
                          className="text-green-600 hover:scale-110"
                          title="Save"
                          onClick={() => handleSaveEdit(index)}
                        >
                          <FloppyDisk size={18} />
                        </button>
                        <button
                          className="text-red-500 hover:scale-110"
                          title="Cancel"
                          onClick={() => setEditingIndex(null)}
                        >
                          <Prohibit size={18} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2 justify-center">
                        <button
                          className="text-blue-500 hover:scale-110"
                          title="Edit"
                          onClick={() => handleEditClick(index)}
                        >
                          <PencilSimpleLine size={18} />
                        </button>
                        <button
                          className="text-red-500 hover:scale-110"
                          title="Delete"
                          onClick={() => handleDetailRemove(index)}
                        >
                          <X size={18} />
                        </button>
                      </div>
                    )}
                  </td>
                )} */}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* {isAuthorized && (
        <Button
          variant="outlined"
          size="sm"
          className="mt-3 flex items-center gap-2 text-green-600  p-2 rounded-lg border border-green-500  hover:bg-green-50 w-fit"
          onClick={handleAddParticular}
        >
          <Plus size={16} />
          Add Particular
        </Button>
      )} */}
    </div>
  );
};

export default ParticularsTab;
