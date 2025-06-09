import { Button, Chip } from "@material-tailwind/react";
import JobRequestTemplate from "./report_templates/JobRequestTemplate";
import PurchasingRequestTemplate from "./report_templates/PurchasingRequestTemplate";
import VehicleRequestTemplate from "./report_templates/VehicleRequestTemplate";
import VenueRequestTemplate from "./report_templates/VenueRequestTemplate";
import { renderToStaticMarkup } from "react-dom/server";
import { Printer } from "@phosphor-icons/react";
import { useContext } from "react";

import { SettingsContext } from "../../../settings/context/SettingsContext";
import { UserContext } from "../../../../context/UserContext";

const PrintableRequestForm = ({ requestType, requestData }) => {
  const { departments } = useContext(SettingsContext);
  const { allUserInfo } = useContext(UserContext);

  const getPrintableTemplate = () => {
    const commonProps = {
      request: requestData,
      departments: departments,
      users: allUserInfo,
    };

    switch (requestType) {
      case "job_request":
        return <JobRequestTemplate {...commonProps} />;
      case "purchasing_request":
        return <PurchasingRequestTemplate {...commonProps} />;
      case "vehicle_request":
        return (
          <div className="flex flex-col justify-between h-full">
            <VehicleRequestTemplate {...commonProps} />
            <div className="w-full border-t border-dashed border-gray-400"></div>
            <VehicleRequestTemplate {...commonProps} />
          </div>
        );
      case "venue_request":
        return <VenueRequestTemplate {...commonProps} />;
      default:
        return <div>Unsupported request type</div>;
    }
  };

  const handlePrint = () => {
    console.log(allUserInfo);
    const content = renderToStaticMarkup(getPrintableTemplate());

    // Get all parent document's stylesheets
    const styles = Array.from(
      document.querySelectorAll('style, link[rel="stylesheet"]')
    )
      .map((tag) => tag.outerHTML)
      .join("");

    const printWindow = window.open("", "_blank", "width=800,height=600");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Request-${requestData.reference_number}</title>
          ${styles}
          <style>
            @media print {
              body { margin: 5mm; }
            }
          </style>
        </head>
        <body class="bg-white">${content}</body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    // Delay print to ensure styles load
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  return (
    <div
      className="flex flex-col items-start gap-3 relative group"
      title="Print this request"
    >
      <Button
        variant="outlined"
        onClick={handlePrint}
        className="px-2 py-2 text-blue-500 border-blue-500 rounded"
      >
        <Printer size={20} />
      </Button>
    </div>
  );
};

export default PrintableRequestForm;
