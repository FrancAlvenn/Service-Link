import {
  CardHeader,
  Typography,
  Button,
  CardBody,
  Dialog,
} from "@material-tailwind/react";

import { ArrowClockwise, MagnifyingGlass } from "@phosphor-icons/react";
import { useContext, useEffect, useState } from "react";
import { JobRequestsContext } from "../../context/JobRequestsContext.js";
import SidebarView from "../../../../components/sidebar/SidebarView.jsx";
import { UserContext } from "../../../../context/UserContext.js";
import { getColumnConfig } from "../../utils/columnConfig.js";
import { AuthContext } from "../../../authentication/index.js";
import RequestFilter from "../../utils/requestFilter.js";
import { useLocation } from "react-router-dom";
import ProfileModal from "../../../../layouts/component/navbar/ProfileModal.js";
import NotificationModal from "../../../../layouts/component/navbar/NotificationModal";
import Header from "../../../../layouts/header.js";
import ModalView from "../request_details_view/ModalView";
import { SettingsContext } from "../../../settings/context/SettingsContext.js";

export function JobRequests() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedReferenceNumber, setSelectedReferenceNumber] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { jobRequests, fetchJobRequests } = useContext(JobRequestsContext);
  const { getUserByReferenceNumber } = useContext(UserContext);

  const handleSearch = (e) => setSearchQuery(e.target.value);

  const [filters, setFilters] = useState({
    status: "",
    department: "",
  });

  function useQuery() {
    return new URLSearchParams(useLocation().search);
  }

  const query = useQuery();
  const preSelectedReference = query.get("referenceNumber");

  useEffect(() => {
    if (preSelectedReference) {
      setSelectedReferenceNumber(preSelectedReference);
      setModalOpen(true);
    }
  }, [preSelectedReference]);

  const sortedJobRequests = [
    ...(Array.isArray(jobRequests) ? jobRequests : []),
  ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const filteredRows = sortedJobRequests.filter((row) => {
    const rowString = Object.entries(row)
      .filter(([key]) => key !== "details")
      .map(([_, value]) => value)
      .join(" ")
      .toLowerCase();

    const matchesSearch = rowString.includes(searchQuery.toLowerCase());
    const matchesStatus = !filters.status || row.status === filters.status;
    const matchesDepartment =
      !filters.department || row.department === filters.department;
    const matchesPriority =
      !filters.priority || row.priority === filters.priority;

    return (
      matchesSearch && matchesStatus && matchesDepartment && matchesPriority
    );
  });

  const requestType = "job_request";

  const columns = getColumnConfig(
    requestType,
    () => setModalOpen(true),
    setSelectedReferenceNumber,
    getUserByReferenceNumber,
  );

  return (
    <div className="flex flex-col h-full bg-white">
      <CardHeader
        floated={false}
        shadow={false}
        className="rounded-none min-h-fit pb-1"
      >
        <Header
          title={"Job Requests"}
          description={"See information about requests"}
        />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-3">
          <RequestFilter filters={filters} onFilterChange={setFilters} />
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
        <div className="w-full px-3 flex flex-col justify-between transition-all duration-300">
          <CardBody className="custom-scrollbar h-full pt-0">
            <table className="w-full min-w-max table-auto text-left">
              <thead className="sticky top-0 z-10 border-b border-blue-gray-100">
                <tr>
                  {columns.map((col, index) => (
                    <th
                      key={index}
                      className="cursor-pointer bg-white p-4 transition-colors hover:bg-blue-gray-50"
                    >
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="leading-none opacity-70 capitalize font-semibold"
                      >
                        {col.header}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {columns.map((col, colIndex) => (
                      <td
                        key={colIndex}
                        className="px-4 py-5 w-fit font-normal"
                      >
                        {col.render(
                          row,
                          () => setModalOpen(true),
                          setSelectedReferenceNumber
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
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
  );
}

export default JobRequests;
