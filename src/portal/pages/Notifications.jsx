import { Button, Chip, Typography } from "@material-tailwind/react";
import React, { useContext, useEffect, useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

import { JobRequestsContext } from "../../features/request_management/context/JobRequestsContext";
import { PurchasingRequestsContext } from "../../features/request_management/context/PurchasingRequestsContext";
import { VenueRequestsContext } from "../../features/request_management/context/VenueRequestsContext";
import { VehicleRequestsContext } from "../../features/request_management/context/VehicleRequestsContext";
import { AuthContext } from "../../features/authentication";
import RequestDetailsPage from "../component/request_view/RequestDetailsPage";
import { CalendarCheck, Car, ReadCvLogo } from "@phosphor-icons/react";
import { ShoppingCart } from "react-feather";
import { UserContext } from "../../context/UserContext";

import email from "../../assets/email_img.png";

// Icons
dayjs.extend(relativeTime);

const NotificationPage = () => {
  const [selectedTab, setSelectedTab] = useState("all");
  const [activities, setActivities] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const { user } = useContext(AuthContext);
  const { jobRequests } = useContext(JobRequestsContext);
  const { purchasingRequests } = useContext(PurchasingRequestsContext);
  const { venueRequests } = useContext(VenueRequestsContext);
  const { vehicleRequests } = useContext(VehicleRequestsContext);

  const { getUserByReferenceNumber } = useContext(UserContext);

  // Combine and filter requests by user reference number
  const allRequests = [
    ...jobRequests.map((req) => ({ ...req, type: "Job Request" })),
    ...purchasingRequests.map((req) => ({
      ...req,
      type: "Purchasing Request",
    })),
    ...venueRequests.map((req) => ({ ...req, type: "Venue Request" })),
    ...vehicleRequests.map((req) => ({ ...req, type: "Vehicle Request" })),
  ].filter((req) => req.requester === user?.reference_number);

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
        .filter((activity) => !activity.message); // Exclude "message" type activities

      setActivities(combinedActivities);
    } catch (error) {
      console.error("Error fetching activities:", error);
    }
  };

  useEffect(() => {
    if (allRequests.length > 0) {
      getRequestActivity(); // Fetch immediately

      const interval = setInterval(() => {
        getRequestActivity(); // Fetch every 60 seconds
      }, 60000);

      return () => clearInterval(interval); // Cleanup interval on unmount
    }
  }, [allRequests.length]); // Depend only on the length to avoid excessive re-fetching

  const handleTabChange = (tab) => {
    setSelectedTab(tab);
  };

  const openRequestDetails = (requestID, ID) => {
    const request = allRequests.find(
      (req) => req.reference_number === requestID
    );
    if (request) setSelectedRequest(request);

    // Mark the activity as viewed
    axios({
      method: "PUT",
      url: `/request_activity/${ID}`,
      data: { viewed: true },
      withCredentials: true,
    })
      .then(() => {
        // Update activities state
        setActivities((prevActivities) =>
          prevActivities.map((activity) =>
            activity.id === ID ? { ...activity, viewed: true } : activity
          )
        );
      })
      .catch((error) => {
        console.error("Error marking activity as viewed:", error);
      });
  };

  const closeRequestDetails = () => {
    setSelectedRequest(null);
  };

  return (
    <div className="min-h-screen  bg-white dark:bg-gray-900 rounded-lg w-full mt-0 px-3 py-4 flex flex-col gap-6 pb-24">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
        Notifications
      </h2>

      {/* Tab Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        {["all", "comment", "approval", "status_change"].map((tab) => (
          <Button
            key={tab}
            variant={selectedTab === tab ? "filled" : "outlined"}
            color={selectedTab === tab ? "blue" : "gray"}
            size="sm"
            className="md:min-w-fit dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
            onClick={() => handleTabChange(tab)}
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
              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
              .map((activity) => {
                const isUser = activity.created_by === user.reference_number;
                const isViewed = activity.viewed; // Check if activity is viewed
                const bgColor =
                  "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-500";
                const statusColor =
                  "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 border-blue-500";
                const requestColor =
                  "bg-pink-100 dark:bg-pink-900 text-pink-900 dark:text-pink-100 border-pink-500";
                const approvalColor =
                  "bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-100 border-green-500";

                // Different UI for each request type
                if (activity.request_type === "status_change") {
                  return (
                    <div
                      key={activity.id}
                      className={`py-2 px-3 ${
                        isViewed ? bgColor : statusColor
                      } border-l-4 rounded-md shadow-md cursor-pointer`}
                      onClick={() =>
                        openRequestDetails(activity.request_id, activity.id)
                      }
                    >
                      <div className="flex items-center justify-between">
                        <div
                          className="dangerous-p dark:text-gray-100 text-xs font-semibold"
                          dangerouslySetInnerHTML={{ __html: activity.action }}
                        ></div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {dayjs(activity.created_at).fromNow()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <p className="text-sm">{activity.details}</p>
                        <Chip
                          size="sm"
                          className="rounded dark:bg-gray-700 dark:text-gray-100 "
                          variant="outlined"
                          color="black"
                          value={activity.request_id}
                        />
                      </div>
                    </div>
                  );
                }

                // request_access
                if (activity.request_type === "request_access") {
                  return (
                    <div
                      key={activity.id}
                      className={`py-2 px-3 ${
                        isViewed ? bgColor : requestColor
                      } border-l-4 rounded-md shadow-md cursor-pointer`}
                      onClick={() =>
                        openRequestDetails(activity.request_id, activity.id)
                      }
                    >
                      <div className="flex items-center justify-between">
                        <div
                          className="dangerous-p dark:text-gray-100 text-xs font-semibold"
                          dangerouslySetInnerHTML={{ __html: activity.action }}
                        ></div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {dayjs(activity.created_at).fromNow()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <p className="text-sm">{activity.details}</p>
                        <Chip
                          size="sm"
                          className="rounded dark:bg-gray-700 dark:text-gray-100 "
                          variant="outlined"
                          color="black"
                          value={activity.request_id}
                        />
                      </div>
                    </div>
                  );
                }

                if (activity.request_type === "approval") {
                  return (
                    <div
                      key={activity.id}
                      className={`py-2 px-3 ${
                        isViewed ? bgColor : approvalColor
                      } border-l-4 rounded-md shadow-md cursor-pointer`}
                      onClick={() =>
                        openRequestDetails(activity.request_id, activity.id)
                      }
                    >
                      <div className="flex items-center justify-between">
                        <div
                          className="dangerous-p dark:text-gray-100 text-xs font-semibold"
                          dangerouslySetInnerHTML={{ __html: activity.action }}
                        ></div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {dayjs(activity.created_at).fromNow()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <p className="text-sm">{activity.details}</p>
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
                }

                // Default UI for Comments
                return (
                  <div
                    className={`flex flex-col w-full py-2 px-3 ${
                      isViewed
                        ? bgColor
                        : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200 border-gray-500 dark:border-gray-700"
                    } border-l-4 rounded-md shadow-md cursor-pointer`}
                    onClick={() =>
                      openRequestDetails(activity.request_id, activity.id)
                    }
                  >
                    <div className="w-full flex items-center justify-between">
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="text-xs font-semibold dark:text-gray-300"
                      >
                        {activity.action}
                      </Typography>
                      <Typography
                        variant="small"
                        className="text-xs text-gray-500 dark:text-gray-400"
                      >
                        {dayjs(activity.created_at).fromNow()}
                      </Typography>
                    </div>

                    <div className="flex justify-between items-center pt-1">
                      <Typography
                        variant="small"
                        className="mt-1 text-gray-700 dark:text-gray-300 "
                      >
                        <div
                          className="dangerous-p  text-sm font-normal dark:text-gray-100"
                          dangerouslySetInnerHTML={{ __html: activity.details }}
                        />
                      </Typography>
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
                alt="No act"
                className="w-full h-auto max-w-sm sm:max-w-md md:max-w-md lg:max-w-md xl:max-w-md"
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

      {/* Request Details Panel */}
      <AnimatePresence>
        {selectedRequest && (
          <>
            {/* Gray Background Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              className="fixed inset-0 bg-black z-40"
              onClick={closeRequestDetails}
            />

            {/* Sliding Request Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 w-full max-w-[750px] h-full bg-white dark:bg-gray-900 shadow-lg z-50"
            >
              <RequestDetailsPage
                referenceNumber={selectedRequest.reference_number}
                onClose={closeRequestDetails}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationPage;
