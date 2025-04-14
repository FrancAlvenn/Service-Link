import {
  CardHeader,
  Typography,
  Button,
  CardBody,
} from "@material-tailwind/react";
import { ArrowClockwise, MagnifyingGlass } from "@phosphor-icons/react";
import { useContext, useState } from "react";
import { getColumnConfig } from "../utils/columnConfig.js";
import { AssetContext } from "../context/AssetContext.js";
import AssetSidebar from "./AssetSidebar.jsx";

const AssetTable = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { assets, fetchAssets, deleteAsset } = useContext(AssetContext);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredRows = (Array.isArray(assets) ? assets : []).filter((row) => {
    const rowString = Object.entries(row)
      .filter(([key]) => key !== "details")
      .map(([_, value]) => value)
      .join(" ")
      .toLowerCase();
    return rowString.includes(searchQuery.toLowerCase());
  });

  const columns = getColumnConfig({ setIsSidebarOpen, setSelectedAsset });

  return (
    <div className="h-full bg-white rounded-lg w-full mt-0 px-3 flex justify-between">
      <div
        className={`h-full bg-white w-full mt-0 px-3 flex justify-between transition-[max-width] duration-300 ${
          isSidebarOpen ? "max-w-[55%]" : "w-full"
        }`}
      >
        <div
          className={`flex flex-col gap-4 h-full ${
            isSidebarOpen ? "max-w-[100%]" : "w-full"
          }`}
        >
          <CardHeader
            floated={false}
            shadow={false}
            className="rounded-none min-h-fit pb-6"
          >
            <div className="mb-1 flex items-center justify-between gap-5">
              <div>
                <Typography color="black" className="text-lg font-bold">
                  Asset Management
                </Typography>
                <Typography color="gray" className="mt-1 font-normal text-sm">
                  View and manage your assets.
                </Typography>
              </div>
              <Button
                className="flex items-center gap-2 bg-blue-500"
                size="sm"
                onClick={fetchAssets}
              >
                <ArrowClockwise strokeWidth={2} className="h-4 w-4" />
                Refresh
              </Button>
            </div>
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
                {filteredRows.length > 0 ? (
                  filteredRows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {columns.map((col, colIndex) => (
                        <td
                          key={colIndex}
                          className="px-4 py-5 w-fit font-normal"
                        >
                          {col.render
                            ? col.render(
                                row,
                                setIsSidebarOpen,
                                setSelectedAsset
                              )
                            : row[col.key] || "N/A"}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length} className="text-center py-4">
                      <Typography variant="small" color="gray">
                        No assets available.
                      </Typography>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardBody>
        </div>
      </div>

      <AssetSidebar
        open={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        referenceNumber={selectedAsset}
        assets={assets}
        fetchAssets={fetchAssets}
        deleteAsset={deleteAsset}
      />
    </div>
  );
};

export default AssetTable;
