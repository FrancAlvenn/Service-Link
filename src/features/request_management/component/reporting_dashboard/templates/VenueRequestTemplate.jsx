import React, { forwardRef } from "react";
import logo from "../../../../../assets/dyci_logo.png";
import { formatDate } from "../../../../../utils/dateFormatter";

const VenueRequestTemplate = forwardRef(({ request, users }, ref) => {
  const requesterUser = users?.find(
    (u) => u.reference_number === request.requester
  );

  // Format date range
  const formattedDate = request.event_dates
    ? new Date(request.event_dates).toLocaleDateString("en-PH")
    : "";

  // Format time range
  const formatTime = (timeString) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours, 10);
    return hour > 12 ? `${hour - 12}:${minutes} PM` : `${hour}:${minutes} AM`;
  };

  const timeRange =
    request.event_start_time && request.event_end_time
      ? `${formatTime(request.event_start_time)} - ${formatTime(
          request.event_end_time
        )}`
      : "";

  // Check if nature of activity is "others"
  const isOtherNature = request.event_nature === "others";

  return (
    <div ref={ref} className="p-4 bg-white font-sans text-sm">
      {/* Header */}
      <div className="relative flex items-center h-[70px] mb-4">
        <img
          src={logo}
          alt="DYCI"
          className="absolute left-0 w-[70px] h-[70px] object-cover"
        />

        <div className="w-full text-center">
          <h1 className="text-lg font-bold">DR. YANGA'S COLLEGES, INC.</h1>
          <p className="text-xs">GENERAL SERVICES OFFICE</p>
          <h1 className="text-lg font-bold mt-1">
            PERMIT TO USE SCHOOL FACILITIES
          </h1>
        </div>
      </div>

      {/* Top Section */}
      <div className="flex justify-between mb-4">
        <div>
          <div className="flex items-center">
            <p>Reference No.:</p>
            <div className="border-b border-black ml-2 w-32 text-center">
              {request.reference_number}
            </div>
          </div>
        </div>
        <div>
          <div className="flex items-center">
            <p>Date:</p>
            <div className="border-b border-black ml-2 w-32 text-center">
              {formatDate(request.created_at)}
            </div>
          </div>
        </div>
      </div>

      {/* Requestor Information */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center">
          <p className="w-1/2">Name and Signature of Requestor:</p>
          <div className="border-b border-black flex-1 ml-2">
            {requesterUser
              ? `${requesterUser.last_name}, ${requesterUser.first_name}`
              : ""}
          </div>
        </div>

        <div className="flex items-center">
          <p className="w-1/2">
            Name of Department/Yr. & Section/Organization:
          </p>
          <div className="border-b border-black flex-1 ml-2">
            {request?.organization || ""}
          </div>
        </div>

        <div className="flex items-center">
          <p className="w-1/2">Activity:</p>
          <div className="border-b border-black flex-1 ml-2">
            {request.title}
          </div>
        </div>

        <div className="flex items-center">
          <p className="w-1/2">Purpose:</p>
          <div className="border-b border-black flex-1 ml-2">
            {request.purpose}
          </div>
        </div>

        {/* Nature of Activity */}
        <div className="flex items-start">
          <p className="w-1/2">Nature of activity (please check one):</p>
          <div className="flex-1 ml-2">
            <div className="flex items-center">
              <div className="w-4 h-4 border border-black mr-1 flex items-center justify-center">
                {request.event_nature === "curricular" && "✓"}
              </div>
              <span>Curricular</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 border border-black mr-1 flex items-center justify-center">
                {request.event_nature === "co-curricular" && "✓"}
              </div>
              <span>Co-curricular</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 border border-black mr-1 flex items-center justify-center">
                {isOtherNature && "✓"}
              </div>
              <span>Others</span>
              {isOtherNature && (
                <div className="border-b border-black ml-2 flex-1">
                  {request.other_nature_details}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Date and Time */}
        <div className="flex items-center">
          <p className="w-1/2">Date/s Needed:</p>
          <div className="border-b border-black flex-1 ml-2">
            {formattedDate}
          </div>
        </div>

        <div className="flex items-center">
          <p className="w-1/2">Time Needed:</p>
          <div className="border-b border-black flex-1 ml-2">{timeRange}</div>
        </div>

        {/* Participants */}
        <div className="flex items-center">
          <p className="w-1/2">Participants:</p>
          <div className="border-b border-black flex-1 ml-2">
            {request.participants}
          </div>
        </div>

        {/* Pax Estimation */}
        <div className="flex items-center">
          <p className="w-1/2">No. of pax:</p>
          <div className="flex-1 ml-2 flex items-center">
            <span>Male</span>
            <div className="border-b border-black w-16 mx-2 text-center"></div>
            <span>Female</span>
            <div className="border-b border-black w-16 mx-2 text-center"></div>
            <span>Estimation</span>
            <div className="border-b border-black w-16 mx-2 text-center">
              {request.pax_estimation}
            </div>
          </div>
        </div>

        {/* Venue Selection */}
        <div className="flex items-start">
          <p className="w-1/2">Venue:</p>
          <div className="flex-1 ml-2">
            <div className="grid grid-cols-3 gap-1">
              {[
                "DMDV Complex",
                "Chapel",
                "Science Lab",
                "Studio",
                "Comp. Lab",
                "Magnili Hall",
                "Annex Complex",
              ].map((venue) => (
                <div key={venue} className="flex items-center">
                  <div className="w-4 h-4 border border-black mr-1 flex items-center justify-center">
                    {request.venue_requested === venue && "✓"}
                  </div>
                  <span>{venue}</span>
                </div>
              ))}
              <div className="flex items-center col-span-3">
                <div className="w-4 h-4 border border-black mr-1 flex items-center justify-center">
                  {![
                    "DMDV Complex",
                    "Chapel",
                    "Science Lab",
                    "Studio",
                    "Comp. Lab",
                    "Magnili Hall",
                    "Annex Complex",
                  ].includes(request.venue_requested) && "✓"}
                </div>
                <span>Others specify</span>
                <div className="border-b border-black ml-2 flex-1">
                  {![
                    "DMDV Complex",
                    "Chapel",
                    "Science Lab",
                    "Studio",
                    "Comp. Lab",
                    "Magnili Hall",
                    "Annex Complex",
                  ].includes(request.venue_requested) &&
                    request.venue_requested}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Equipment List */}
      <div className="mb-4">
        <p className="font-semibold mb-2">
          List of Equipment/Materials needed:
        </p>
        <div className="grid grid-cols-2 gap-2">
          {[
            "Chairs",
            "Tables",
            "Microphones",
            "White board",
            "LCD Projector",
            "Electric Fans",
            "Water Dispenser",
            "LED Monitor",
          ].map((item) => {
            const detail = request.details.find((d) =>
              d.particulars.toLowerCase().includes(item.toLowerCase())
            );

            return (
              <div key={item} className="flex items-center">
                <span className="w-32">{item}</span>
                <div className="border-b border-black w-16 mx-2 text-center">
                  {detail?.quantity || ""}
                </div>
                <span>pcs</span>
              </div>
            );
          })}
          <div className="flex items-center col-span-2">
            <span className="w-32">Others</span>
            <div className="border-b border-black flex-1 mx-2">
              {request.details
                .filter(
                  (d) =>
                    ![
                      "Chairs",
                      "Tables",
                      "Microphones",
                      "White board",
                      "LCD Projector",
                      "Electric Fans",
                      "Water Dispenser",
                      "LED Monitor",
                    ].some((item) =>
                      d.particulars.toLowerCase().includes(item.toLowerCase())
                    )
                )
                .map((d) => `${d.particulars} (${d.quantity} pcs)`)
                .join(", ")}
            </div>
          </div>
        </div>
      </div>

      {/* Remarks */}
      <div className="mb-6">
        <p>Remarks:</p>
        <div className="border-b border-black w-full h-8">
          {request.remarks}
        </div>
      </div>

      {/* Signatures */}
      <div className="flex justify-between">
        <div className="flex-1">
          <div className="flex items-center">
            <p>Recommending Approval:</p>
            <div className="border-b border-black flex-1 ml-2 h-6"></div>
          </div>
          <p className="text-xs mt-1">
            Department Head OIC/Property Controller
          </p>
        </div>

        <div className="flex-1 ml-4">
          <div className="flex items-center">
            <p>Received:</p>
            <div className="border-b border-black flex-1 ml-2 h-6"></div>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center">
          <p>Approved:</p>
          <div className="border-b border-black flex-1 ml-2 h-6"></div>
        </div>
        <p className="text-xs mt-1">Director, GSO</p>
      </div>

      {/* Footer */}
      <div className="text-center text-xs mt-8">
        DYCJ-GSO 2 2 rev2 2023 02.01
      </div>
    </div>
  );
});

export default VenueRequestTemplate;
