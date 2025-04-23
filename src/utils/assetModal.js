import { useContext, useEffect, useState } from "react";
import {
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Typography,
  Chip,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Button,
} from "@material-tailwind/react";
import { PlusCircle } from "@phosphor-icons/react";
import AssetContext from "../features/assets/context/AssetContext";
import AuthContext from "../features/authentication/context/AuthContext";
import ToastNotification from "./ToastNotification";
import axios from "axios";

function AssetModal({ assignedTo, assetId, onAssignmentUpdate }) {
  const { assets } = useContext(AssetContext);
  const { user } = useContext(AuthContext);

  const [currentAssignee, setCurrentAssignee] = useState(assignedTo);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [note, setNote] = useState("");
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    setCurrentAssignee(assignedTo);
  }, [assignedTo]);

  const handleAssetClick = (asset) => {
    setSelectedAsset(asset);
    setNote("");
    setOpenModal(true);
  };

  const confirmAssignment = async () => {
    if (!note.trim()) {
      ToastNotification.error(
        "Error!",
        "Please provide a note for assignment."
      );
      return;
    }

    try {
      setCurrentAssignee(selectedAsset.name);
      setOpenModal(false);

      const response = await axios.patch(
        `/assets/${assetId}/assign`,
        {
          assigned_asset_id: selectedAsset.asset_id,
          action: note,
          assigned_by: user.reference_number,
        },
        { withCredentials: true }
      );

      if (response.status === 200) {
        ToastNotification.success("Success!", response.data.message);
        if (onAssignmentUpdate) {
          onAssignmentUpdate(selectedAsset.name);
        }

        await axios.post(
          "/asset_activity",
          {
            asset_id: assetId,
            type: "assignment",
            action: `Linked to asset <i>${selectedAsset.name}</i>`,
            details: note,
            performed_by: user.reference_number,
          },
          { withCredentials: true }
        );
      }
    } catch (error) {
      ToastNotification.error(
        "Error!",
        "Failed to link asset or log activity."
      );
      console.error("Asset assignment error:", error);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Menu placement="bottom-start">
        <MenuHandler>
          <Chip
            size="sm"
            variant="ghost"
            value={currentAssignee || "Link Asset"}
            className="text-center w-fit cursor-pointer"
            color="blue"
          />
        </MenuHandler>
        <MenuList className="mt-2 divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-2 ring-black/5 border-none w-fit">
          {assets.length > 0 ? (
            <div className="grid grid-cols-1 gap-2">
              {assets.map((asset) => (
                <MenuItem
                  key={asset.asset_id}
                  className="flex justify-between items-center px-4 py-2 text-xs cursor-pointer"
                  onClick={() => handleAssetClick(asset)}
                >
                  <Typography className="text-sm">{asset.name}</Typography>
                </MenuItem>
              ))}
              <div className="flex items-center mt-2 py-2 justify-center text-xs rounded-lg bg-gray-100">
                <Typography
                  color="blue-gray"
                  className="flex items-center gap-2 font-semibold text-sm text-gray-500 cursor-pointer"
                >
                  <PlusCircle size={18} className="cursor-pointer" />
                  Add new asset
                </Typography>
              </div>
            </div>
          ) : (
            <MenuItem className="text-xs text-gray-500 justify-center">
              Loading assets...
            </MenuItem>
          )}
        </MenuList>
      </Menu>

      {/* Assignment Confirmation Modal */}
      <Dialog
        open={openModal}
        handler={setOpenModal}
        size="sm"
        className="backdrop:bg-transparent"
      >
        <DialogHeader>Confirm Asset Linking</DialogHeader>
        <DialogBody>
          <div className="flex flex-col gap-4">
            <Typography variant="small">
              You selected <strong>{selectedAsset?.name}</strong>. Please enter
              a note before linking.
            </Typography>
            <Input
              type="text"
              placeholder="Note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </DialogBody>
        <DialogFooter>
          <Button
            color="gray"
            onClick={() => setOpenModal(false)}
            className="mr-2"
          >
            Cancel
          </Button>
          <Button
            onClick={confirmAssignment}
            disabled={!note.trim()}
            className="bg-blue-500"
          >
            Confirm
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

export default AssetModal;
