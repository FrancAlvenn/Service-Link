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
  Chip,
} from "@material-tailwind/react";
import { Plus } from "@phosphor-icons/react";

const Approvers = () => {
  const {
    approvers,
    fetchApprovers,
    createApprover,
    updateApprover,
    deleteApprover,
  } = useContext(SettingsContext);

  const [editIndex, setEditIndex] = useState(null);
  const [editValues, setEditValues] = useState({
    reference_number: "",
    name: "",
    position: "",
    department: "",
    email: "",
  });
  const [addingNew, setAddingNew] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [approverToDelete, setApproverToDelete] = useState(null);

  useEffect(() => {
    fetchApprovers();
  }, []);

  const handleAddApprover = () => {
    setEditIndex("new");
    setEditValues({
      reference_number: "",
      name: "",
      position: "",
      department: "",
      email: "",
    });
    setAddingNew(true);
  };

  const handleEditApprover = (approver) => {
    setEditIndex(approver.id);
    setEditValues({ ...approver });
  };

  const handleChange = (e) => {
    setEditValues({ ...editValues, [e.target.name]: e.target.value });
  };

  const handleUpdateApprover = async (id) => {
    if (addingNew) {
      await createApprover(editValues);
    } else {
      await updateApprover(id, editValues);
    }
    resetEditState();
    fetchApprovers();
  };

  const resetEditState = () => {
    setEditIndex(null);
    setEditValues({
      reference_number: "",
      name: "",
      position: "",
      department: "",
      email: "",
    });
    setAddingNew(false);
  };

  const handleCancelEdit = () => {
    resetEditState();
  };

  const openDeleteDialog = (id) => {
    setApproverToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteApprover = async () => {
    if (approverToDelete !== null) {
      await deleteApprover(approverToDelete);
      fetchApprovers();
    }
    setDeleteDialogOpen(false);
    setApproverToDelete(null);
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setApproverToDelete(null);
  };

  const renderRow = (approver, index) => {
    const isEditing = editIndex === approver.id;

    return (
      <tr
        key={approver.id}
        className="hover:bg-gray-50 text-sm text-gray-700 border-b border-gray-300"
      >
        <td className="py-3 px-4">
          <Chip
            value={index + 1}
            color="blue"
            className="flex items-center py-2 justify-center text-white w-fit rounded-full"
          />
        </td>
        {["reference_number", "name", "position", "department", "email"].map(
          (field) => (
            <td key={field} className="py-3 px-4">
              {isEditing ? (
                <input
                  type="text"
                  name={field}
                  value={editValues[field]}
                  onChange={handleChange}
                  className="w-full px-2 py-1 rounded-md border"
                />
              ) : (
                approver[field]
              )}
            </td>
          )
        )}
        <td className="py-3 px-4">
          {isEditing ? (
            <div className="flex gap-2 items-center">
              <button
                className="text-green-600 hover:underline font-semibold"
                onClick={() => handleUpdateApprover(approver.id)}
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
                onClick={() => handleEditApprover(approver)}
              >
                Edit
              </button>
              <button
                className="text-red-500 hover:underline font-semibold"
                onClick={() => openDeleteDialog(approver.id)}
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
              Manage Approvers
            </Typography>
            <Typography color="gray" className="mt-1 font-normal text-sm">
              View and manage approval personnel.
            </Typography>
          </div>
        </CardHeader>
        <CardBody className="overflow-x-auto px-4 py-2">
          <div className="overflow-y-auto max-h-[300px]">
            <table className="min-w-full text-left border-l border-r border-b border-gray-300 rounded-md">
              <thead className="sticky top-0 bg-gray-50 z-10">
                <tr className="bg-gray-50 text-sm font-semibold text-gray-600">
                  <th className="py-3 px-4 border-b">ID</th>
                  <th className="py-3 px-4 border-b">Ref. Number</th>
                  <th className="py-3 px-4 border-b">Name</th>
                  <th className="py-3 px-4 border-b">Position</th>
                  <th className="py-3 px-4 border-b">Department</th>
                  <th className="py-3 px-4 border-b">Email</th>
                  <th className="py-3 px-4 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {approvers.length > 0 &&
                  approvers.map((approver, idx) => renderRow(approver, idx))}

                {editIndex === "new" && (
                  <tr className="hover:bg-gray-50 text-sm text-gray-700 border-b border-gray-300">
                    <td className="py-3 px-4">{approvers.length + 1}</td>
                    {[
                      "reference_number",
                      "name",
                      "position",
                      "department",
                      "email",
                    ].map((field) => (
                      <td key={field} className="py-3 px-4">
                        <input
                          type="text"
                          name={field}
                          value={editValues[field]}
                          onChange={handleChange}
                          className="w-full px-2 py-1 rounded-md border"
                        />
                      </td>
                    ))}
                    <td className="py-3 px-4 flex gap-2">
                      <button
                        className="text-green-600 hover:underline"
                        onClick={() => handleUpdateApprover(null)}
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

                {approvers.length === 0 && editIndex !== "new" && (
                  <tr>
                    <td colSpan="7" className="py-4 text-center text-gray-400">
                      No approvers found.
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
            onClick={handleAddApprover}
            disabled={editIndex !== null}
          >
            <Plus size={16} /> Add Approver
          </Button>
        </CardBody>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} handler={cancelDelete}>
        <DialogHeader>Confirm Deletion</DialogHeader>
        <DialogBody>
          Are you sure you want to delete this approver? This action cannot be
          undone.
        </DialogBody>
        <DialogFooter className="flex gap-2">
          <Button variant="text" color="gray" onClick={cancelDelete}>
            Cancel
          </Button>
          <Button variant="filled" color="red" onClick={confirmDeleteApprover}>
            Delete
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
};

export default Approvers;
