// src/pages/Reports/SummaryReportTemplate.jsx
import React from "react";
import logo from "../../../../../assets/dyci_logo.png";
import dayjs from "dayjs";

const SummaryReportTemplate = React.forwardRef(({ requests, filters, stats }, ref) => {
  const mainTitle = filters.requestType
    ? `${String(filters.requestType).toUpperCase()} REQUEST REPORT`
    : "SUMMARY REQUEST REPORT";

  return (
    <div ref={ref} className="p-10 bg-white font-sans text-sm leading-relaxed">
      {/* Header */}
      <div className="text-center mb-8 border-b pb-6">
        <img src={logo} alt="DYCI" className="w-20 mx-auto mb-4" />
        <h1 className="text-2xl font-bold">DR. YANGA'S COLLEGES, INC.</h1>
        <p className="text-lg">General Services Office</p>
        <h2 className="text-xl font-bold mt-4">{mainTitle}</h2>
        <p className="text-sm text-gray-600">
          Generated on {dayjs().format("MMMM DD, YYYY [at] hh:mm A")}
        </p>
      </div>

      {/* Summary Text */}
      <div className="mb-8 leading-7">
        <p className="mb-4">
          During the selected period, a total of <strong>{stats.total} requests</strong> were submitted across all departments.
          Of these, <strong>{stats.approved} ({((stats.approved / stats.total) * 100 || 0).toFixed(1)}%)</strong> were approved,
          and <strong>{stats.completed}</strong> have been successfully completed.
        </p>
        <p>
          The system currently has <strong>{stats.pending} pending requests</strong> awaiting review or action.
          This report reflects activity from {filters.startDate ? dayjs(filters.startDate).format("MMMM DD, YYYY") : "the beginning"}
          {" "}to {filters.endDate ? dayjs(filters.endDate).format("MMMM DD, YYYY") : "present"}.
        </p>
      </div>

      {/* Table */}
      <table className="w-full border-collapse border-2 border-black text-xs">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-black p-2">Ref No.</th>
            <th className="border border-black p-2">Type</th>
            <th className="border border-black p-2">Title</th>
            <th className="border border-black p-2">Requester</th>
            <th className="border border-black p-2">Department</th>
            <th className="border border-black p-2">Status</th>
            <th className="border border-black p-2">Date</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((r) => (
            <tr key={r.reference_number}>
              <td className="border border-black p-2 text-center">{r.reference_number}</td>
              <td className="border border-black p-2">{r.request_type.split(" ")[0]}</td>
              <td className="border border-black p-2">{r.title || "N/A"}</td>
              <td className="border border-black p-2">{r.requester_name}</td>
              <td className="border border-black p-2">{r.department}</td>
              <td className="border border-black p-2 text-center">{r.status}</td>
              <td className="border border-black p-2 text-center">
                {dayjs(r.created_at).format("MMM DD, YYYY")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Key Metrics moved to bottom */}
      <div className="mt-10 mb-10 grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="text-center p-4 border-2 border-blue-600 rounded-lg">
          <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
          <p className="text-xs md:text-sm">Total Requests</p>
        </div>
        <div className="text-center p-4 border-2 border-green-600 rounded-lg">
          <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
          <p className="text-xs md:text-sm">Approved</p>
        </div>
        <div className="text-center p-4 border-2 border-cyan-600 rounded-lg">
          <p className="text-2xl font-bold text-cyan-600">{stats.completed}</p>
          <p className="text-xs md:text-sm">Completed</p>
        </div>
        <div className="text-center p-4 border-2 border-orange-600 rounded-lg">
          <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
          <p className="text-xs md:text-sm">Pending</p>
        </div>
      </div>

      {/* Signatory Section */}
      <div className="mt-8 mb-12 grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="flex flex-col items-start">
          <p className="text-sm font-semibold mb-12">Approved by:</p>
          <div className="w-full border-b border-black mb-2"></div>
          <p className="text-xs text-gray-600">Name and Signature</p>
        </div>
        <div className="flex flex-col items-start">
          <p className="text-sm font-semibold mb-12">Checked by:</p>
          <div className="w-full border-b border-black mb-2"></div>
          <p className="text-xs text-gray-600">Name and Signature</p>
        </div>
      </div>

      <div className="mt-6 text-right text-sm">
        <p>Generated by ServiceLink System</p>
        <p>DYCI-GSO • {dayjs().format("YYYY")}</p>
      </div>
    </div>
  );
});

SummaryReportTemplate.displayName = "SummaryReportTemplate";

export default SummaryReportTemplate;
