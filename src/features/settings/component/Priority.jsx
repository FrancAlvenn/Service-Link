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

const Priority = () => {
  const {
    priorities,
    fetchPriorities,
    createPriority,
    updatePriority,
    deletePriority,
  } = useContext(SettingsContext);

  const [editIndex, setEditIndex] = useState(null);
  const [editValues, setEditValues] = useState({
    priority: "",
    description: "",
    color: "",
  });
  const [addingNew, setAddingNew] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [priorityToDelete, setPriorityToDelete] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [savingCreate, setSavingCreate] = useState(false);
  const [savingUpdate, setSavingUpdate] = useState(false);
  const [createError, setCreateError] = useState("");
  const [updateError, setUpdateError] = useState("");

  const [selectedRowId, setSelectedRowId] = useState(null);

  const tableRef = useRef(null);

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
    fetchPriorities();
  }, []);

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

  const handleAddPriority = () => {
    setEditIndex("new");
    setEditValues({ priority: "", description: "", color: "" });
    setAddingNew(true);
  };

  const handleEditPriority = (priority) => {
    setEditIndex(priority.id);
    setEditValues({
      priority: priority.priority,
      description: priority.description,
      color: priority.color || "",
    });
    setEditDialogOpen(true);
  };

  const handleChange = (e) => {
    setEditValues({ ...editValues, [e.target.name]: e.target.value });
  };

  const handleUpdatePriority = async (id) => {
    if (id === null || addingNew) {
      setSavingCreate(true);
      setCreateError("");
      try {
        await createPriority(editValues);
      } catch (e) {
        setCreateError("Failed to save priority. Please try again.");
      }
      setSavingCreate(false);
    } else {
      setSavingUpdate(true);
      setUpdateError("");
      try {
        await updatePriority(id, editValues);
      } catch (e) {
        setUpdateError("Failed to update priority. Please try again.");
      }
      setSavingUpdate(false);
      setEditDialogOpen(false);
    }
    resetEditState();
    fetchPriorities();
  };

  const handleCancelEdit = () => {
    resetEditState();
    setEditDialogOpen(false);
  };

  const resetEditState = () => {
    setEditIndex(null);
    setEditValues({ priority: "", description: "", color: "" });
    setAddingNew(false);
  };

  const openDeleteDialog = (id) => {
    setPriorityToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDeletePriority = async () => {
    if (priorityToDelete !== null) {
      await deletePriority(priorityToDelete);
      fetchPriorities();
    }
    setDeleteDialogOpen(false);
    setPriorityToDelete(null);
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setPriorityToDelete(null);
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

  const renderRow = (priority, index) => {
    const isEditing = editIndex === priority.id;

    return (
      <tr
        key={priority.id}
        className={`hover:bg-blue-50 text-sm text-gray-700 border-b border-gray-300 cursor-pointer ${
          selectedRowId === priority.id ? "bg-blue-200" : ""
        }`}
        onClick={() => setSelectedRowId(priority.id)}
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
              name="priority"
              value={editValues.priority}
              onChange={handleChange}
              className="w-full px-2 py-1 rounded-md border"
            />
          ) : (
            <Chip
              value={priority.priority}
              color={priority.color}
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
            priority.description
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
                style={{ backgroundColor: priority.color }}
              ></span>
              <span
                className="text-xs font-semibold"
                style={{ color: priority.color }}
              >
                {priority.color.charAt(0).toUpperCase() +
                  priority.color.slice(1)}
              </span>
            </span>
          )}
        </td>
      </tr>
    );
  };

  return (
    <>
      <Card className="shadow-none">
        <CardHeader floated={false} shadow={false} className="rounded-none ">
          <div>
            <Typography color="black" className="text-md font-bold">
              Manage Priorities
            </Typography>
            <Typography color="gray" className="mt-1 font-normal text-sm">
              View and manage the priorities in your system.
            </Typography>
          </div>
        </CardHeader>
        <CardBody className="overflow-x-auto px-4 py-2" ref={tableRef}>
          <div className="flex flex-col gap-6 mb-6">
            <div>
              <Typography className="text-sm font-semibold text-gray-700">Priority</Typography>
              <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-md flex flex-wrap items-center gap-3">
                <span className="text-sm text-gray-700">Name</span>
                <input
                  type="text"
                  name="priority"
                  value={editValues.priority}
                  onChange={handleChange}
                  className="w-fit px-3 py-2 text-sm bg-white border rounded-md"
                  aria-label="Priority"
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
                  handleUpdatePriority(null);
                }}
                disabled={
                  editValues.priority.trim() === "" ||
                  editValues.description.trim() === "" ||
                  editValues.color.trim() === ""
                }
              >
                {savingCreate ? "Saving..." : "Save Priority"}
              </Button>
            </div>
            {createError && (
              <Typography className="text-sm text-red-600" role="alert">{createError}</Typography>
            )}
          </div>

          <div className="flex flex-col gap-3" role="list" aria-label="Existing priorities">
            {priorities.length === 0 ? (
              <Typography className="text-sm text-gray-500">No priorities found.</Typography>
            ) : (
              priorities.map((pr) => (
                <div
                  key={pr.id}
                  role="listitem"
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-4 h-4 inline-block rounded-full" style={{ backgroundColor: pr.color }}></span>
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-700">Priority: <span className="font-semibold">{pr.priority}</span></span>
                      <span className="text-sm text-gray-700">Description: <span className="font-semibold">{pr.description}</span></span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outlined"
                      color="blue"
                      className="flex items-center gap-1 hover:bg-blue-50"
                      onClick={() => handleEditPriority(pr)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outlined"
                      color="red"
                      className="flex items_center gap-1 hover:bg-red-50"
                      onClick={() => openDeleteDialog(pr.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="overflow-y-auto max-h-[300px] hidden">
            <table className="min-w-full text-left border-l border-r border-b border-gray-300 rounded-md ">
              <thead className="sticky top-0 bg-gray-50 z-10">
                <tr className="bg-gray-50 text-sm font-semibold text-gray-600">
                  <th className="py-3 px-4 border-b">ID</th>
                  <th className="py-3 px-4 border-b">Priority</th>
                  <th className="py-3 px-4 border-b">Description</th>
                  <th className="py-3 px-4 border-b">Color</th>
                </tr>
              </thead>
              <tbody>
                {priorities.length > 0 &&
                  priorities.map((priority, idx) => renderRow(priority, idx))}
                {priorities.length === 0 && (
                  <tr>
                    <td colSpan="4" className="py-4 text-center text-gray-400">
                      No priorities found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center mt-4">
            <Button
              variant="outlined"
              color="blue"
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 flex items-center gap-2"
              onClick={handleAddPriority}
              disabled={editIndex !== null}
            >
              <Plus size={16} /> Add Priority
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} handler={cancelDelete}>
        <DialogHeader>Confirm Deletion</DialogHeader>
        <DialogBody>
          Are you sure you want to delete this priority? This action cannot be
          undone.
        </DialogBody>
        <DialogFooter>
          <Button variant="text" color="gray" onClick={cancelDelete}>
            Cancel
          </Button>
          <Button variant="filled" color="red" onClick={confirmDeletePriority}>
            Delete
          </Button>
        </DialogFooter>
      </Dialog>

      <Dialog open={editDialogOpen} handler={() => setEditDialogOpen(false)}>
        <DialogHeader>Edit Priority</DialogHeader>
        <DialogBody>
          <div className="flex flex-col gap-3">
            <label className="text-sm text-gray-700">Priority</label>
            <input
              type="text"
              name="priority"
              value={editValues.priority}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm bg-white border rounded-md"
              aria-label="Edit Priority"
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
            onClick={() => handleUpdatePriority(editIndex)}
            disabled={
              editValues.priority.trim() === "" ||
              editValues.description.trim() === "" ||
              editValues.color.trim() === ""
            }
          >
            {savingUpdate ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
};

export default Priority;
