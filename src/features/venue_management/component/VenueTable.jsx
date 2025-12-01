import {
  CardHeader,
  Typography,
  Button,
  CardBody,
} from "@material-tailwind/react";
import { MagnifyingGlass, Plus } from "@phosphor-icons/react";
import { useContext, useState } from "react";
import { getColumnConfig } from "../utils/columnConfig.js";
import { VenueContext } from "../context/VenueContext.js";
import Header from "../../../layouts/header.js";
import VenueForm from "./VenueForm.jsx";

const VenueTable = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { venues, fetchVenues, deleteVenue } = useContext(VenueContext);
  const [venueModalOpen, setVenueModalOpen] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState(null);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredRows = (Array.isArray(venues) ? venues : []).filter((row) => {
    const rowString = Object.entries(row)
      .map(([_, value]) => {
        if (Array.isArray(value)) {
          return value.join(" ");
        }
        return value;
      })
      .join(" ")
      .toLowerCase();
    return rowString.includes(searchQuery.toLowerCase());
  });

  const columns = getColumnConfig({ setVenueModalOpen, setSelectedVenue });

  return (
    <div className="flex flex-col h-full bg-white">
      <CardHeader
        floated={false}
        shadow={false}
        className="rounded-none min-h-fit pb-1"
      >
        <Header
          title={"Venue Management"}
          description={"View and manage venue schedules"}
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
          <Button
            variant="outlined"
            size="sm"
            color="blue"
            className="flex items-center gap-2"
            onClick={() => {
              setSelectedVenue(null);
              setVenueModalOpen(true);
            }}
          >
            <Plus size={16} />
            Add Venue
          </Button>
        </div>
      </CardHeader>
      <div className="h-full bg-white rounded-lg w-full mt-0 px-3 flex justify-between">
        <div className="h-full bg-white w-full mt-0 px-3 flex justify-between">
          <div className="flex flex-col gap-4 h-full w-full">
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
                              ? col.render(row)
                              : row[col.key] || "N/A"}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={columns.length} className="text-center py-4">
                        <Typography variant="small" color="gray">
                          No venues available.
                        </Typography>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardBody>
          </div>
        </div>
      </div>

      {venueModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={() => {
            setVenueModalOpen(false);
            setSelectedVenue(null);
          }}
        >
          <div
            className="bg-white dark:bg-gray-900 w-full h-full lg:max-w-[80vw] lg:max-h-[90vh] overflow-y-auto rounded-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <VenueForm
              mode={selectedVenue ? "edit" : "add"}
              initialValues={selectedVenue}
              onClose={() => {
                setVenueModalOpen(false);
                setSelectedVenue(null);
              }}
              onSuccess={() => {
                fetchVenues();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default VenueTable;

