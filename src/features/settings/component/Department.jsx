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

  const [selectedRowId, setSelectedRowId] = useState(null);

  const tableRef = useRef(null);

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
      await deleteDepartment(deptToDelete);
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
    <>
      <Card className="shadow-none">
        <CardHeader floated={false} shadow={false} className="rounded-none ">
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
          <div className="overflow-y-auto max-h-[300px]">
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
            <Button
              variant="outlined"
              color="blue"
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 flex items-center gap-2"
              onClick={handleAddDepartment}
              disabled={editIndex !== null}
            >
              <Plus size={16} /> Add Department
            </Button>

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
            Delete
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
};

export default Department;
