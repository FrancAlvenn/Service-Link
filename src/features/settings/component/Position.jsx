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
  Chip,
} from "@material-tailwind/react";
import { Plus } from "@phosphor-icons/react";

const Position = () => {
  const {
    positions,
    fetchPositions,
    createPosition,
    updatePosition,
    deletePosition,
  } = useContext(SettingsContext);

  const [editIndex, setEditIndex] = useState(null);
  const [editValues, setEditValues] = useState({
    position: "",
    description: "",
    approval_level: "",
  });
  const [addingNew, setAddingNew] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [savingCreate, setSavingCreate] = useState(false);
  const [savingUpdate, setSavingUpdate] = useState(false);
  const [createError, setCreateError] = useState("");
  const [updateError, setUpdateError] = useState("");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [positionToDelete, setPositionToDelete] = useState(null);

  const [selectedRowId, setSelectedRowId] = useState(null);

  const tableRef = useRef(null);

  useEffect(() => {
    fetchPositions();
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

  const handleAddPosition = () => {
    setEditIndex("new");
    setEditValues({ position: "", description: "", approval_level: "" });
    setAddingNew(true);
  };

  const handleEditPosition = (position) => {
    setEditIndex(position.id);
    setEditValues({
      position: position.position,
      description: position.description,
      approval_level: position.approval_level,
    });
    setEditDialogOpen(true);
  };

  const handleChange = (e) => {
    setEditValues({ ...editValues, [e.target.name]: e.target.value });
  };

  const handleUpdatePosition = async (id) => {
    if (id === null || addingNew) {
      setSavingCreate(true);
      setCreateError("");
      try {
        await createPosition(editValues);
      } catch (e) {
        setCreateError("Failed to save position. Please try again.");
      }
      setSavingCreate(false);
    } else {
      setSavingUpdate(true);
      setUpdateError("");
      try {
        await updatePosition(id, editValues);
      } catch (e) {
        setUpdateError("Failed to update position. Please try again.");
      }
      setSavingUpdate(false);
      setEditDialogOpen(false);
    }
    resetEditState();
    fetchPositions();
  };

  const handleCancelEdit = () => {
    resetEditState();
    setEditDialogOpen(false);
  };

  const resetEditState = () => {
    setEditIndex(null);
    setEditValues({ position: "", description: "", approval_level: "" });
    setAddingNew(false);
  };

  const openDeleteDialog = (id) => {
    setPositionToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDeletePosition = async () => {
    if (positionToDelete !== null) {
      await deletePosition(positionToDelete);
      fetchPositions();
    }
    setDeleteDialogOpen(false);
    setPositionToDelete(null);
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setPositionToDelete(null);
  };

  const renderRow = (position, index) => {
    const isEditing = editIndex === position.id;

    return (
      <tr
        key={position.id}
        className={`hover:bg-blue-50 text-sm text-gray-700 border-b border-gray-300 cursor-pointer ${
          selectedRowId === position.id ? "bg-blue-200" : ""
        }`}
        onClick={() => setSelectedRowId(position.id)}
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
              name="position"
              value={editValues.position}
              onChange={handleChange}
              className="w-full px-2 py-1 rounded-md border"
            />
          ) : (
            <Chip
              value={position.position}
              color="cyan"
              className="text-white w-fit"
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
            position.description
          )}
        </td>
        <td className="py-3 px-4">
          {isEditing ? (
            <input
              type="number"
              name="approval_level"
              value={editValues.approval_level}
              onChange={handleChange}
              className="w-full px-2 py-1 rounded-md border"
            />
          ) : (
            <Chip
              value={position.approval_level}
              color="teal"
              className="flex items-center py-2 justify-center text-white w-fit rounded-full"
            />
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
              Manage Positions
            </Typography>
            <Typography color="gray" className="mt-1 font-normal text-sm">
              View and manage the positions in your system.
            </Typography>
          </div>
        </CardHeader>
        <CardBody className="overflow-x-auto px-4 py-2" ref={tableRef}>
          <div className="flex flex-col gap-6 mb-6">
            <div>
              <Typography className="text-sm font-semibold text-gray-700">Position</Typography>
              <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-md flex flex-wrap items-center gap-3">
                <span className="text-sm text-gray-700">Name</span>
                <input
                  type="text"
                  name="position"
                  value={editValues.position}
                  onChange={handleChange}
                  className="w-fit px-3 py-2 text-sm bg-white border rounded-md"
                  aria-label="Name"
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
                <span className="text-sm text-gray-700">Approval Level</span>
                <input
                  type="number"
                  name="approval_level"
                  value={editValues.approval_level}
                  onChange={handleChange}
                  className="w-24 px-3 py-2 text-sm bg-white border rounded-md"
                  aria-label="Approval Level"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="text" color="gray" onClick={handleCancelEdit}>Reset</Button>
              <Button
                color="green"
                onClick={() => {
                  handleUpdatePosition(null);
                }}
                disabled={
                  editValues.position.trim() === "" ||
                  editValues.description.trim() === "" ||
                  editValues.approval_level === ""
                }
              >
                {savingCreate ? "Saving..." : "Save Position"}
              </Button>
            </div>
            {createError && (
              <Typography className="text-sm text-red-600" role="alert">{createError}</Typography>
            )}
          </div>

          <div className="flex flex-col gap-3" role="list" aria-label="Existing positions">
            {positions.length === 0 ? (
              <Typography className="text-sm text-gray-500">No positions found.</Typography>
            ) : (
              positions.map((pos) => (
                <div
                  key={pos.id}
                  role="listitem"
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                >
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-700">Position: <span className="font-semibold">{pos.position}</span></span>
                    <span className="text-sm text-gray-700">Description: <span className="font-semibold">{pos.description}</span></span>
                    <span className="text-sm text-gray-700">Approval Level: <span className="font-semibold">{pos.approval_level}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outlined"
                      color="blue"
                      className="flex items-center gap-1 hover:bg-blue-50"
                      onClick={() => handleEditPosition(pos)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outlined"
                      color="red"
                      className="flex items-center gap-1 hover:bg-red-50"
                      onClick={() => openDeleteDialog(pos.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="overflow-y-auto max-h-[300px] hidden">
            <table className="min-w-full text-left border-l border-r border-b border-gray-300 rounded-md">
              <thead className="sticky top-0 bg-gray-50 z-10">
                <tr className="bg-gray-50 text-sm font-semibold text-gray-600">
                  <th className="py-3 px-4 border-b">ID</th>
                  <th className="py-3 px-4 border-b">Name</th>
                  <th className="py-3 px-4 border-b">Description</th>
                  <th className="py-3 px-4 border-b">Approval Level</th>
                </tr>
              </thead>
              <tbody>
                {positions.length > 0 &&
                  positions.map((position, idx) => renderRow(position, idx))}
                {positions.length === 0 && (
                  <tr>
                    <td colSpan="4" className="py-4 text-center text-gray-400">
                      No positions found.
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
              onClick={handleAddPosition}
              disabled={editIndex !== null}
            >
              <Plus size={16} /> Add Position
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} handler={cancelDelete}>
        <DialogHeader>Confirm Deletion</DialogHeader>
        <DialogBody>
          Are you sure you want to delete this position? This action cannot be
          undone.
        </DialogBody>
        <DialogFooter>
          <Button variant="text" color="gray" onClick={cancelDelete}>
            Cancel
          </Button>
          <Button variant="filled" color="red" onClick={confirmDeletePosition}>
            Delete
          </Button>
        </DialogFooter>
      </Dialog>

      <Dialog open={editDialogOpen} handler={() => setEditDialogOpen(false)}>
        <DialogHeader>Edit Position</DialogHeader>
        <DialogBody>
          <div className="flex flex-col gap-3">
            <label className="text-sm text-gray-700">Name</label>
            <input
              type="text"
              name="position"
              value={editValues.position}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm bg-white border rounded-md"
              aria-label="Edit Name"
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
            <label className="text-sm text-gray-700">Approval Level</label>
            <input
              type="number"
              name="approval_level"
              value={editValues.approval_level}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm bg-white border rounded-md"
              aria-label="Edit Approval Level"
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
            onClick={() => handleUpdatePosition(editIndex)}
            disabled={
              editValues.position.trim() === "" ||
              editValues.description.trim() === "" ||
              editValues.approval_level === ""
            }
          >
            {savingUpdate ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
};

export default Position;
