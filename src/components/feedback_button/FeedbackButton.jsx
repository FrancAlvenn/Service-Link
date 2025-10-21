import { Menu, MenuHandler, MenuList, MenuItem } from "@material-tailwind/react";
import ToastNotification from "../../utils/ToastNotification";
import { Copy, PencilSimpleLine, X } from "@phosphor-icons/react";
import { useState } from "react";

function FeedbackMenuButton({ formUrl }) {
  const [isFormVisible, setIsFormVisible] = useState(false);

  const handleOpenForm = () => {
    setIsFormVisible(true);
  };

  const handleCloseForm = () => {
    setIsFormVisible(false);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(formUrl);
      ToastNotification.success("Success", "Feedback link copied to clipboard!");
    } catch (err) {
      ToastNotification.error("Error", "Failed to copy feedback link.");
      console.error("Failed to copy: ", err);
    }
  };

  return (
    <div>
      <Menu placement="bottom-end">
        <MenuHandler>
          <button className="w-full max-w-32 px-4 py-2 text-sm text-white bg-blue-500 rounded-md hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700">
            Give Feedback
          </button>
        </MenuHandler>
        <MenuList className="mt-2 p-2 flex flex-col">
          <MenuItem onClick={handleOpenForm}>
            <span className="flex gap-1 items-center">
              <PencilSimpleLine size={16} />
              Answer Feedback Form
            </span>
          </MenuItem>
          <MenuItem onClick={handleCopyLink}>
            <span className="flex gap-1 items-center">
              <Copy size={16} />
              Copy Feedback Link
            </span>
          </MenuItem>
        </MenuList>
      </Menu>

      {isFormVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-2">
          <div className="bg-white p-4 rounded-lg w-full max-w-4xl">
            <div className="flex justify-end">
              <div className="p-1 rounded-md bg-red-500">
                <X color="white" onClick={handleCloseForm} className="cursor-pointer" />
              </div>
            </div>
            <iframe
              src={formUrl}
              width="100%"
              height="600px"
              frameBorder="0"
              title="Feedback Form"
              className="mt-2"
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
}

// Job Request Feedback Button
export function FeedbackButtonJobRequest({ referenceNumber }) {
  const formUrl = `https://tally.so/r/wkozjd?reference_number=${referenceNumber}`;
  return <FeedbackMenuButton formUrl={formUrl} />;
}

// Purchasing Request Feedback Button
export function FeedbackButtonPurchasingRequest({ referenceNumber }) {
  const formUrl = `https://tally.so/r/3ER6yr?reference_number=${referenceNumber}`;
  return <FeedbackMenuButton formUrl={formUrl} />;
}

// Venue Request Feedback Button
export function FeedbackButtonVenueRequest({ referenceNumber }) {
  const formUrl = `https://tally.so/r/woPz4x?reference_number=${referenceNumber}`;
  return <FeedbackMenuButton formUrl={formUrl} />;
}

// Vehicle Request Feedback Button
export function FeedbackButtonVehicleRequest({ referenceNumber }) {
  const formUrl = `https://tally.so/r/3ER64r?reference_number=${referenceNumber}`;
  return <FeedbackMenuButton formUrl={formUrl} />;
}