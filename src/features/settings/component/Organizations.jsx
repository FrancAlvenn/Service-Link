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

const Organization = () => {
  const {
    organizations,
    fetchOrganizations,
    createOrganization,
    updateOrganization,
    deleteOrganization,
  } = useContext(SettingsContext);

  const [editIndex, setEditIndex] = useState(null);
  const [editValues, setEditValues] = useState({ name: "", description: "" });
  const [addingNew, setAddingNew] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orgToDelete, setOrgToDelete] = useState(null);

  const [selectedRowId, setSelectedRowId] = useState(null);

  const tableRef = useRef(null);

  useEffect(() => {
    fetchOrganizations();
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

  const handleAddOrganization = () => {
    setEditIndex("new");
    setEditValues({ name: "", description: "" });
    setAddingNew(true);
  };

  const handleEditOrganization = (org) => {
    setEditIndex(org.id);
    setEditValues({ name: org.name, description: org.description });
  };

  const handleChange = (e) => {
    setEditValues({ ...editValues, [e.target.name]: e.target.value });
  };

  const handleUpdateOrganization = async (id) => {
    if (addingNew) {
      await createOrganization(editValues);
    } else {
      await updateOrganization(id, editValues);
    }
    resetEditState();
    fetchOrganizations();
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
    setOrgToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteOrganization = async () => {
    if (orgToDelete !== null) {
      await deleteOrganization(orgToDelete);
      fetchOrganizations();
    }
    setDeleteDialogOpen(false);
    setOrgToDelete(null);
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setOrgToDelete(null);
  };

  const renderRow = (org, index) => {
    const isEditing = editIndex === org.id;

    return (
      <tr
        key={org.id}
        className={`hover:bg-blue-50 text-sm text-gray-700 border-b border-gray-300 cursor-pointer ${
          selectedRowId === org.id ? "bg-blue-200" : ""
        }`}
        onClick={() => setSelectedRowId(org.id)}
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
            <Chip value={org.name} color="cyan" className="text-white w-fit" />
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
            org.description
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
              Manage Organizations
            </Typography>
            <Typography color="gray" className="mt-1 font-normal text-sm">
              View and manage the organizations in your system.
            </Typography>
          </div>
        </CardHeader>
        <CardBody className="overflow-x-auto px-4 py-2" ref={tableRef}>
          <div className="overflow-y-auto max-h-[300px]">
            <table className="min-w-full text-left border-l border-r border-b border-gray-300 rounded-md ">
              <thead className="sticky top-0 bg-gray-50 z-10">
                <tr className="text-sm font-semibold text-gray-600">
                  <th className="py-3 px-4 border-b">ID</th>
                  <th className="py-3 px-4 border-b">Organization</th>
                  <th className="py-3 px-4 border-b">Description</th>
                </tr>
              </thead>
              <tbody>
                {organizations.length > 0 &&
                  organizations.map((org, idx) => renderRow(org, idx))}

                {editIndex === "new" && (
                  <tr className="hover:bg-gray-50 text-sm text-gray-700 border-b border-gray-300">
                    <td className="py-3 px-4">{organizations.length + 1}</td>
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

                {organizations.length === 0 && editIndex !== "new" && (
                  <tr>
                    <td colSpan="4" className="py-4 text-center text-gray-400">
                      No organizations found.
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
              onClick={handleAddOrganization}
              disabled={editIndex !== null}
            >
              <Plus size={16} /> Add Organization
            </Button>

            <div className="flex gap-2">
              {editIndex === "new" && (
                <>
                  <Button
                    color="green"
                    onClick={() => handleUpdateOrganization(null)}
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
                    onClick={() => handleUpdateOrganization(selectedRowId)}
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
                      const selected = organizations.find(
                        (p) => p.id === selectedRowId
                      );
                      handleEditOrganization(selected);
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
          Are you sure you want to delete this organization? This action cannot
          be undone.
        </DialogBody>
        <DialogFooter className="flex gap-2">
          <Button variant="text" color="gray" onClick={cancelDelete}>
            Cancel
          </Button>
          <Button
            variant="filled"
            color="red"
            onClick={confirmDeleteOrganization}
          >
            Delete
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
};

export default Organization;
