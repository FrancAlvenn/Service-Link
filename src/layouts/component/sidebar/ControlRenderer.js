import React from "react";
import { useLocation } from "react-router-dom";
import RequestsManagementControls from "./RequestsManagementControls";
import TicketManagementControls from "./TicketManagementControls";
import AssetManagementControls from "./AssetManagementControls";
import EmployeeManagementControls from "./EmployeeManagementControls";

/**
 * Renders the appropriate management controls based on the current
 * route or the selected control. It uses the `useLocation` hook
 * to determine the current path and conditionally renders the
 * corresponding control component.
 *
 * @param {Object} props - The component props.
 * @param {string} props.selectedControl - The name of the management
 * control selected from the sidebar. It is used as a fallback when
 * the current route does not match any predefined paths.
 *
 * @returns {JSX.Element} The rendered management control component
 * wrapped in a styled div.
 */

function ControlRenderer({ selectedControl }) {
  const location = useLocation();

  const renderControls = () => {
    let controlComponent = null;

    if (
      location.pathname.includes("workspace") ||
      selectedControl === "Requests Management"
    ) {
      controlComponent = <RequestsManagementControls />;
    }
    // Add styles before returning the component
    return (
      <div className=" px-1  h-full custom-scrollbar whitespace-nowrap">
        {controlComponent}
      </div>
    );
  };

  return renderControls();
}

export default ControlRenderer;
