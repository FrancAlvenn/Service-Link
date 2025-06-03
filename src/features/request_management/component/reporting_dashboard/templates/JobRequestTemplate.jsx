import React, { forwardRef } from "react";
import logo from "../../../../../assets/dyci_logo.png";
import { formatDate } from "../../../../../utils/dateFormatter";

const JobRequestTemplate = forwardRef(
  ({ request, departments, users }, ref) => {
    const requesterUser = users?.find(
      (u) => u.reference_number === request.requester
    );

    // Find finance officers
    const financeOfficers = [
      { name: "MS. ELEANOR M. RATAY", position: "COLLEGE FINANCE" },
      { name: "MS. MELENCIA POLICARPIO", position: "CME FINANCE" },
      { name: "MS. CRISZA BERNARDO", position: "BED FINANCE" },
    ];

    return (
      <div ref={ref} className="p-4 bg-white">
        <div className="relative flex items-center h-[70px] mb-4">
          <img
            src={logo}
            alt="DYCI"
            className="absolute left-0 w-[70px] h-[70px] object-cover"
          />

          <div className="w-full text-center">
            <h1 className="text-lg font-bold">DR. YANGA'S COLLEGES, INC.</h1>
            <p className="text-xs">GENERAL SERVICES OFFICE</p>
            <h1 className="text-lg font-bold">JOB REQUEST FORM</h1>
          </div>
        </div>

        <div className="pt-2 flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <p className="whitespace-nowrap">Date:</p>
            <div className="border-b border-black w-[150px] text-sm">
              {formatDate(request.created_at)}
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <p className="whitespace-nowrap">Control No.:</p>
              <div className="border-b border-black w-[150px] text-sm">
                {request.reference_number}
              </div>
            </div>
            <p className="text-[10px] ml-auto">JR+Date+No.</p>
          </div>

          <div className="flex items-center gap-2">
            <p className="whitespace-nowrap">Date Required:</p>
            <div className="border-b border-black w-[150px] text-sm">
              {formatDate(request.date_required)}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 mt-2">
          {/* Area/Department */}
          <div className="flex items-center gap-2 w-2/3">
            <p className="whitespace-nowrap">Area/Department:</p>
            <div className="border-b border-black w-full text-sm">
              {requesterUser.department.name || ""}
            </div>
          </div>

          {/* Date Completed */}
          <div className="flex items-center gap-2 w-1/3">
            <p className="whitespace-nowrap">Date Completed:</p>
            <div className="border-b border-black w-full text-sm">&nbsp;</div>
          </div>
        </div>

        {/* Purpose */}
        <div className="flex items-center justify-between gap-2 mt-2">
          <div className="flex items-center gap-2 w-full">
            <p className="whitespace-nowrap">Purpose:</p>
            <div className="border-b border-black w-full text-sm">
              {request.purpose}
            </div>
          </div>
        </div>

        {/* Table here */}
        <div className="mt-4 border border-black">
          <div className="grid grid-cols-4 border-b border-black font-bold text-sm text-center">
            <div className="border-r border-black py-1">QTY</div>
            <div className="border-r border-black py-1">PARTICULARS</div>
            <div className="border-r border-black py-1">
              DESCRIPTION
              <br />
              NATURE OF WORK
            </div>
            <div className="py-1">REMARKS</div>
          </div>

          {request.details?.map((detail, index) => (
            <div
              key={index}
              className="grid grid-cols-4 text-sm text-center border-b border-black last:border-b-0"
            >
              <div className="border-r border-black py-4">
                {detail.quantity}
              </div>
              <div className="border-r border-black py-4">
                {detail.particulars}
              </div>
              <div className="border-r border-black py-4">
                {detail.description}
              </div>
              <div className="py-4">{detail.remarks || ""}</div>
            </div>
          ))}

          {/* Optional: Fill empty rows if you want a fixed table height (like in printed forms) */}
          {Array.from({ length: 7 - request.details.length }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="grid grid-cols-4 text-sm text-center border-b border-black last:border-b-0"
            >
              <div className="border-r border-black py-4">&nbsp;</div>
              <div className="border-r border-black py-4">&nbsp;</div>
              <div className="border-r border-black py-4">&nbsp;</div>
              <div className="py-4">&nbsp;</div>
            </div>
          ))}
        </div>

        {/* Signatures here */}
        <div className="flex items-start justify-between gap-2 mt-8">
          <div className="flex gap-2 w-2/3">
            <p className="font-semibold">Requested/Prepared by: </p>
            <span className="flex flex-col gap-1">
              <span className="underline">
                {requesterUser.last_name}, {requesterUser.first_name}
              </span>
              <div className="flex flex-col gap-0">
                <p className="text-[10px] font-semibold ml-auto py-0">
                  Requesting O.I.C
                </p>
                <p className="text-[10px] font-semibold ml-auto py-0">
                  Signature over Printed Name
                </p>
              </div>
            </span>
          </div>
          <div className="w-1/3 flex gap-2">
            <p className="font-semibold">Position:</p>
            <span className="underline">
              {requesterUser.designation.designation}
            </span>
          </div>
        </div>

        <div className="flex justify-between items-start gap-3 mt-4">
          <div className="flex flex-col gap-4 w-2/3">
            {/* Noted By */}
            <div>
              <div className="flex items-center">
                <p className="font-semibold whitespace-nowrap mr-2">
                  Noted By:
                </p>
                <div className="border-b border-black w-[200px]"></div>
              </div>
              <div className="flex justify-start text-[10px] ml-[160px]">
                <p className="text-[10px] ml-[80px]">Property Controller</p>
              </div>
            </div>

            {/* Approval Section */}
            <div className="flex flex-col gap-6 justify-between">
              <div>
                <div className="flex items-center">
                  <p className="font-semibold whitespace-nowrap mr-2">
                    Recommending Approval:
                  </p>
                  <div className="border-b border-black flex-1 w-[200px] h-0.5"></div>
                </div>
                <div className="flex justify-start text-[10px] ml-[160px]">
                  <span>Department Head/Assistant Director</span>
                </div>
              </div>

              <div>
                <div className="flex items-center">
                  <p className="font-semibold whitespace-nowrap mr-2">
                    Approved By:
                  </p>
                  <div className="border-b border-black flex-1 w-[200px] h-0.5"></div>
                </div>
                <p className="text-[10px] ml-[130px]">
                  President/Executive Vice President/GSO Director
                </p>
              </div>
            </div>
          </div>

          {/* Checked and Received */}
          <div className="border p-4 w-1/3">
            <div>
              <p className="font-semibold mb-6">
                Checked and Received Completed Work by:
              </p>
            </div>
            <div className="flex flex-col gap-0">
              <div className="border-b border-black mt-2 w-[200px]"></div>
              <p className="text-[10px] font-semibold py-0">Requesting O.I.C</p>
              <p className="text-[10px] font-semibold py-0">
                Signature over Printed Name
              </p>
            </div>
            <div>
              <div className="border-b border-black mt-4 w-[200px]"></div>
              <p className="text-[10px] font-semibold mt-1">
                Date of Completion
              </p>
            </div>
          </div>
        </div>

        {/* Finance Officers */}
        <div className="flex justify-between mt-8">
          {financeOfficers.map((officer, index) => (
            <div key={index} className="text-center">
              <p className="text-xs font-semibold">{officer.name}</p>
              <p className="text-xs">{officer.position}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-left text-[8px] mt-3">
          DYCI-6SO 11 2 rev4 2024.02.20
        </div>
      </div>
    );
  }
);

export default JobRequestTemplate;
