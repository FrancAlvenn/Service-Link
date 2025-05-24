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
  };

  const handleChange = (e) => {
    setEditValues({ ...editValues, [e.target.name]: e.target.value });
  };

  const handleUpdatePosition = async (id) => {
    if (addingNew) {
      await createPosition(editValues);
    } else {
      await updatePosition(id, editValues);
    }
    resetEditState();
    fetchPositions();
  };

  const handleCancelEdit = () => {
    resetEditState();
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
          <div className="overflow-y-auto max-h-[300px]">
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

                {editIndex === "new" && (
                  <tr className="hover:bg-gray-50 text-sm text-gray-700 border-b border-gray-300">
                    <td className="py-3 px-4">{positions.length + 1}</td>
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        name="position"
                        value={editValues.position}
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
                      <input
                        type="number"
                        name="approval_level"
                        value={editValues.approval_level}
                        onChange={handleChange}
                        className="w-full px-2 py-1 rounded-md border"
                      />
                    </td>
                  </tr>
                )}

                {positions.length === 0 && editIndex !== "new" && (
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

            <div className="flex gap-2">
              {editIndex === "new" && (
                <>
                  <Button
                    color="green"
                    onClick={() => handleUpdatePosition(null)}
                    className="py-2 px-4"
                    disabled={
                      editValues.position === "" ||
                      editValues.description === "" ||
                      editValues.approval_level === ""
                    }
                  >
                    Save
                  </Button>
                  <Button
                    color="red"
                    onClick={handleCancelEdit}
                    className="py-2 px-4"
                  >
                    Cancel
                  </Button>
                </>
              )}

              {selectedRowId && editIndex !== null && editIndex !== "new" && (
                <>
                  <Button
                    color="green"
                    onClick={() => handleUpdatePosition(selectedRowId)}
                    className="py-2 px-4"
                  >
                    Update
                  </Button>
                  <Button
                    color="red"
                    onClick={handleCancelEdit}
                    className="py-2 px-4"
                    disabled={
                      editValues.position === "" ||
                      editValues.description === "" ||
                      editValues.approval_level === ""
                    }
                  >
                    Cancel
                  </Button>
                </>
              )}

              {selectedRowId && editIndex === null && (
                <>
                  <Button
                    color="blue"
                    onClick={() => {
                      const selected = positions.find(
                        (p) => p.id === selectedRowId
                      );
                      handleEditPosition(selected);
                    }}
                    className="py-2 px-4"
                  >
                    Edit
                  </Button>
                  <Button
                    color="red"
                    onClick={() => openDeleteDialog(selectedRowId)}
                    className="py-2 px-4"
                  >
                    Delete
                  </Button>
                </>
              )}
            </div>
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
    </>
  );
};

export default Position;
