import { Card, CardBody, CardHeader, Typography } from "@material-tailwind/react";
import { ReadCvLogo, ShoppingCart, CalendarCheck, Car } from "@phosphor-icons/react";
import React, { useState } from "react";
import RequestForm from "./RequestForm";

const RaiseRequest = () => {

  const [selectedRequest, setSelectedRequest] = useState("");


  return (
    <div className="h-full bg-white rounded-lg w-full mt-0 px-3 flex flex-col justify-between">
      <div className="flex flex-col h-full">
        <CardHeader floated={false} shadow={false} className="rounded-none min-h-fit pb-4">
          <div className="mb-1 flex items-center justify-between gap-3w">
            <div>
              <Typography color="black" className="text-lg font-bold cursor-pointer" onClick={() => setSelectedRequest("")}>General Service Request</Typography>
              <Typography color="gray" className="mt-1 font-normal text-sm">
                Welcome! You can submit a request to the General Services Office for assistance.
              </Typography>
            </div>
          </div>
        </CardHeader>

        <div className="flex flex-col px-4">
          <Typography className="text-gray-500 font-semibold text-sm">What can we help you with?</Typography>
        </div>

        {!selectedRequest ? (<CardBody className="flex flex-col gap-4">
          {/* Job Request */}
          <Card className="p-5 cursor-pointer hover:bg-gray-100 transition" onClick={() => setSelectedRequest("job_request")}>
            <div className="flex items-center gap-4">
              <ReadCvLogo className="h-8 w-8 text-blue-500" />
              <span>
                <Typography className="text-blue-700 font-semibold text-sm">Submit a Job Request</Typography>
                <Typography className="text-gray-500 font-normal text-sm">
                  Raise a request or report a problem.
                </Typography>
              </span>
            </div>
          </Card>

          {/* Purchasing Request */}
          <Card className="p-5 cursor-pointer hover:bg-gray-100 transition" onClick={() => setSelectedRequest("purchasing_request")}>
            <div className="flex items-center gap-4">
              <ShoppingCart className="h-8 w-8 text-green-500" />
              <span>
                <Typography className="text-green-700 font-semibold text-sm">Request for Purchasing</Typography>
                <Typography className="text-gray-500 font-normal text-sm">
                  Submit a request for procurement of items or supplies.
                </Typography>
              </span>
            </div>
          </Card>

          {/* Venue Booking Request */}
          <Card className="p-5 cursor-pointer hover:bg-gray-100 transition" onClick={() => setSelectedRequest("venue_request")}>
            <div className="flex items-center gap-4">
              <CalendarCheck className="h-8 w-8 text-purple-500" />
              <span>
                <Typography className="text-purple-700 font-semibold text-sm">Book a Venue</Typography>
                <Typography className="text-gray-500 font-normal text-sm">
                  Request a venue for meetings, events, or activities.
                </Typography>
              </span>
            </div>
          </Card>

          {/* Vehicle Request */}
          <Card className="p-5 cursor-pointer hover:bg-gray-100 transition" onClick={() => setSelectedRequest("vehicle_request")}>
            <div className="flex items-center gap-4">
              <Car className="h-8 w-8 text-red-500" />
              <span>
                <Typography className="text-red-700 font-semibold text-sm">Request a Vehicle</Typography>
                <Typography className="text-gray-500 font-normal text-sm">
                  Arrange for official transportation services.
                </Typography>
              </span>
            </div>
          </Card>
        </CardBody>) :
        (
          <RequestForm selectedRequest={selectedRequest} setSelectedRequest={setSelectedRequest}></RequestForm>
        )}
      </div>
    </div>
  );
};

export default RaiseRequest;
