import { Menu, MenuHandler, MenuList, MenuItem } from "@material-tailwind/react";
import ToastNotification from "../../utils/ToastNotification";
import { Copy, PencilSimpleLine } from "@phosphor-icons/react";

function FeedbackMenuButton({ formUrl }) {
  const handleOpenForm = () => {
    window.open(formUrl, "_blank");
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
    <Menu placement="bottom-end">
      <MenuHandler>
        <button className="w-full max-w-32 p-1 text-sm text-white bg-blue-500 rounded-md hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700">
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
