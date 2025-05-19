import {
  Menu,
  MenuHandler,
  MenuList,
  Button,
  Typography,
} from "@material-tailwind/react";
import React, { useContext, useEffect, useState } from "react";
import axios from "axios";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Chip } from "@material-tailwind/react";
import { AuthContext } from "../../../features/authentication";
import { JobRequestsContext } from "../../../features/request_management/context/JobRequestsContext";
import { PurchasingRequestsContext } from "../../../features/request_management/context/PurchasingRequestsContext";
import { VenueRequestsContext } from "../../../features/request_management/context/VenueRequestsContext";
import { VehicleRequestsContext } from "../../../features/request_management/context/VehicleRequestsContext";
import { Bell } from "@phosphor-icons/react";

import email from "../../../assets/email_img.png";
import SidebarView from "../../../components/sidebar/SidebarView";
import { useNavigate } from "react-router-dom";

dayjs.extend(relativeTime);

const NotificationModal = () => {
  const [open, setOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("all");
  const [activities, setActivities] = useState([]);

  const { user } = useContext(AuthContext);
  const { jobRequests } = useContext(JobRequestsContext);
  const { purchasingRequests } = useContext(PurchasingRequestsContext);
  const { venueRequests } = useContext(VenueRequestsContext);
  const { vehicleRequests } = useContext(VehicleRequestsContext);

  const navigate = useNavigate();

  const handleNotificationClick = (requestType, referenceNumber) => {
    // Close the menu
    setOpen(false);

    // Navigate to target with referenceNumber in query
    navigate(
      `/workspace/requests-management/queues/${requestType}?referenceNumber=${referenceNumber}`
    );
  };

  const allRequests = [
    ...jobRequests.map((req) => ({ ...req, type: "Job Request" })),
    ...purchasingRequests.map((req) => ({
      ...req,
      type: "Purchasing Request",
    })),
    ...venueRequests.map((req) => ({ ...req, type: "Venue Request" })),
    ...vehicleRequests.map((req) => ({ ...req, type: "Vehicle Request" })),
  ];

  const getRequestActivity = async () => {
    try {
      const responses = await Promise.all(
        allRequests.map((req) =>
          axios.get(`/request_activity/${req.reference_number}`, {
            withCredentials: true,
          })
        )
      );

      const combinedActivities = responses
        .flatMap((res) => res.data || [])
        .filter((activity) => !activity.message);

      setActivities(combinedActivities);
    } catch (error) {
      console.error("Error fetching activities:", error);
    }
  };

  //Get Request Type based on reference_number if the reference number has JR, VR, PR, or VR
  const getRequestType = (referenceNumber) => {
    if (referenceNumber.startsWith("JR")) {
      return "job-requests";
    } else if (referenceNumber.startsWith("VR")) {
      return "venue-requests";
    } else if (referenceNumber.startsWith("PR")) {
      return "purchasing-requests";
    } else if (referenceNumber.startsWith("SV")) {
      return "vehicle-requests";
    }
    return "";
  };

  useEffect(() => {
    if (allRequests.length > 0) {
      getRequestActivity();
    }
  }, [allRequests.length]);

  const filteredActivities = activities.filter(
    (activity) =>
      activity.visibility !== "internal" &&
      (selectedTab === "all" || activity.request_type === selectedTab)
  );

  return (
    <>
      <Menu
        open={open}
        handler={setOpen}
        placement="bottom-end"
        dismiss={{ itemPress: false }}
      >
        <MenuHandler>
          <Button
            variant="text"
            className="flex items-center px-3 py-3 gap-x-3"
          >
            <Bell size={24} className="cursor-pointer " />
          </Button>
        </MenuHandler>

        <MenuList className="w-[420px] max-h-[500px] overflow-auto p-4 dark:bg-gray-900 dark:text-gray-100 z-[9999]">
          <Typography variant="h6" color="blue-gray" className="mb-3 text-md">
            Activities
          </Typography>

          <div className="flex gap-2 mb-4 flex-wrap">
            {["all", "comment", "approval", "status_change"].map((tab) => (
              <Button
                key={tab}
                size="sm"
                variant={selectedTab === tab ? "filled" : "outlined"}
                color={selectedTab === tab ? "blue" : "gray"}
                onClick={() => setSelectedTab(tab)}
                className="rounded-md text-[10px] py-1 px-4"
              >
                {tab.replace("_", " ")}
              </Button>
            ))}
          </div>

          {/* Activity Feed */}
          <div className="flex flex-col max-h-[500px] overflow-auto">
            <div className="flex flex-col gap-3">
              {activities?.length > 0 ? (
                activities
                  .filter(
                    (activity) =>
                      (activity.visibility !== "internal" ||
                        activity.created_by === user.reference_number) &&
                      (selectedTab === "all" ||
                        activity.request_type === selectedTab)
                  )
                  .map((activity) => {
                    const isUser =
                      activity.created_by === user.reference_number;
                    const isViewed = activity.viewed;

                    // Determine card color
                    const colorMap = {
                      status_change:
                        "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 border-blue-500",
                      request_access:
                        "bg-pink-100 dark:bg-pink-900 text-pink-900 dark:text-pink-100 border-pink-500",
                      approval:
                        "bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-100 border-green-500",
                    };

                    const defaultColor =
                      "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200 border-gray-500 dark:border-gray-700";
                    const viewedColor =
                      "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-500";
                    const cardColor = isViewed
                      ? viewedColor
                      : colorMap[activity.request_type] || defaultColor;

                    return (
                      <div
                        key={activity.id}
                        className={`py-2 px-3 ${cardColor} border-l-4 rounded-md shadow-md cursor-pointer`}
                        onClick={() =>
                          handleNotificationClick(
                            getRequestType(activity.request_id),
                            activity.request_id
                          )
                        }
                      >
                        <div className="flex items-center justify-between">
                          <div
                            className="dangerous-p text-xs font-semibold dark:text-gray-100"
                            dangerouslySetInnerHTML={{
                              __html: activity.action,
                            }}
                          />
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {dayjs(activity.created_at).fromNow()}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <div
                            className="text-sm dark:text-gray-100"
                            dangerouslySetInnerHTML={{
                              __html: activity.details,
                            }}
                          />
                          <Chip
                            size="sm"
                            className="rounded dark:bg-gray-700 dark:text-gray-100"
                            variant="outlined"
                            color="black"
                            value={activity.request_id}
                          />
                        </div>
                      </div>
                    );
                  })
              ) : (
                <div className="text-gray-500 dark:text-gray-400 w-full text-sm text-center py-5 flex flex-col gap-4 items-center justify-center">
                  <img
                    src={email}
                    alt="No activity"
                    className="w-full h-auto max-w-sm sm:max-w-md"
                  />
                  <Typography
                    variant="h6"
                    className="text-gray-500 dark:text-gray-300"
                  >
                    Looks like it's a bit quiet around here!
                  </Typography>
                </div>
              )}
            </div>
          </div>
        </MenuList>
      </Menu>
    </>
  );
};

export default NotificationModal;
