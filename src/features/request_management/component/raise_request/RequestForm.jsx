import React, { useState } from "react";
import { Card, Typography } from "@material-tailwind/react";
import { ReadCvLogo, ShoppingCart, CalendarCheck, Car } from "@phosphor-icons/react";
import JobRequestForm from "./forms/JobRequestForm";
import PurchasingRequestForm from "./forms/PurchasingRequestForm";
import VenueRequestForm from "./forms/VenueRequestForm";
import VehicleRequestForm from "./forms/VehicleRequestForm";

const requestOptions = [
  { key: "job_request", label: "Submit a Job Request", description: "Raise a request or report a problem.", icon: <ReadCvLogo className="h-8 w-8 text-blue-500" />, color: "text-blue-700" },
  { key: "purchasing_request", label: "Request for Purchasing", description: "Submit a request for procurement of items or supplies.", icon: <ShoppingCart className="h-8 w-8 text-green-500" />, color: "text-green-700" },
  { key: "venue_request", label: "Book a Venue", description: "Request a venue for meetings, events, or activities.", icon: <CalendarCheck className="h-8 w-8 text-purple-500" />, color: "text-purple-700" },
  { key: "vehicle_request", label: "Request a Vehicle", description: "Arrange for official transportation services.", icon: <Car className="h-8 w-8 text-red-500" />, color: "text-red-700" },
];

const RequestForm = ({ selectedRequest, setSelectedRequest }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const currentSelection = requestOptions.find((option) => option.key === selectedRequest) || requestOptions[0];

  return (
    <div className="flex flex-col gap-2 px-4 py-6 overflow-y-auto">
      {/* Dropdown Trigger - Selected Card */}
        <div className="relative w-full">
            <Card 
            className="p-5 cursor-pointer hover:bg-gray-100 transition shadow-md w-full"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
                <div className="flex items-center gap-4">
                    {currentSelection.icon}
                    <span>
                    <Typography className={`font-semibold text-sm ${currentSelection.color}`}>
                        {currentSelection.label}
                    </Typography>
                    <Typography className="text-xs text-gray-500">{currentSelection.description}</Typography>
                    </span>
                </div>
            </Card>

            {/* Dropdown List - Shown when clicked */}
            {isDropdownOpen && (
                <div className="absolute w-full mt-2 bg-white shadow-lg z-50">
                    {requestOptions.map((option) => (
                    <div
                        key={option.key}
                        className="p-5 cursor-pointer hover:bg-gray-100 transition w-full"
                        onClick={() => {
                        setSelectedRequest(option.key);
                        setIsDropdownOpen(false); // Close dropdown after selection
                        }}
                    >
                        <div className="flex items-center gap-4">
                        {option.icon}
                        <span>
                            <Typography className={`font-semibold text-sm ${option.color}`}>
                            {option.label}
                            </Typography>
                            <Typography className="text-xs text-gray-500">{option.description}</Typography>
                        </span>
                        </div>
                    </div>
                    ))}
                </div>
                )}
        </div>

        <div className="my-4">
            <Typography className="text-gray-500 font-semibold text-sm">Required fields are marked with an asterisk <span className="text-red-500">*</span></Typography>
        </div>

        {(() => {
            switch (selectedRequest) {
                case "job_request":
                    return <JobRequestForm />;
                case "purchasing_request":
                    return <PurchasingRequestForm />;
                case "venue_request":
                    return <VenueRequestForm />;
                case "vehicle_request":
                    return <VehicleRequestForm />;
                default:
                    return null;
            }
        })()}
        
    </div>
  );
};

export default RequestForm;
