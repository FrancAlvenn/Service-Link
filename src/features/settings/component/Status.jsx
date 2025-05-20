import { useContext, useEffect, useState } from "react";
import { SettingsContext } from "../context/SettingsContext";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Chip,
} from "@material-tailwind/react";
import { Plus } from "@phosphor-icons/react";

const Status = () => {
  const { statuses, fetchStatuses, createStatus, updateStatus, deleteStatus } =
    useContext(SettingsContext);

  const [editIndex, setEditIndex] = useState(null);
  const [editValues, setEditValues] = useState({
    status: "",
    description: "",
    color: "",
  });
  const [addingNew, setAddingNew] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statusToDelete, setStatusToDelete] = useState(null);

  const colorOptions = [
    "red",
    "blue",
    "green",
    "yellow",
    "pink",
    "orange",
    "purple",
    "gray",
    "teal",
    "indigo",
    "cyan",
  ];

  useEffect(() => {
    fetchStatuses();
  }, []);

  const handleAddStatus = () => {
    setEditIndex("new");
    setEditValues({ status: "", description: "", color: "" });
    setAddingNew(true);
  };

  const handleEditStatus = (status) => {
    setEditIndex(status.id);
    setEditValues({
      status: status.status,
      description: status.description,
      color: status.color || "",
    });
  };

  const handleChange = (e) => {
    setEditValues({ ...editValues, [e.target.name]: e.target.value });
  };

  const handleUpdateStatus = async (id) => {
    if (addingNew) {
      await createStatus(editValues);
    } else {
      await updateStatus(id, editValues);
    }
    resetEditState();
    fetchStatuses();
  };

  const handleCancelEdit = () => {
    resetEditState();
  };

  const resetEditState = () => {
    setEditIndex(null);
    setEditValues({ status: "", description: "", color: "" });
    setAddingNew(false);
  };

  const openDeleteDialog = (id) => {
    setStatusToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteStatus = async () => {
    if (statusToDelete !== null) {
      await deleteStatus(statusToDelete);
      fetchStatuses();
    }
    setDeleteDialogOpen(false);
    setStatusToDelete(null);
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setStatusToDelete(null);
  };

  const ColorPickerMenu = ({ selectedColor, onSelect }) => (
    <Menu placement="bottom-start">
      <MenuHandler>
        <button
          className="w-6 h-6 rounded-full border border-gray-400"
          style={{ backgroundColor: selectedColor || "transparent" }}
          title={selectedColor || "Select color"}
        />
      </MenuHandler>
      <MenuList className="grid grid-cols-2 gap-2 p-2">
        {colorOptions.map((color) => (
          <MenuItem key={color} onClick={() => onSelect(color)} className="p-0">
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full border border-gray-300 hover:scale-110 transition-transform`}
                style={{ backgroundColor: color }}
                title={color.charAt(0).toUpperCase() + color.slice(1)}
              ></div>
              {color.charAt(0).toUpperCase() + color.slice(1)}
            </div>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );

  const renderRow = (status, index) => {
    const isEditing = editIndex === status.id;

    return (
      <tr
        key={status.id}
        className="hover:bg-gray-50 text-sm text-gray-700 border-b border-gray-300"
      >
        <td className="py-3 px-4">
          <Chip
            value={index + 1}
            color="blue"
            className="flex items-center py-2 justify-center text-white w-fit rounded-full"
          />
        </td>
        <td className="py-3 px-4">
          {isEditing ? (
            <input
              type="text"
              name="status"
              value={editValues.status}
              onChange={handleChange}
              className="w-full px-2 py-1 rounded-md border"
            />
          ) : (
            <Chip
              value={status.status}
              color={status.color}
              className="mr-2 text-white w-fit"
            />
          )}
        </td>
        <td className="py-3 px-4">
          {isEditing ? (
            <input
              type="text"
              name="description"
              value={editValues.description}
              onChange={handleChange}
              className="w-full px-2 py-1 rounded-md border"
            />
          ) : (
            status.description
          )}
        </td>
        <td className="py-3 px-4">
          {isEditing ? (
            <ColorPickerMenu
              selectedColor={editValues.color}
              onSelect={(color) => setEditValues({ ...editValues, color })}
            />
          ) : (
            <span className="flex items-center gap-2">
              <span
                className="w-4 h-4 inline-block rounded-full"
                style={{ backgroundColor: status.color }}
              ></span>
              <span
                className="text-xs font-semibold"
                style={{ color: status.color }}
              >
                {status.color.charAt(0).toUpperCase() + status.color.slice(1)}
              </span>
            </span>
          )}
        </td>
        <td className="py-3 px-4">
          {isEditing ? (
            <div className="flex gap-2 items-center">
              <button
                className="text-green-600 hover:underline font-semibold"
                onClick={() => handleUpdateStatus(status.id)}
              >
                Update
              </button>
              <button
                className="text-gray-500 hover:underline font-semibold"
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex gap-3 items-center">
              <button
                className="text-blue-500 hover:underline font-semibold"
                onClick={() => handleEditStatus(status)}
              >
                Edit
              </button>
              <button
                className="text-red-500 hover:underline font-semibold"
                onClick={() => openDeleteDialog(status.id)}
              >
                Delete
              </button>
            </div>
          )}
        </td>
      </tr>
    );
  };

  return (
    <>
      <Card className="shadow-none">
        <CardHeader
          floated={false}
          shadow={false}
          className="rounded-none pb-2 border-b"
        >
          <div>
            <Typography color="black" className="text-md font-bold">
              Manage Statuses
            </Typography>
            <Typography color="gray" className="mt-1 font-normal text-sm">
              View and manage the statuses in your system.
            </Typography>
          </div>
        </CardHeader>
        <CardBody className="overflow-x-auto px-4 py-2">
          <div className="overflow-y-auto max-h-[300px]">
            <table className="min-w-full text-left border-l border-r border-b border-gray-300 rounded-md ">
              <thead className="sticky top-0 bg-gray-50 z-10">
                <tr className="bg-gray-50 text-sm font-semibold text-gray-600">
                  <th className="py-3 px-4 border-b">ID</th>
                  <th className="py-3 px-4 border-b">Status</th>
                  <th className="py-3 px-4 border-b">Description</th>
                  <th className="py-3 px-4 border-b">Color</th>
                  <th className="py-3 px-4 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {statuses.length > 0 &&
                  statuses.map((status, idx) => renderRow(status, idx))}

                {editIndex === "new" && (
                  <tr className="hover:bg-gray-50 text-sm text-gray-700 border-b border-gray-300">
                    <td className="py-3 px-4">{statuses.length + 1}</td>
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        name="status"
                        value={editValues.status}
                        onChange={handleChange}
                        className="w-full px-2 py-1 rounded-md border"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        name="description"
                        value={editValues.description}
                        onChange={handleChange}
                        className="w-full px-2 py-1 rounded-md border"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <ColorPickerMenu
                        selectedColor={editValues.color}
                        onSelect={(color) =>
                          setEditValues({ ...editValues, color })
                        }
                      />
                    </td>
                    <td className="py-3 px-4 flex gap-2">
                      <button
                        className="text-green-600 hover:underline"
                        onClick={() => handleUpdateStatus(null)}
                      >
                        Save
                      </button>
                      <button
                        className="text-gray-500 hover:underline"
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                )}

                {statuses.length === 0 && editIndex !== "new" && (
                  <tr>
                    <td colSpan="5" className="py-4 text-center text-gray-400">
                      No statuses found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <Button
            variant="outlined"
            color="blue"
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 mt-4 flex items-center gap-2"
            onClick={handleAddStatus}
            disabled={editIndex !== null}
          >
            <Plus size={16} /> Add Status
          </Button>
        </CardBody>
      </Card>

      <Dialog open={deleteDialogOpen} handler={cancelDelete}>
        <DialogHeader>Confirm Deletion</DialogHeader>
        <DialogBody>
          Are you sure you want to delete this status? This action cannot be
          undone.
        </DialogBody>
        <DialogFooter>
          <Button variant="text" color="gray" onClick={cancelDelete}>
            Cancel
          </Button>
          <Button variant="filled" color="red" onClick={confirmDeleteStatus}>
            Delete
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
};

export default Status;
