import React from "react";
import { useLocation } from "react-router-dom";
import RequestsManagementControls from "./RequestsManagementControls";
import TicketManagementControls from "./TicketManagementControls";
import AssetManagementControls from "./AssetManagementControls";
import EmployeeManagementControls from "./EmployeeManagementControls";

function ControlRenderer({ selectedControl }) {
  const location = useLocation();

  const renderControls = () => {
    let controlComponent = null;

    if (location.pathname.includes("requests-management") || selectedControl === "Requests Management") {
      controlComponent = <RequestsManagementControls />;
    }

    if (location.pathname.includes("ticket-management") || selectedControl === "Ticket Management") {
      controlComponent = <TicketManagementControls />;
    }

    if (location.pathname.includes("asset-management") || selectedControl === "Asset Management") {
      controlComponent = <AssetManagementControls />;
    }

    if (location.pathname.includes("employee-management") || selectedControl === "Employee Management") {
      controlComponent = <EmployeeManagementControls />;
    }

    // Add styles before returning the component
    return (
      <div className="control-container px-1 py-4">
        {controlComponent}
      </div>
    );
  };

  return renderControls();
}

export default ControlRenderer;
