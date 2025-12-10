import React, { useState, useEffect } from "react";
import { Card, Typography } from "@material-tailwind/react";
import {
  ReadCvLogo,
  ShoppingCart,
  CalendarCheck,
  Car,
  Info,
} from "@phosphor-icons/react";
import JobRequestForm from "./forms/JobRequestForm";
import PurchasingRequestForm from "./forms/PurchasingRequestForm";
import VenueRequestForm from "./forms/VenueRequestForm";
import VehicleRequestForm from "./forms/VehicleRequestForm";
import { useContext } from "react";
import { AuthContext } from "../../../authentication";
import { useLocation } from "react-router-dom";

const requestOptions = [
  {
    key: "job_request",
    label: "Submit a Job Request",
    description: "Raise a request or report a problem.",
    icon: <ReadCvLogo className="h-8 w-8 text-blue-500 dark:text-blue-400" />,
    color: "text-blue-700 dark:text-blue-300",
  },
  {
    key: "purchasing_request",
    label: "Request for Purchasing",
    description: "Submit a request for procurement of items or supplies.",
    icon: (
      <ShoppingCart className="h-8 w-8 text-green-500 dark:text-green-400" />
    ),
    color: "text-green-700 dark:text-green-300",
  },
  {
    key: "venue_request",
    label: "Book a Venue",
    description: "Request a venue for meetings, events, or activities.",
    icon: (
      <CalendarCheck className="h-8 w-8 text-purple-500 dark:text-purple-400" />
    ),
    color: "text-purple-700 dark:text-purple-300",
  },
  {
    key: "vehicle_request",
    label: "Request a Vehicle",
    description: "Arrange for official transportation services.",
    icon: <Car className="h-8 w-8 text-red-500 dark:text-red-400" />,
    color: "text-red-700 dark:text-red-300",
  },
];

const RequestForm = ({ selectedRequest, setSelectedRequest }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const [aiConfidences, setAiConfidences] = useState({});
  const [prefillData, setPrefillData] = useState({});

  // Extract AI data from navigation state
  useEffect(() => {
    if (location.state?.prefill) {
      setPrefillData(location.state.prefill);
    }
    if (location.state?.aiConfidences) {
      setAiConfidences(location.state.aiConfidences);
    }
  }, [location.state]);

  // Filter options based on role
  const availableOptions = requestOptions.filter((option) => {
    if (user?.designation === 1) {
      // Student: restrict job and purchasing requests
      return !["job_request", "purchasing_request"].includes(option.key);
    }
    return true;
  });

  const currentSelection =
    availableOptions.find((option) => option.key === selectedRequest) ||
    availableOptions[0];

  // Get confidence for current form
  const getConfidence = (field) => {
    const confidence = aiConfidences[field];
    return confidence !== undefined ? Math.round(confidence * 100) : null;
  };

  // Render confidence indicator
  const renderConfidence = (field) => {
    const confidence = getConfidence(field);
    if (confidence === null) return null;
    
    const color = confidence >= 80 ? "text-green-600" : confidence >= 60 ? "text-yellow-600" : "text-red-600";
    return (
      <div className={`flex items-center gap-1 text-xs ${color} ml-1`}>
        <Info size={12} />
        <span>{confidence}% confident</span>
      </div>
    );
  };

  const fieldLabelOverrides = {
    event_dates: "Event Date",
    event_start_time: "Event Start Time",
  };

  const formatFieldLabel = (key) => {
    const override = fieldLabelOverrides[key];
    if (override) return override;
    return key
      .replace(/_/g, " ")
      .split(" ")
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(" ");
  };

  return (
    <div className="flex flex-col gap-2 px-4 py-6 overflow-y-auto dark:bg-gray-900">
      {/* Dropdown Trigger - Selected Card */}
      <div className="relative w-full">
        <Card
          className="p-5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition shadow-md w-full bg-white dark:bg-gray-800"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <div className="flex items-center gap-4">
            {currentSelection.icon}
            <span>
              <Typography
                className={`font-semibold text-sm ${currentSelection.color}`}
              >
                {currentSelection.label}
              </Typography>
              <Typography className="text-xs text-gray-500 dark:text-gray-400">
                {currentSelection.description}
              </Typography>
            </span>
          </div>
        </Card>

        {/* Dropdown List - Shown when clicked */}
        {isDropdownOpen && (
        <div className="absolute w-full mt-2 bg-white dark:bg-gray-800 shadow-lg z-50 rounded-lg">
          {availableOptions
            .filter((option) => {
              if (user?.designation_id === 1) {
                return option.key !== "job_request" && option.key !== "purchasing_request";
              }
              return true; // otherwise show all
            })
            .map((option) => (
              <div
                key={option.key}
                className="p-5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition w-full"
                onClick={() => {
                  setSelectedRequest(option.key);
                  setIsDropdownOpen(false); // Close dropdown after selection
                }}
              >
                <div className="flex items-center gap-4">
                  {option.icon}
                  <span>
                    <Typography
                      className={`font-semibold text-sm ${option.color}`}
                    >
                      {option.label}
                    </Typography>
                    <Typography className="text-xs text-gray-500 dark:text-gray-400">
                      {option.description}
                    </Typography>
                  </span>
                </div>
              </div>
            ))}
        </div>
      )}
      </div>

      <div className="my-4">
        <Typography className="text-gray-500 dark:text-gray-400 font-semibold text-sm">
          Required fields are marked with an asterisk{" "}
          <span className="text-red-500">*</span>
        </Typography>
      </div>

      {/* AI Confidence Banner */}
      {aiConfidences && Object.keys(aiConfidences).length > 0 && (
        <div className="p-3 rounded-md border border-amber-300 bg-amber-50 dark:bg-amber-900/20 text-xs text-amber-700 dark:text-amber-300">
          <span className="font-semibold">Review suggested values:</span>
          <span className="ml-2">{Object.entries(aiConfidences).filter(([_, v]) => Number(v) < 0.6).map(([k]) => formatFieldLabel(k)).join(", ") || "All fields have acceptable confidence."}</span>
        </div>
      )}

      {/* Render Selected Form */}
      {(() => {
        switch (selectedRequest) {
          case "job_request":
            return (
              <JobRequestForm 
                setSelectedRequest={setSelectedRequest}
                prefillData={prefillData}
                renderConfidence={renderConfidence}
              />
            );
          case "purchasing_request":
            return (
              <PurchasingRequestForm 
                setSelectedRequest={setSelectedRequest}
                prefillData={prefillData}
                renderConfidence={renderConfidence}
              />
            );
          case "venue_request":
            return (
              <VenueRequestForm 
                setSelectedRequest={setSelectedRequest}
                prefillData={prefillData}
                renderConfidence={renderConfidence}
              />
            );
          case "vehicle_request":
            return (
              <VehicleRequestForm 
                setSelectedRequest={setSelectedRequest}
                prefillData={prefillData}
                renderConfidence={renderConfidence}
              />
            );
          default:
            return null;
        }
      })()}
    </div>
  );
};

export default RequestForm;
