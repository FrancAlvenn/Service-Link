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

const Designation = () => {
  const {
    designations,
    fetchDesignations,
    createDesignation,
    updateDesignation,
    deleteDesignation,
  } = useContext(SettingsContext);

  const [editIndex, setEditIndex] = useState(null);
  const [editValues, setEditValues] = useState({ designation: "", description: "" });
  const [addingNew, setAddingNew] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [savingCreate, setSavingCreate] = useState(false);
  const [savingUpdate, setSavingUpdate] = useState(false);
  const [createError, setCreateError] = useState("");
  const [updateError, setUpdateError] = useState("");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deptToDelete, setDeptToDelete] = useState(null);

  const [selectedRowId, setSelectedRowId] = useState(null);

  const tableRef = useRef(null);

  const isProtectedDesignation = [1, 2, 3].includes(selectedRowId);

  useEffect(() => {
    fetchDesignations();
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

  const handleAddDepartment = () => {
    setEditIndex("new");
    setEditValues({ designation: "", description: "" });
    setAddingNew(true);
  };

  const handleEditDepartment = (dept) => {
    setEditIndex(dept.id);
    setEditValues({ designation: dept.designation, description: dept.description });
    setEditDialogOpen(true);
  };

  const handleChange = (e) => {
    setEditValues({ ...editValues, [e.target.name]: e.target.value });
  };

  const handleUpdateDepartment = async (id) => {
    if (id === null || addingNew) {
      setSavingCreate(true);
      setCreateError("");
      try {
        await createDesignation(editValues);
      } catch (e) {
        setCreateError("Failed to save designation. Please try again.");
      }
      setSavingCreate(false);
    } else {
      setSavingUpdate(true);
      setUpdateError("");
      try {
        await updateDesignation(id, editValues);
      } catch (e) {
        setUpdateError("Failed to update designation. Please try again.");
      }
      setSavingUpdate(false);
      setEditDialogOpen(false);
    }
    resetEditState();
    fetchDesignations();
  };

  const handleCancelEdit = () => {
    resetEditState();
    setEditDialogOpen(false);
  };

  const resetEditState = () => {
    setEditIndex(null);
    setEditValues({ designation: "", description: "" });
    setAddingNew(false);
  };

  const openDeleteDialog = (id) => {
    setDeptToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteDepartment = async () => {
    if (deptToDelete !== null) {
      await deleteDesignation(deptToDelete);
      fetchDesignations();
    }
    setDeleteDialogOpen(false);
    setDeptToDelete(null);
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setDeptToDelete(null);
  };

  const renderRow = (dept, index) => {
    const isEditing = editIndex === dept.id;

    return (
      <tr
        key={dept.id}
        className={`hover:bg-blue-50 text-sm text-gray-700 border-b border-gray-300 cursor-pointer ${
          selectedRowId === dept.id ? "bg-blue-200" : ""
        }`}
        onClick={() => setSelectedRowId(dept.id)}
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
              name="designation"
              value={editValues.designation}
              onChange={handleChange}
              className="w-full px-2 py-1 rounded-md border"
            />
          ) : (
            <Chip
              value={dept.designation}
              color="cyan"
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
            dept.description
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
              Manage Designations
            </Typography>
            <Typography color="gray" className="mt-1 font-normal text-sm">
              View and manage the designations in your system.
            </Typography>
          </div>
        </CardHeader>
        <CardBody className="overflow-x-auto px-4 py-2" ref={tableRef}>
          <div className="flex flex-col gap-6 mb-6">
            <div>
              <Typography className="text-sm font-semibold text-gray-700">Designation</Typography>
              <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-md flex flex-wrap items-center gap-3">
                <span className="text-sm text-gray-700">Name</span>
                <input
                  type="text"
                  name="designation"
                  value={editValues.designation}
                  onChange={handleChange}
                  className="w-fit px-3 py-2 text-sm bg-white border rounded-md"
                  aria-label="Designation"
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
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="text" color="gray" onClick={handleCancelEdit}>Reset</Button>
              <Button
                color="green"
                onClick={() => {
                  handleUpdateDepartment(null);
                }}
                disabled={editValues.designation.trim() === "" || editValues.description.trim() === ""}
              >
                {savingCreate ? "Saving..." : "Save Designation"}
              </Button>
            </div>
            {createError && (
              <Typography className="text-sm text-red-600" role="alert">{createError}</Typography>
            )}
          </div>

          <div className="flex flex-col gap-3" role="list" aria-label="Existing designations">
            {designations.length === 0 ? (
              <Typography className="text-sm text-gray-500">No designations found.</Typography>
            ) : (
              designations.map((dept) => {
                const protectedItem = [1, 2, 3].includes(dept.id);
                return (
                  <div
                    key={dept.id}
                    role="listitem"
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-700">Designation: <span className="font-semibold">{dept.designation}</span></span>
                      <span className="text-sm text-gray-700">Description: <span className="font-semibold">{dept.description}</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outlined"
                        color="blue"
                        className="flex items-center gap-1 hover:bg-blue-50"
                        onClick={() => handleEditDepartment(dept)}
                        disabled={protectedItem}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outlined"
                        color="red"
                        className="flex items-center gap-1 hover:bg-red-50"
                        onClick={() => openDeleteDialog(dept.id)}
                        disabled={protectedItem}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="overflow-y-auto max-h-[300px] hidden">
            <table className="min-w-full text-left border-l border-r border-b border-gray-300 rounded-md ">
              <thead className="sticky top-0 bg-gray-50 z-10">
                <tr className="bg-gray-50 text-sm font-semibold text-gray-600">
                  <th className="py-3 px-4 border-b">ID</th>
                  <th className="py-3 px-4 border-b">Designation</th>
                  <th className="py-3 px-4 border-b">Description</th>
                </tr>
              </thead>
              <tbody>
                {designations.length > 0 &&
                  designations.map((dept, idx) => renderRow(dept, idx))}

                {designations.length === 0 && (
                  <tr>
                    <td colSpan="4" className="py-4 text-center text-gray-400">
                      No designations found.
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
              onClick={handleAddDepartment}
              disabled={editIndex !== null}
            >
              <Plus size={16} /> Add Designation
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} handler={cancelDelete}>
        <DialogHeader>Confirm Deletion</DialogHeader>
        <DialogBody>
          Are you sure you want to delete this designation? This action cannot
          be undone.
        </DialogBody>
        <DialogFooter className="flex gap-2">
          <Button variant="text" color="gray" onClick={cancelDelete}>
            Cancel
          </Button>
          <Button
            variant="filled"
            color="red"
            onClick={confirmDeleteDepartment}
          >
            Delete
          </Button>
        </DialogFooter>
      </Dialog>

      <Dialog open={editDialogOpen} handler={() => setEditDialogOpen(false)}>
        <DialogHeader>Edit Designation</DialogHeader>
        <DialogBody>
          <div className="flex flex-col gap-3">
            <label className="text-sm text-gray-700">Designation</label>
            <input
              type="text"
              name="designation"
              value={editValues.designation}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm bg-white border rounded-md"
              aria-label="Edit Designation"
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
            onClick={() => handleUpdateDepartment(editIndex)}
            disabled={editValues.designation.trim() === "" || editValues.description.trim() === ""}
          >
            {savingUpdate ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
};

export default Designation;
