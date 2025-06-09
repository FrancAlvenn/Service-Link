import React, { forwardRef } from "react";
import logo from "../../../../../assets/dyci_logo.png";
import { formatDate, formatTime } from "../../../../../utils/dateFormatter";

const VehicleRequestTemplate = forwardRef(({ request, users }, ref) => {
  const requesterUser = users?.find(
    (u) => u.reference_number === request.requester
  );

  return (
    <div ref={ref} className="p-4 bg-white font-sans text-xs">
      {/* Header - Compact version */}
      <div className="relative flex items-center h-[50px] mb-2">
        <img
          src={logo}
          alt="DYCI"
          className="absolute left-0 w-[40px] h-[40px] object-cover"
        />

        <div className="w-full text-center">
          <h1 className="text-sm font-bold">DR. YANGA'S COLLEGES, INC.</h1>
          <p className="text-[9px]">GENERAL SERVICES OFFICE</p>
          <h1 className="text-sm font-bold mt-0.5">
            PERMIT TO USE SCHOOL VEHICLE
          </h1>
        </div>
      </div>

      {/* Top Section */}
      <div className="flex justify-between mb-2">
        <div className="flex items-center">
          <p>No.:</p>
          <div className="border-b border-black ml-1 w-30 text-center">
            {request.reference_number}
          </div>
        </div>
        <div className="flex items-center">
          <p>Date:</p>
          <div className="border-b border-black ml-1 w-20 text-center">
            {formatDate(request.created_at)}
          </div>
        </div>
      </div>

      {/* Vehicle Requested */}
      <div className="flex items-center mb-2">
        <p className="w-1/3">Vehicle requested:</p>
        <div className="border-b border-black flex-1 ml-1">
          {request.vehicle_requested}
        </div>
      </div>

      {/* Trip Details */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-2">
        <div className="flex items-center">
          <p className="w-1/2">Date of Trip:</p>
          <div className="border-b border-black flex-1 ml-1">
            {formatDate(request.date_of_trip)}
          </div>
        </div>

        <div className="flex items-center">
          <p className="w-1/2">Time of Departure:</p>
          <div className="border-b border-black flex-1 ml-1">
            {request.time_of_departure}
          </div>
        </div>

        <div className="flex items-center">
          <p className="w-1/2">No. of passengers:</p>
          <div className="border-b border-black flex-1 ml-1">
            {request.number_of_passengers}
          </div>
        </div>

        <div className="flex items-center">
          <p className="w-1/2">Time of Arrival:</p>
          <div className="border-b border-black flex-1 ml-1">
            {request.time_of_arrival}
          </div>
        </div>
      </div>

      {/* Destination and Purpose */}
      <div className="mb-2">
        <div className="flex items-center">
          <p className="w-1/4">Destination/s:</p>
          <div className="border-b border-black flex-1 ml-1">
            {request.title}
          </div>
        </div>

        <div className="flex items-center mt-1">
          <p className="w-1/4">Purpose/s:</p>
          <div className="border-b border-black flex-1 ml-1">
            {request.purpose}
          </div>
        </div>
      </div>

      {/* Signatures - Top Row */}
      <div className="grid grid-cols-2 gap-4 mb-2 mt-4 pt-8">
        <div>
          <div className="flex items-center mb-4">
            <p>Requested by:</p>
            <div className="border-b border-black flex-1 ml-1">
              {requesterUser
                ? `${requesterUser.last_name}, ${requesterUser.first_name}`
                : ""}
            </div>
          </div>
          <div className="flex items-center mt-4">
            <p>Position:</p>
            <div className="border-b border-black flex-1 ml-1">
              {requesterUser?.designation?.designation || ""}
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center">
            <p>Checked by:</p>
            <div className="border-b border-black flex-1 ml-1"></div>
          </div>
          <p className="text-[9px] mt-1">GSO, Personnel</p>
        </div>
      </div>

      {/* Signatures - Bottom Row */}
      <div className="grid grid-cols-2 gap-4 mt-8 pt-4">
        <div>
          <div className="flex items-center mb-4">
            <p>Approved by:</p>
            <div className="border-b border-black flex-1 ml-1"></div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center mt-1">
              <p>_____ GSO, Director</p>
              <div className="flex items-center ml-2">
                <span className="mr-1">—Approved</span>
                <span>/ ___disapproved</span>
              </div>
            </div>
            <p className="text-[9px] mt-1">Note: ______ Principal/Director</p>
          </div>
        </div>

        <div>
          <div className="flex items-center mb-4">
            <p>Noted by:</p>
            <div className="border-b border-black flex-1 ml-1"></div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-[8px] mt-2">
        DYCI-GSO 3 2 rev2 2023.02.01
      </div>
    </div>
  );
});

export default VehicleRequestTemplate;
