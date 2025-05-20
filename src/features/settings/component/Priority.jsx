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

  const handleAddPriority = () => {
    setEditIndex("new");
    setEditValues({ priority: "", description: "" });
    setAddingNew(true);
  };

  const handleEditPriority = (priority) => {
    setEditIndex(priority.id);
    setEditValues({
      priority: priority.priority,
      description: priority.description,
      color: priority.color || "",
    });
  };

  const handleChange = (e) => {
    setEditValues({ ...editValues, [e.target.name]: e.target.value });
  };

  const handleUpdatePriority = async (id) => {
    if (addingNew) {
      await createPriority(editValues);
    } else {
      await updatePriority(id, editValues);
    }
    resetEditState();
    fetchPriorities();
  };

  const handleCancelEdit = () => {
    resetEditState();
  };

  const resetEditState = () => {
    setEditIndex(null);
    setEditValues({ priority: "", description: "" });
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
        <td className="py-3 px-4">
          {isEditing ? (
            <div className="flex gap-2 items-center">
              <button
                className="text-green-600 hover:underline font-semibold"
                onClick={() => handleUpdatePriority(priority.id)}
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
                onClick={() => handleEditPriority(priority)}
              >
                Edit
              </button>
              <button
                className="text-red-500 hover:underline font-semibold"
                onClick={() => openDeleteDialog(priority.id)}
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
              Manage Priorities
            </Typography>
            <Typography color="gray" className="mt-1 font-normal text-sm">
              View and manage the priorities in your system.
            </Typography>
          </div>
        </CardHeader>
        <CardBody className="overflow-x-auto px-4 py-2">
          <div className="overflow-y-auto max-h-[300px]">
            <table className="min-w-full text-left border-l border-r border-b border-gray-300 rounded-md ">
              <thead className="sticky top-0 bg-gray-50 z-10">
                <tr className="bg-gray-50 text-sm font-semibold text-gray-600">
                  <th className="py-3 px-4 border-b">ID</th>
                  <th className="py-3 px-4 border-b">Priority</th>
                  <th className="py-3 px-4 border-b">Description</th>
                  <th className="py-3 px-4 border-b">Color</th>
                  <th className="py-3 px-4 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {priorities.length > 0 &&
                  priorities.map((priority, idx) => renderRow(priority, idx))}

                {editIndex === "new" && (
                  <tr className="hover:bg-gray-50 text-sm text-gray-700 border-b border-gray-300">
                    <td className="py-3 px-4">{priorities.length + 1}</td>
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        name="priority"
                        value={editValues.priority}
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
                        onClick={() => handleUpdatePriority(null)}
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

                {priorities.length === 0 && editIndex !== "new" && (
                  <tr>
                    <td colSpan="4" className="py-4 text-center text-gray-400">
                      No priorities found.
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
            onClick={handleAddPriority}
            disabled={editIndex !== null}
          >
            <Plus size={16} /> Add Priority
          </Button>
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
    </>
  );
};

export default Priority;
