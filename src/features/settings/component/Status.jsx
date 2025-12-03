import { useContext, useEffect, useRef, useState } from "react";
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
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [savingCreate, setSavingCreate] = useState(false);
  const [savingUpdate, setSavingUpdate] = useState(false);
  const [createError, setCreateError] = useState("");
  const [updateError, setUpdateError] = useState("");

  const [selectedRowId, setSelectedRowId] = useState(null);

  const tableRef = useRef(null);
  const listRef = useRef(null);

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

  const handleListKeyDown = (e) => {
    const container = listRef.current;
    if (!container) return;
    const items = Array.from(container.querySelectorAll('[role="listitem"]'));
    const currentIndex = items.findIndex((el) => el === document.activeElement);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = items[Math.min(currentIndex + 1, items.length - 1)] || items[0];
      next && next.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = items[Math.max(currentIndex - 1, 0)] || items[items.length - 1];
      prev && prev.focus();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tableRef.current && !tableRef.current.contains(event.target)) {
        setSelectedRowId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
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
    setEditDialogOpen(true);
  };

  const handleChange = (e) => {
    setEditValues({ ...editValues, [e.target.name]: e.target.value });
  };

  const handleUpdateStatus = async (id) => {
    if (id === null || addingNew) {
      setSavingCreate(true);
      setCreateError("");
      try {
        await createStatus(editValues);
      } catch (e) {
        setCreateError("Failed to save status. Please try again.");
      }
      setSavingCreate(false);
    } else {
      setSavingUpdate(true);
      setUpdateError("");
      try {
        await updateStatus(id, editValues);
      } catch (e) {
        setUpdateError("Failed to update status. Please try again.");
      }
      setSavingUpdate(false);
      setEditDialogOpen(false);
    }
    resetEditState();
    fetchStatuses();
  };

  const handleCancelEdit = () => {
    resetEditState();
    setEditDialogOpen(false);
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
        className={`hover:bg-blue-50 text-sm text-gray-700 border-b border-gray-300 cursor-pointer ${
          selectedRowId === status.id ? "bg-blue-200" : ""
        }`}
        onClick={() => setSelectedRowId(status.id)}
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
      </tr>
    );
  };

  return (
    <div className="w-full p-4 border border-gray-200 rounded-lg bg-white shadow-sm mb-4 h-full">
      <Card className="shadow-none">
        <CardHeader floated={false} shadow={false} className="rounded-none ">
          <div>
            <Typography color="black" className="text-md font-bold">
              Manage Statuses
            </Typography>
            <Typography color="gray" className="mt-1 font-normal text-sm">
              View and manage the statuses in your system.
            </Typography>
          </div>
        </CardHeader>
        <CardBody className="overflow-x-auto px-4 py-2" ref={tableRef}>
          <div className="flex flex-col gap-6 mb-6">
            <div>
              <Typography className="text-sm font-semibold text-gray-700">Status</Typography>
              <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-md flex flex-wrap items-center gap-3">
                <span className="text-sm text-gray-700">Name</span>
                <input
                  type="text"
                  name="status"
                  value={editValues.status}
                  onChange={handleChange}
                  className="w-fit px-3 py-2 text-sm bg-white border rounded-md"
                  aria-label="Status"
                />
                <span className="text-sm text-gray-700">Description</span>
                <input
                  type="text"
                  name="description"
                  value={editValues.description}
                  onChange={handleChange}
                  className="w-fit px-3 py-2 text-sm bg-white border rounded-md"
                  aria-label="Description"
                />
                <span className="text-sm text-gray-700">Color</span>
                <ColorPickerMenu
                  selectedColor={editValues.color}
                  onSelect={(color) => setEditValues({ ...editValues, color })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="text" color="gray" onClick={handleCancelEdit}>Reset</Button>
              <Button
                color="green"
                onClick={() => {
                  handleUpdateStatus(null);
                }}
                disabled={
                  editValues.status.trim() === "" ||
                  editValues.description.trim() === "" ||
                  editValues.color.trim() === ""
                }
              >
                {savingCreate ? "Saving..." : "Save Status"}
              </Button>
            </div>
            {createError && (
              <Typography className="text-sm text-red-600" role="alert">{createError}</Typography>
            )}
          </div>

          <div className="relative">
            <div aria-hidden="true" className="absolute top-0 left-0 right-0 h-4 pointer-events-none bg-gradient-to-b from-white to-transparent" />
            <div aria-hidden="true" className="absolute bottom-0 left-0 right-0 h-4 pointer-events-none bg-gradient-to-t from-white to-transparent" />
            <div
              className="flex flex-col gap-3 overflow-y-auto max-h-[40vh] scrollbar-thin scrollbar-thumb-gray-300 focus:outline-none"
              role="list"
              aria-label="Existing statuses"
              tabIndex={0}
              onKeyDown={handleListKeyDown}
              ref={listRef}
            >
              {statuses.length === 0 ? (
                <Typography className="text-sm text-gray-500">No statuses found.</Typography>
              ) : (
                statuses.map((st) => (
                  <div
                    key={st.id}
                    role="listitem"
                    tabIndex={-1}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-4 h-4 inline-block rounded-full" style={{ backgroundColor: st.color }}></span>
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-700">Status: <span className="font-semibold">{st.status}</span></span>
                        <span className="text-sm text-gray-700">Description: <span className="font-semibold">{st.description}</span></span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outlined"
                        color="blue"
                        className="flex items-center gap-1 hover:bg-blue-50"
                        onClick={() => handleEditStatus(st)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outlined"
                        color="red"
                        className="flex items-center gap-1 hover:bg-red-50"
                        onClick={() => openDeleteDialog(st.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="overflow-y-auto max-h-[300px] hidden">
            <table className="min-w-full text-left border-l border-r border-b border-gray-300 rounded-md ">
              <thead className="sticky top-0 bg-gray-50 z-10">
                <tr className="bg-gray-50 text-sm font-semibold text-gray-600">
                  <th className="py-3 px-4 border-b">ID</th>
                  <th className="py-3 px-4 border-b">Status</th>
                  <th className="py-3 px-4 border-b">Description</th>
                  <th className="py-3 px-4 border-b">Color</th>
                </tr>
              </thead>
              <tbody>
                {statuses.length > 0 &&
                  statuses.map((status, idx) => renderRow(status, idx))}
                {statuses.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-4 text-center text-gray-400">
                      No statuses found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center mt-4">
            {/* <Button
              variant="outlined"
              color="blue"
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 flex items-center gap-2"
              onClick={handleAddStatus}
              disabled={editIndex !== null}
            >
              <Plus size={16} /> Add Status
            </Button> */}
          </div>
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

      <Dialog open={editDialogOpen} handler={() => setEditDialogOpen(false)}>
        <DialogHeader>Edit Status</DialogHeader>
        <DialogBody>
          <div className="flex flex-col gap-3">
            <label className="text-sm text-gray-700">Status</label>
            <input
              type="text"
              name="status"
              value={editValues.status}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm bg-white border rounded-md"
              aria-label="Edit Status"
            />
            <label className="text-sm text-gray-700">Description</label>
            <input
              type="text"
              name="description"
              value={editValues.description}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm bg-white border rounded-md"
              aria-label="Edit Description"
            />
            <label className="text-sm text-gray-700">Color</label>
            <ColorPickerMenu
              selectedColor={editValues.color}
              onSelect={(color) => setEditValues({ ...editValues, color })}
            />
            {updateError && (
              <Typography className="text-sm text-red-600" role="alert">{updateError}</Typography>
            )}
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="text" color="gray" onClick={() => setEditDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            color="green"
            onClick={() => handleUpdateStatus(editIndex)}
            disabled={
              editValues.status.trim() === "" ||
              editValues.description.trim() === "" ||
              editValues.color.trim() === ""
            }
          >
            {savingUpdate ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};

export default Status;
