import React, { forwardRef } from "react";
import logo from "../../../../../assets/dyci_logo.png";
import { formatDate } from "../../../../../utils/dateFormatter";

const PurchasingRequestTemplate = forwardRef(({ request, users }, ref) => {
  const requesterUser = users?.find(
    (u) => u.reference_number === request.requester
  );

  // Supplier categories from your image
  const supplierCategories = [
    "Office Supplies",
    "Computer Parts / Peripherals",
    "Electrical Supplies",
    "Office Equipment",
    "Tools / Equipment",
    "Other Consumables",
    "Machineries / Parts",
    "Publications",
    "Others",
  ];

  // Finance officers
  const financeOfficers = [
    { name: "MS. ELEANOR M. RATAY", position: "COLLEGE FINANCE" },
    { name: "MS. MELENCIA POLICARPIO", position: "CME FINANCE" },
    { name: "MS. CRISZA BERNARDO", position: "BED FINANCE" },
  ];

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
          <h1 className="text-lg font-bold mt-1">PURCHASE REQUISITION FORM</h1>
        </div>
      </div>

      {/* Top Section */}
      <div className="flex justify-between mb-4">
        <div className="flex items-center">
          <p>Control No.:</p>
          <div className="flex flex-col">
            <div className="border-b border-black ml-2 w-32 text-center">
              {request.reference_number}
            </div>
            <div className="text-[10px] italic text-center">
              (PR+Area+Date+Number)
            </div>
          </div>
        </div>
        <div className="flex items-center">
          <p>Date:</p>
          <div className="border-b border-black ml-2 w-32 text-center">
            {formatDate(request.created_at)}
          </div>
        </div>
      </div>

      {/* Department and Date Required */}
      <div className="mt-4">
        <div className="flex items-center">
          <p>From:</p>
          <div className="border-b border-black ml-2 flex-1">
            {requesterUser?.department?.name || "N/A"}
          </div>
        </div>
        <div className="text-[10px] italic ml-12">
          (Department / Office / Area)
        </div>

        <div className="flex items-center mt-2">
          <p>Date Required:</p>
          <div className="border-b border-black ml-2 flex-1">
            {formatDate(request.date_required)}
          </div>
        </div>
        <div className="text-[10px] italic ml-24">
          (Minimum of two (2) weeks)
        </div>
      </div>

      {/* Supplier Categories */}
      <div className="mt-4">
        <p className="mb-2">
          Kindly put a check in the supplier category of your requisition.
          Strictly one (1) category per requisition form.
        </p>

        <div className="grid grid-cols-3 gap-2 border border-black p-2">
          {supplierCategories.map((category, index) => (
            <div key={index} className="flex items-center">
              <div className="w-4 h-4 border border-black mr-2 flex items-center justify-center">
                {request.supply_category === category && "✓"}
              </div>
              <span>{category}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Items Table */}
      <div className="mt-4">
        <p className="mb-2">
          Enumerate the specific item/s below. If possible, include preferred
          brand, specifications, and item description of your requested item/s
          for reference.
        </p>

        <div className="border border-black">
          <div className="grid grid-cols-12 border-b border-black">
            <div className="col-span-3 p-1 text-center font-bold border-r border-black">
              QUANTITY
            </div>
            <div className="col-span-9 p-1 font-bold">
              PARTICULARS / ITEM DESCRIPTION / SPECIFICATIONS
            </div>
          </div>

          {request.details?.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-12 border-b border-black min-h-[40px]"
            >
              <div className="col-span-3 p-1 text-center border-r border-black">
                {item.quantity}
              </div>
              <div className="col-span-9 p-1">{item.particulars}</div>
            </div>
          ))}

          {/* Empty rows */}
          {Array.from({ length: Math.max(0, 5 - request.details.length) }).map(
            (_, i) => (
              <div
                key={`empty-${i}`}
                className="grid grid-cols-12 border-b border-black min-h-[40px]"
              >
                <div className="col-span-3 p-1 border-r border-black">
                  &nbsp;
                </div>
                <div className="col-span-9 p-1">&nbsp;</div>
              </div>
            )
          )}
        </div>
      </div>

      {/* Purpose */}
      <div className="mt-4">
        <div className="flex items-center">
          <p>Purpose of Request:</p>
          <div className="border-b border-black ml-2 flex-1">
            {request.purpose}
          </div>
        </div>
      </div>

      {/* Note */}
      <div className="mt-2 text-[10px] italic">
        ***Note: Purchase requisition form must be submitted minimum two (2)
        weeks prior to the date required otherwise request will not be
        processed. For urgent unplanned requirement use emergency purchase form
        (09).
      </div>

      {/* Signatures */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div>
          <div className="flex items-center">
            <p>Requested by:</p>
            <div className="border-b border-black ml-2 flex-1">
              {requesterUser
                ? `${requesterUser.last_name}, ${requesterUser.first_name}`
                : ""}
            </div>
          </div>
          <p className="text-[10px] ml-24 mt-1">(Requesting Personnel/ OIC)</p>
        </div>

        <div>
          <div className="flex items-center">
            <p>Checked / verified by:</p>
            <div className="border-b border-black ml-2 flex-1"></div>
          </div>
          <p className="text-[10px] ml-24 mt-1">Property Controller</p>
        </div>

        <div className="mt-4">
          <div className="flex items-center">
            <p>Recommending Approval by:</p>
            <div className="border-b border-black ml-2 flex-1"></div>
          </div>
          <p className="text-[10px] ml-24 mt-1">
            President/Executive Vice President/GSO Director
          </p>
        </div>

        <div className="mt-4">
          <div className="flex items-center">
            <p>Approved by:</p>
            <div className="border-b border-black ml-2 flex-1"></div>
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
      <div className="text-left text-xs mt-6">
        DYCI-GSO 10.2 rev6 2024.02.20
      </div>
    </div>
  );
});

export default PurchasingRequestTemplate;
