import {
    Card,
    CardHeader,
    Input,
    Typography,
    Button,
    CardBody,
    CardFooter,
    Tabs,
    TabsHeader,
    Tab,
  } from "@material-tailwind/react";
  
  import { TABS, TABLE_HEAD, VENUE_REQUEST,  } from "../data/data";
  import { MagnifyingGlass, MagnifyingGlassMinus, UserPlus } from "@phosphor-icons/react";
  import { useState } from "react";
  
  export function VenueRequests() {
    const [searchQuery, setSearchQuery] = useState("");
  
    const handleSearch = (e) => {
      setSearchQuery(e.target.value);
    }
  
    // Filter data based on the selected type
    const filteredRows = VENUE_REQUEST.filter((row) => {
      // Check if the searchQuery is found anywhere in the row (case insensitive)
      const matchesSearchQuery = Object.values(row)
        .join(" ")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
  
      // Return true if both conditions match
      return matchesSearchQuery;
    });
  
    return (
      <div className="h-full bg-white rounded-lg w-full mt-0 px-3 flex flex-col justify-between">
        <div className="flex flex-col gap-4 h-full">
          <CardHeader floated={false} shadow={false} className="rounded-none min-h-fit">
            <div className="mb-1 flex items-center justify-between gap-5">
              <div>
                <Typography color="black" className="text-lg font-bold">
                  Venue Requests
                </Typography>
                <Typography color="gray" className="mt-1 font-normal text-sm">
                  See information about requests
                </Typography>
              </div>
              <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                <Button className="flex items-center gap-3 bg-blue-500" size="sm">
                  <UserPlus strokeWidth={2} className="h-4 w-4" /> Add request
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between gap-4 md:flex-row">
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
              <thead className="sticky top-0 mt-0 z-10">
                <tr>
                  {TABLE_HEAD.map((header, index) => (
                    <th
                      key={index}
                      className="cursor-pointer bg-white p-4 transition-colors hover:bg-blue-gray-50"
                    >
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="flex items-center justify-between gap-2 font-normal leading-none opacity-70"
                      >
                        {header.label || header}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row, rowIndex) => {
                  const isLast = rowIndex === filteredRows.length - 1;
                  const classes = isLast ? "p-4" : "px-4 py-5 w-fit";
                  return (
                    <tr key={rowIndex}>
                      {TABLE_HEAD.map((header, colIndex) => (
                        <td key={colIndex} className={classes}>
                          <p
                            className={`text-sm w-fit ${header.value === "summary" ? "text-blue-500" : ""} `}
                            onClick={() => {
                              if (header.value === "summary") {
                                console.log(row[header.value]);
                              }
                            }}
                          >
                            {row[header.value]}
                          </p>
                        </td>
                      ))}
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
  
  export default VenueRequests;
  