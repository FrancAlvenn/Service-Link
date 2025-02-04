import {
  Card,
  CardHeader,
  Input,
  Typography,
  Button,
  CardBody,
  Chip,
} from "@material-tailwind/react";

import { ArrowClockwise, MagnifyingGlass, UserPlus } from "@phosphor-icons/react";
import { useContext, useState } from "react";
import { PurchasingRequestsContext } from "../context/PurchasingRequestsContext.js";
import { formatDate } from "../utils/dateFormatter";
import { getApprovalColor, getArchivedColor } from "../utils/approvalColor";

import StatusModal from "../../../utils/statusModal.js";
import ApprovalStatusModal from "../../../utils/approverStatusModal.js";
import ArchiveStatusModal from "../../../utils/archiveStatusModal.js";

export function PurchasingRequests() {
  const [searchQuery, setSearchQuery] = useState("");

  const { purchasingRequests, fetchPurchasingRequests } = useContext(PurchasingRequestsContext);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // Filter data based on search query
  const filteredRows = purchasingRequests.filter((row) => {
    const rowString = Object.entries(row)
      .filter(([key]) => key !== "details") // Exclude `details` field
      .map(([_, value]) => value) // Extract values
      .join(" ")
      .toLowerCase();
    return rowString.includes(searchQuery.toLowerCase());
  });



  return (
    <div className="h-full bg-white rounded-lg w-full mt-0 px-3 flex flex-col justify-between">
      <div className="flex flex-col gap-4 h-full">
      <CardHeader floated={false} shadow={false} className="rounded-none min-h-fit">
            <div className="mb-1 flex items-center justify-between gap-5">
              <div>
                <Typography color="black" className="text-lg font-bold">
                  Purchasing Requests
                </Typography>
                <Typography color="gray" className="mt-1 font-normal text-sm">
                  See information about requests
                </Typography>
              </div>
              <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                <Button className="flex items-center gap-2 bg-blue-500" size="sm">
                  <ArrowClockwise
                    strokeWidth={2}
                    className="h-4 w-4"
                    onClick={() => {fetchPurchasingRequests()}}
                  />
                  Refresh
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-end gap-4 md:flex-row">
              {/* <Tabs value={selectedType} className="w-full md:w-max text-sm">
                <TabsHeader>
                  {TABS.map(({ label, value }) => (
                    <p
                      key={value}
                      value={value}
                      className={`text-xs w-fit p-2 rounded-lg ${selectedType === value ? "bg-blue-500 text-white" : ""} transition-all ease-in-out duration-300`}
                      onClick={() => setSelectedType(value)}
                    >
                      &nbsp;&nbsp;{label}&nbsp;&nbsp;
                    </p>
                  ))}
                </TabsHeader>
              </Tabs> */}
              <div className="w-full max-w-sm min-w-[200px]">
                <div className="relative">
                  <input
                    className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md pl-3 pr-28 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e)}
                  />
                  <span
                    className="absolute top-1 right-1 flex items-center rounded py-1.5 px-3 border border-transparent text-center text-sm text-black transition-all shadow-sm hover:shadow focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                    type="button"
                  >
                    <MagnifyingGlass size={16} />
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>

        <CardBody className="custom-scrollbar h-full pt-0">
          <table className="w-full min-w-max table-auto text-left">
            <thead className="sticky top-0 mt-0 z-10 border-b border-blue-gray-100">
              <tr>
                {Object.keys(purchasingRequests[0] || {})
                  .filter((key) => key !== "details") // Exclude `details`
                  .map((key, index) => (
                    <th
                      key={index}
                      className="cursor-pointer bg-white p-4 transition-colors hover:bg-blue-gray-50"
                    >
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="flex items-center justify-between gap-2 leading-none opacity-70 capitalize font-semibold"
                      >
                        {key.replace(/_/g, " ")}
                      </Typography>
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row, rowIndex) => {
                const isLast = rowIndex === filteredRows.length - 1;
                const classes = isLast ? "p-4 font-normal" : "px-4 py-5 w-fit";
                return (
                  <tr key={rowIndex}>
                    <td>
                      <div className="flex justify-center">
                        <Chip
                          size="sm"
                          variant="ghost"
                          color="orange"
                          className={`text-center font-semibold rounded-full w-4  h-4 flex items-center justify-center ${classes}`}
                          value={row.id || ""}
                        />
                      </div>
                    </td>

                    <td>
                      <div className="flex justify-center">
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className={`flex items-center gap-2  text-blue-500 cursor-pointer hover:underline ${classes} font-semibold`}
                          onClick={() => console.log("navigate to details")}
                        >
                          {row.reference_number || ""}
                        </Typography>
                      </div>
                    </td>

                    <td>
                      <div className="flex justify-center">
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className={`flex items-center gap-2 ${classes}`}
                        >
                          {formatDate(row.date_required || "")}
                        </Typography>
                      </div>
                    </td>

                    <td>
                      <div className="flex justify-center">
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className={`flex items-center gap-2 ${classes}`}
                        >
                          {row.requester || ""}
                        </Typography>
                      </div>
                    </td>

                    <td>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className={`flex items-center gap-2 ${classes}`}
                      >
                        {row.supply_category || ""}
                      </Typography>
                    </td>

                    <td>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className={`flex items-center gap-2 ${classes}`}
                      >
                        {row.department || ""}
                      </Typography>
                    </td>

                    
                    <td>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className={`flex items-center gap-2 ${classes}`}
                      >
                        {row.purpose || ""}
                      </Typography>
                    </td>

                    <td>
                      <StatusModal
                        input={row.status}
                        referenceNumber={row.reference_number}
                        requestType={"purchasing_request"}
                      />
                    </td>

                    <td>
                      <div className="flex justify-center">
                        <ApprovalStatusModal
                          input={row.immediate_head_approval}
                          referenceNumber={row.reference_number}
                          approvingPosition={"immediate_head_approval"}
                          requestType={"purchasing_request"}
                        />
                      </div>
                    </td>

                    <td>
                      <div className="flex justify-center">
                        <ApprovalStatusModal
                          input={row.gso_director_approval}
                          referenceNumber={row.reference_number}
                          approvingPosition={"gso_director_approval"}
                          requestType={"purchasing_request"}
                        />
                      </div>
                    </td>

                    <td>
                      <div className="flex justify-center">
                        <ApprovalStatusModal
                          input={row.operations_director_approval}
                          referenceNumber={row.reference_number}
                          approvingPosition={"operations_director_approval"}
                          requestType={"purchasing_request"}
                        />
                      </div>
                    </td>

                    <td>
                      <div className="flex justify-center">
                        <ArchiveStatusModal
                          input={row.archived}
                          referenceNumber={row.reference_number}
                          requestType={"purchasing_request"}
                        />
                      </div>
                    </td>

                    <td>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className={`flex items-center gap-2 ${classes}`}
                      >
                        {row.remarks || ""}
                      </Typography>
                    </td>

                    <td>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className={`flex items-center gap-2 ${classes}`}
                      >
                        {formatDate(row.created_at || "")}
                      </Typography>
                    </td>

                    <td>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className={`flex items-center gap-2 ${classes}`}
                      >
                        {formatDate(row.updated_at || "")}
                      </Typography>
                    </td>


                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardBody>
      </div>
    </div>
  );
}

export default PurchasingRequests;
