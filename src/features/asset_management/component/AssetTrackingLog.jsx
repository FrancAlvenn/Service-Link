import React, { useState, useEffect, useContext } from "react";
import { CardBody, CardHeader, Typography } from "@material-tailwind/react";
import { MagnifyingGlass } from "@phosphor-icons/react";
import Header from "../../../layouts/header";
import { AssetAssignmentLogContext } from "../context/AssetAssignmentLogContext";
import { getAssignmentLogColumns } from "../utils/columnConfig";
import { UserContext } from "../../../context/UserContext";
import SidebarView from "../../../components/sidebar/SidebarView";
import ModalView from "../../request_management/component/request_details_view/ModalView";

const AssetTrackingLog = () => {
  const { assetAssignmentLogs, fetchAssetAssignmentLogs } = useContext(
    AssetAssignmentLogContext
  );

  const { getUserByReferenceNumber } = useContext(UserContext);

  const [searchQuery, setSearchQuery] = useState("");

  const [modalOpen, setModalOpen] = useState(false);

  const [selectedReferenceNumber, setSelectedReferenceNumber] = useState("");

  useEffect(() => {
    fetchAssetAssignmentLogs();
    console.log(assetAssignmentLogs);
  }, []);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const columns = getAssignmentLogColumns(
    getUserByReferenceNumber,
    setModalOpen,
    setSelectedReferenceNumber
  );

  const filteredLogs = (
    Array.isArray(assetAssignmentLogs) ? assetAssignmentLogs : []
  ).filter((log) => {
    const logString = Object.values(log).join(" ").toLowerCase();
    return logString.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="flex flex-col h-full bg-white">
      <CardHeader
        floated={false}
        shadow={false}
        className="rounded-none min-h-fit pb-1"
      >
        <Header
          title={"Asset Tracking Log"}
          description={"Track asset history"}
        />
        <div className="flex items-center justify-end px-3 gap-4">
          <div className="relative w-full max-w-sm min-w-[200px]">
            <input
              className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md pl-3 pr-28 py-2 focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
              placeholder="Search"
              value={searchQuery}
              onChange={handleSearch}
            />
            <span className="absolute top-1 right-1 flex items-center rounded py-1.5 px-3 text-black shadow-sm hover:shadow">
              <MagnifyingGlass size={16} />
            </span>
          </div>
        </div>
      </CardHeader>

      <div className="flex justify-between h-full bg-white">
        {/* Table Section */}
        <div
          className={`h-full bg-white w-full mt-0 px-3 flex flex-col justify-between transition-[max-width] duration-300 ${
            modalOpen ? "max-w-[55%]" : "w-full"
          }`}
        >
          <div className="flex flex-col gap-4 h-full">
            <CardBody className="custom-scrollbar h-full pt-0">
              <table className="w-full min-w-max table-auto text-left">
                <thead className="sticky top-0 z-10 border-b border-blue-gray-100">
                  <tr>
                    {columns.map((column, index) => (
                      <th
                        key={index}
                        className="cursor-pointer bg-white p-4 transition-colors hover:bg-blue-gray-50 text-center"
                      >
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="leading-none opacity-70 capitalize font-semibold"
                        >
                          {column.label}
                        </Typography>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.length > 0 ? (
                    filteredLogs.map((log, rowIndex) => (
                      <tr key={rowIndex}>
                        {columns.map((col, colIndex) => (
                          <td
                            key={colIndex}
                            className="px-4 py-5 w-fit font-normal text-center"
                          >
                            {col.render
                              ? col.render(log)
                              : log[col.key] || "N/A"}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={columns.length} className="text-center py-4">
                        <Typography variant="small" color="gray">
                          No logs available.
                        </Typography>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardBody>
          </div>
        </div>

        {modalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            style={{ alignItems: "center", justifyContent: "center" }}
            onClick={() => setModalOpen(false)} // close on backdrop click
          >
            <div
              className="bg-white dark:bg-gray-900 w-full h-full lg:max-w-[80vw] lg:max-h-[90vh] overflow-y-auto rounded-xl"
              onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside modal
            >
              <ModalView
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                referenceNumber={selectedReferenceNumber}
                asModal={true}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetTrackingLog;
