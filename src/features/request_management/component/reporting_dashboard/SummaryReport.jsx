// src/pages/Reports/SummaryReport.jsx
import React, { useContext, useMemo, useState } from "react";
import {
  Typography,
  Chip,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Button,
} from "@material-tailwind/react";
import {
  FunnelSimple,
  Printer,
  X,
  ArrowClockwise,
} from "@phosphor-icons/react";
import { renderToStaticMarkup } from "react-dom/server";

import StatusModal from "../../../../utils/statusModal";
import ArchiveStatusModal from "../../../../utils/archiveStatusModal";
import { formatDate } from "../../../../utils/dateFormatter";

import SummaryReportTemplate from "./report_templates/SummaryReportTemplate";
import { JobRequestsContext } from "../../context/JobRequestsContext";
import { VehicleRequestsContext } from "../../context/VehicleRequestsContext";
import { VenueRequestsContext } from "../../context/VenueRequestsContext";
import { PurchasingRequestsContext } from "../../context/PurchasingRequestsContext";
import { UserContext } from "../../../../context/UserContext";
import Header from "../../../../layouts/header";

const normalText = "text-sm text-center font-normal rounded-full flex items-center justify-center";

const SummaryReport = () => {
  const { jobRequests } = useContext(JobRequestsContext) || {};
  const { vehicleRequests } = useContext(VehicleRequestsContext) || {};
  const { venueRequests } = useContext(VenueRequestsContext) || {};
  const { purchasingRequests } = useContext(PurchasingRequestsContext) || {};
  const { allUserInfo, getUserByReferenceNumber } = useContext(UserContext) || {};

  const safeArray = (arr) => (Array.isArray(arr) ? arr : []);

  // Unified data with proper mapping
  const allRequests = useMemo(() => {
    const mapRequest = (req, type, color) => ({
      ...req,
      request_type: type,
      request_type_full: `${type} Request`,
      requester_name: getUserByReferenceNumber(req.requester) || "Unknown User",
      department: req.department || req.requested_by?.department?.name || "N/A",
      color,
    });

    return [
      ...safeArray(jobRequests).map((r) => mapRequest(r, "Job", "red")),
      ...safeArray(purchasingRequests).map((r) => mapRequest(r, "Purchasing", "amber")),
      ...safeArray(venueRequests).map((r) => mapRequest(r, "Venue", "purple")),
      ...safeArray(vehicleRequests).map((r) => mapRequest(r, "Vehicle", "green")),
    ];
  }, [jobRequests, purchasingRequests, venueRequests, vehicleRequests, getUserByReferenceNumber]);

  const [filters, setFilters] = useState({
    requestType: "",
    status: "",
    department: "",
    dateFrom: "",
    dateTo: "",
  });

  const filteredRequests = useMemo(() => {
    return allRequests.filter((r) => {
      if (filters.requestType && r.request_type !== filters.requestType) return false;
      if (filters.status && r.status !== filters.status) return false;
      if (filters.department && r.department !== filters.department) return false;
      if (filters.dateFrom && new Date(r.created_at) < new Date(filters.dateFrom)) return false;
      if (filters.dateTo && new Date(r.created_at) > new Date(filters.dateTo)) return false;
      return true;
    });
  }, [allRequests, filters]);

  const uniqueTypes = [...new Set(allRequests.map((r) => r.request_type))];
  const uniqueStatuses = [...new Set(allRequests.map((r) => r.status))];
  const uniqueDepartments = [...new Set(allRequests.map((r) => r.department))].filter(Boolean);

  const stats = {
    total: filteredRequests.length,
    approved: filteredRequests.filter((r) => r.status === "Approved").length,
    completed: filteredRequests.filter((r) => r.status === "Completed").length,
    pending: filteredRequests.filter((r) => r.status?.toLowerCase().includes("pending")).length,
  };

  const dynamicTitle = filters.requestType
    ? `${filters.requestType} Request Report`
    : "Summary Request Report";

  // PRINT FUNCTION – EXACTLY LIKE YOUR PrintableRequestForm
  const handlePrintSummary = () => {
    const content = renderToStaticMarkup(
      <SummaryReportTemplate
        requests={filteredRequests}
        filters={filters}
        stats={stats}
        dateGenerated={new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      />
    );

    // Collect all styles
    const styles = Array.from(
      document.querySelectorAll('style, link[rel="stylesheet"]')
    )
      .map((tag) => tag.outerHTML)
      .join("\n");

    const printWindow = window.open("", "_blank", "width=1000,height=800");
    if (!printWindow) {
      alert("Please allow popups to print the report");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${dynamicTitle} - ${new Date().toISOString().split("T")[0]}</title>
          ${styles}
          <style>
            body { 
              font-family: 'Inter', sans-serif; 
              margin: 15mm; 
              background: white;
              color: #1e293b;
            }
            @media print {
              body { margin: 5mm; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          ${content}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 800);
  };

  const columns = [
    {
      key: "id",
      header: <Typography variant="small" color="blue-gray" className={normalText}>ID</Typography>,
      render: (row) => (
        <div className="flex justify-center">
          <Chip
            size="xs"
            variant="ghost"
            color={row.color}
            value={row.id}
            className="text-center font-bold rounded-full w-8 h-8 flex items-center justify-center"
          />
        </div>
      ),
    },
    {
      key: "reference_number",
      header: <Typography variant="small" color="blue-gray" className={normalText}>Ref No.</Typography>,
      render: (row) => (
        <Typography className="text-blue-600 font-medium text-center">
          {row.reference_number}
        </Typography>
      ),
    },
    {
      key: "title",
      header: <Typography variant="small" color="blue-gray" className={normalText}>Title</Typography>,
      render: (row) => <Typography className={normalText}>{row.title || "N/A"}</Typography>,
    },
    {
      key: "request_type",
      header: <Typography variant="small" color="blue-gray" className={normalText}>Type</Typography>,
      render: (row) => (
        <Chip size="xs" value={row.request_type} color={row.color === "red" ? "blue" : row.color} className="mx-auto" />
      ),
    },
    {
      key: "status",
      header: <Typography variant="small" color="blue-gray" className={normalText}>Status</Typography>,
      render: (row) => (
        <StatusModal
          input={row.status}
          referenceNumber={row.reference_number}
          requestType={row.request_type.toLowerCase() + "_requests"}
          editable={false}
        />
      ),
    },
    {
      key: "department",
      header: <Typography variant="small" color="blue-gray" className={normalText}>Department</Typography>,
      render: (row) => <Typography className={normalText}>{row.department}</Typography>,
    },
    {
      key: "requester_name",
      header: <Typography variant="small" color="blue-gray" className={normalText}>Requester</Typography>,
      render: (row) => <Typography className={normalText}>{row.requester_name}</Typography>,
    },
    {
      key: "created_at",
      header: <Typography variant="small" color="blue-gray" className={normalText}>Date</Typography>,
      render: (row) => <Typography className={normalText}>{formatDate(row.created_at)}</Typography>,
    },
    {
      key: "archived",
      header: <Typography variant="small" color="blue-gray" className={normalText}>Archived</Typography>,
      render: (row) => (
        <ArchiveStatusModal
          input={row.archived}
          referenceNumber={row.reference_number}
          requestType={row.request_type.toLowerCase() + "_requests"}
          editable={false}
        />
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}

    <Header title={dynamicTitle} description="Comprehensive overview of all request types with filtering and export" />

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-xs p-6 mb-6 flex flex-wrap gap-3 items-center">
        <Menu placement="bottom-start">
          <MenuHandler>
            <Chip
              value={filters.requestType || "All Types"}
              variant={filters.requestType ? "filled" : "ghost"}
              color="blue"
              icon={<FunnelSimple size={16} />}
              className="cursor-pointer"
            />
          </MenuHandler>
          <MenuList>
            <MenuItem onClick={() => setFilters({ ...filters, requestType: "" })}>All Types</MenuItem>
            {uniqueTypes.map((t) => (
              <MenuItem key={t} onClick={() => setFilters({ ...filters, requestType: t })}>
                {t} Request
              </MenuItem>
            ))}
          </MenuList>
        </Menu>

        <Menu placement="bottom-start">
          <MenuHandler>
            <Chip
              value={filters.status || "All Status"}
              variant={filters.status ? "filled" : "ghost"}
              color="blue"
              icon={<FunnelSimple size={16} />}
              className="cursor-pointer"
            />
          </MenuHandler>
          <MenuList>
            <MenuItem onClick={() => setFilters({ ...filters, status: "" })}>All Status</MenuItem>
            {uniqueStatuses.map((s) => (
              <MenuItem key={s} onClick={() => setFilters({ ...filters, status: s })}>
                {s}
              </MenuItem>
            ))}
          </MenuList>
        </Menu>

        <Menu placement="bottom-start">
          <MenuHandler>
            <Chip
              value={filters.department || "All Departments"}
              variant={filters.department ? "filled" : "ghost"}
              color="blue"
              icon={<FunnelSimple size={16} />}
              className="cursor-pointer"
            />
          </MenuHandler>
          <MenuList>
            <MenuItem onClick={() => setFilters({ ...filters, department: "" })}>All Departments</MenuItem>
            {uniqueDepartments.map((d) => (
              <MenuItem key={d} onClick={() => setFilters({ ...filters, department: d })}>
                {d}
              </MenuItem>
            ))}
          </MenuList>
        </Menu>

        <input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
          className="border rounded-lg px-3 py-2 text-xs"
        />
        <span>to</span>
        <input
          type="date"
          value={filters.dateTo}
          onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
          className="border rounded-lg px-3 py-2 text-xs"
        />

        <Button
          size="xs"
          variant="outlined"
          color="red"
          onClick={() => setFilters({ requestType: "", status: "", department: "", dateFrom: "", dateTo: "" })}
          className="flex items-center gap-1"
        >
          <ArrowClockwise size={16} /> Reset
        </Button>

        <div className="ml-auto">
          <Button
            color="green"
            onClick={handlePrintSummary}
            disabled={filteredRequests.length === 0}
            className="flex items-center gap-2 shadow-lg"
          >
            <Printer size={18} />
            Print Summary Report ({filteredRequests.length})
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-xs overflow-x-auto">
        <table className="w-full min-w-max table-auto text-left">
          <thead className="bg-blue-gray-50">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="border-b border-blue-gray-100 p-4">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRequests.map((row, i) => (
              <tr key={row.reference_number} className={i % 2 === 0 ? "bg-white" : "bg-blue-gray-50/30"}>
                {columns.map((col) => (
                  <td key={col.key} className="p-4 text-center">
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
            {filteredRequests.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="text-center py-10 text-gray-500">
                  No requests found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SummaryReport;
