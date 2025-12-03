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

const Department = () => {
  const {
    departments,
    fetchDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
  } = useContext(SettingsContext);

  const [editIndex, setEditIndex] = useState(null);
  const [editValues, setEditValues] = useState({ name: "", description: "" });
  const [addingNew, setAddingNew] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deptToDelete, setDeptToDelete] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [savingCreate, setSavingCreate] = useState(false);
  const [savingUpdate, setSavingUpdate] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [createError, setCreateError] = useState("");
  const [updateError, setUpdateError] = useState("");

  const [selectedRowId, setSelectedRowId] = useState(null);

  const tableRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    fetchDepartments();
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

  const handleAddDepartment = () => {
    setEditIndex("new");
    setEditValues({ name: "", description: "" });
    setAddingNew(true);
  };

  const handleEditDepartment = (dept) => {
    setEditIndex(dept.id);
    setEditValues({ name: dept.name, description: dept.description });
  };

  const handleChange = (e) => {
    setEditValues({ ...editValues, [e.target.name]: e.target.value });
    console.log(editValues);
  };

  const handleUpdateDepartment = async (id) => {
    if (addingNew) {
      await createDepartment(editValues);
    } else {
      await updateDepartment(id, editValues);
    }
    resetEditState();
    fetchDepartments();
  };

  const handleCancelEdit = () => {
    resetEditState();
  };

  const resetEditState = () => {
    setEditIndex(null);
    setEditValues({ name: "", description: "" });
    setAddingNew(false);
  };

  const openDeleteDialog = (id) => {
    setDeptToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteDepartment = async () => {
    if (deptToDelete !== null) {
      setDeleting(true);
      await deleteDepartment(deptToDelete);
      setDeleting(false);
      fetchDepartments();
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
              name="name"
              value={editValues.name}
              onChange={handleChange}
              className="w-full px-2 py-1 rounded-md border"
            />
          ) : (
            <Chip
              value={dept.name}
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
    <div className="w-full p-4 border border-gray-200 rounded-lg bg-white shadow-sm mb-4 min-h-full">
      <Card className="shadow-none">
        <CardHeader floated={false} shadow={false} className="rounded-none flex justify-between items-center flex-wrap gap-2">
          <div>
            <Typography color="black" className="text-md font-bold">
              Manage Departments
            </Typography>
            <Typography color="gray" className="mt-1 font-normal text-sm">
              View and manage the departments in your system.
            </Typography>
          </div>
        </CardHeader>
        <CardBody className="overflow-x-auto px-4 py-2" ref={tableRef}>
          <div className="flex flex-col gap-6 mb-6">
            <div>
              <Typography className="text-sm font-semibold text-gray-700">Department</Typography>
              <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-md flex flex-wrap items-center gap-3">
                <span className="text-sm text-gray-700">Name</span>
                <input
                  type="text"
                  name="name"
                  value={editValues.name}
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
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="text" color="gray" onClick={handleCancelEdit}>Reset</Button>
              <Button
                color="green"
                onClick={async () => {
                  if (editValues.name.trim() === "" || editValues.description.trim() === "") return;
                  setSavingCreate(true);
                  setCreateError("");
                  try {
                    await createDepartment(editValues);
                  } catch (e) {
                    setCreateError("Failed to save department. Please try again.");
                  }
                  setSavingCreate(false);
                  resetEditState();
                  fetchDepartments();
                }}
                disabled={editValues.name.trim() === "" || editValues.description.trim() === ""}
              >
                {savingCreate ? "Saving..." : "Save Department"}
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
              aria-label="Existing departments"
              tabIndex={0}
              onKeyDown={handleListKeyDown}
              ref={listRef}
            >
              {departments.length === 0 ? (
                <Typography className="text-sm text-gray-500">No departments found.</Typography>
              ) : (
                departments.map((dept) => (
                  <div
                    key={dept.id}
                    role="listitem"
                    tabIndex={-1}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-700">Department: <span className="font-semibold">{dept.name}</span></span>
                      <span className="text-sm text-gray-700">Description: <span className="font-semibold">{dept.description}</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outlined"
                        color="blue"
                        className="flex items-center gap-1 hover:bg-blue-50"
                        onClick={() => {
                          setEditIndex(dept.id);
                          setEditValues({ name: dept.name, description: dept.description });
                          setEditDialogOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outlined"
                        color="red"
                        className="flex items-center gap-1 hover:bg-red-50"
                        onClick={() => openDeleteDialog(dept.id)}
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
                  <th className="py-3 px-4 border-b">Department</th>
                  <th className="py-3 px-4 border-b">Description</th>
                </tr>
              </thead>
              <tbody>
                {departments.length > 0 &&
                  departments.map((dept, idx) => renderRow(dept, idx))}

                {editIndex === "new" && (
                  <tr className="hover:bg-gray-50 text-sm text-gray-700 border-b border-gray-300">
                    <td className="py-3 px-4">{departments.length + 1}</td>
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        name="name"
                        value={editValues.name}
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
                  </tr>
                )}

                {departments.length === 0 && editIndex !== "new" && (
                  <tr>
                    <td colSpan="4" className="py-4 text-center text-gray-400">
                      No departments found.
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
              onClick={handleAddDepartment}
              disabled={editIndex !== null}
            >
              <Plus size={16} /> Add Department
            </Button> */}

            <div className="flex gap-2">
              {editIndex === "new" && (
                <>
                  <Button
                    color="green"
                    onClick={() => handleUpdateDepartment(null)}
                    className="py-2 px-4"
                    disabled={
                      editValues.name === "" ||
                      editValues.description === "" ||
                      editValues.color === ""
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
                    onClick={() => handleUpdateDepartment(selectedRowId)}
                    className="py-2 px-4"
                  >
                    Update
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

              {selectedRowId && editIndex === null && (
                <>
                  <Button
                    color="blue"
                    onClick={() => {
                      const selected = departments.find(
                        (p) => p.id === selectedRowId
                      );
                      handleEditDepartment(selected);
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
          Are you sure you want to delete this department? This action cannot be
          undone.
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
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </Dialog>

      <Dialog open={editDialogOpen} handler={() => setEditDialogOpen(false)}>
        <DialogHeader>Edit Department</DialogHeader>
        <DialogBody>
          <div className="flex flex-col gap-6">
            <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-md flex flex-wrap items-center gap-3">
              <span className="text-sm text-gray-700">Name</span>
              <input
                type="text"
                name="name"
                value={editValues.name}
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
            </div>
          </div>
        </DialogBody>
        <DialogFooter className="flex gap-2">
          <Button variant="text" color="gray" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button
            color="green"
            onClick={async () => {
              if (editValues.name.trim() === "" || editValues.description.trim() === "") return;
              setSavingUpdate(true);
              setUpdateError("");
              try {
                await updateDepartment(editIndex, editValues);
              } catch (e) {
                setUpdateError("Failed to save changes. Please try again.");
              }
              setSavingUpdate(false);
              setEditDialogOpen(false);
              setEditIndex(null);
              fetchDepartments();
            }}
            disabled={editValues.name.trim() === "" || editValues.description.trim() === "" || savingUpdate}
          >
            {savingUpdate ? "Saving..." : "Save"}
          </Button>
          {updateError && (
            <Typography className="text-sm text-red-600" role="alert">{updateError}</Typography>
          )}
        </DialogFooter>
      </Dialog>
    </div>
  );
};

export default Department;
