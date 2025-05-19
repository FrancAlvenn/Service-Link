import {
  Card,
  CardBody,
  CardHeader,
  Typography,
} from "@material-tailwind/react";
import {
  ReadCvLogo,
  ShoppingCart,
  CalendarCheck,
  Car,
} from "@phosphor-icons/react";
import React, { useState } from "react";
import RequestForm from "./RequestForm";

const RaiseRequest = () => {
  const [selectedRequest, setSelectedRequest] = useState("");

  return (
    <div className="min-h-screen h-full w-full bg-white dark:bg-gray-900 rounded-lg mt-0 px-3 flex flex-col justify-between transition-colors">
      <div className="flex flex-col h-full">
        {/* Header */}
        <CardHeader
          floated={false}
          shadow={false}
          className="rounded-none min-h-fit pb-4 dark:bg-gray-900"
        >
          <div className="mb-1 flex items-center justify-between">
            <div>
              <Typography
                className="text-lg font-bold cursor-pointer text-gray-900 dark:text-gray-100"
                onClick={() => setSelectedRequest("")}
              >
                General Service Request
              </Typography>
              <Typography className="mt-1 font-normal text-sm text-gray-600 dark:text-gray-300">
                Welcome! You can submit a request to the General Services Office
                for assistance.
              </Typography>
            </div>
          </div>
        </CardHeader>

        {/* Section Title */}
        <div className="flex flex-col px-4">
          <Typography className="text-gray-500 dark:text-gray-400 font-semibold text-sm">
            What can we help you with?
          </Typography>
        </div>

        {/* Request Selection */}
        {!selectedRequest ? (
          <CardBody className="p-2 flex flex-col gap-4 w-full pb-28 ">
            {/* Job Request */}
            <Card
              className="p-5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition w-full dark:bg-gray-800"
              onClick={() => setSelectedRequest("job_request")}
            >
              <div className="flex items-center gap-4">
                <ReadCvLogo className="h-8 w-8 text-blue-500" />
                <span>
                  <Typography className="text-blue-700 dark:text-blue-400 font-semibold text-sm">
                    Submit a Job Request
                  </Typography>
                  <Typography className="text-gray-500 dark:text-gray-400 font-normal text-sm">
                    Raise a request or report a problem.
                  </Typography>
                </span>
              </div>
            </Card>

            {/* Purchasing Request */}
            <Card
              className="p-5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition w-full dark:bg-gray-800"
              onClick={() => setSelectedRequest("purchasing_request")}
            >
              <div className="flex items-center gap-4">
                <ShoppingCart className="h-8 w-8 text-green-500" />
                <span>
                  <Typography className="text-green-700 dark:text-green-400 font-semibold text-sm">
                    Request for Purchasing
                  </Typography>
                  <Typography className="text-gray-500 dark:text-gray-400 font-normal text-sm">
                    Submit a request for procurement of items or supplies.
                  </Typography>
                </span>
              </div>
            </Card>

            {/* Venue Booking Request */}
            <Card
              className="p-5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition w-full dark:bg-gray-800"
              onClick={() => setSelectedRequest("venue_request")}
            >
              <div className="flex items-center gap-4">
                <CalendarCheck className="h-8 w-8 text-purple-500" />
                <span>
                  <Typography className="text-purple-700 dark:text-purple-400 font-semibold text-sm">
                    Book a Venue
                  </Typography>
                  <Typography className="text-gray-500 dark:text-gray-400 font-normal text-sm">
                    Request a venue for meetings, events, or activities.
                  </Typography>
                </span>
              </div>
            </Card>

            {/* Vehicle Request */}
            <Card
              className="p-5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition w-full dark:bg-gray-800"
              onClick={() => setSelectedRequest("vehicle_request")}
            >
              <div className="flex items-center gap-4">
                <Car className="h-8 w-8 text-red-500" />
                <span>
                  <Typography className="text-red-700 dark:text-red-400 font-semibold text-sm">
                    Request a Vehicle
                  </Typography>
                  <Typography className="text-gray-500 dark:text-gray-400 font-normal text-sm">
                    Arrange for official transportation services.
                  </Typography>
                </span>
              </div>
            </Card>
          </CardBody>
        ) : (
          <RequestForm
            selectedRequest={selectedRequest}
            setSelectedRequest={setSelectedRequest}
          />
        )}
      </div>
    </div>
  );
};

export default RaiseRequest;
