import React, { useContext, useEffect, useRef, useState } from "react";
import { Button, Typography, Switch } from "@material-tailwind/react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { motion, AnimatePresence } from "framer-motion";
import { AuthContext } from "../../features/authentication";
import RequestDetailsPage from "../component/request_view/RequestDetailsPage";
import email from "../../assets/email_img.png";
import { useRequestActivity } from "../../context/RequestActivityContext";
import NotificationActivityRender from "../../utils/request_activity/NotificationActivityRender";
import { JobRequestsContext } from "../../features/request_management/context/JobRequestsContext";
import { PurchasingRequestsContext } from "../../features/request_management/context/PurchasingRequestsContext";
import { VenueRequestsContext } from "../../features/request_management/context/VenueRequestsContext";
import { VehicleRequestsContext } from "../../features/request_management/context/VehicleRequestsContext";
import { ArrowClockwise } from "@phosphor-icons/react";

dayjs.extend(relativeTime);

const NotificationPage = () => {
  const [selectedTab, setSelectedTab] = useState("all");
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);
  const [activities, setActivities] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  const { user } = useContext(AuthContext);
  const { fetchMultipleActivities, markRequestViewed } = useRequestActivity();

  const { jobRequests } = useContext(JobRequestsContext);
  const { purchasingRequests } = useContext(PurchasingRequestsContext);
  const { venueRequests } = useContext(VenueRequestsContext);
  const { vehicleRequests } = useContext(VehicleRequestsContext);

  // Combine and filter requests by user reference number
  const allRequests = [
    ...Object.values(jobRequests).map((req) => ({
      ...req,
      type: "Job Request",
    })),
    ...Object.values(purchasingRequests).map((req) => ({
      ...req,
      type: "Purchasing Request",
    })),
    ...Object.values(venueRequests).map((req) => ({
      ...req,
      type: "Venue Request",
    })),
    ...Object.values(vehicleRequests).map((req) => ({
      ...req,
      type: "Vehicle Request",
    })),
  ].filter((req) => req.requester === user?.reference_number);

  const hasLoadedActivities = useRef(false);

  useEffect(() => {
    if (!hasLoadedActivities.current) {
      loadActivities();
      hasLoadedActivities.current = true;
    }
  }, [allRequests]);


  const handleTabChange = (tab) => {
    setSelectedTab(tab);
  };

  const openRequestDetails = async (requestID, activityID) => {
    try {
      // Mark activity as viewed
      await markRequestViewed(activityID);

      // Update local state
      setActivities((prev) =>
        prev.map((activity) =>
          activity.id === activityID ? { ...activity, viewed: true } : activity
        )
      );

      // Set selected request
      setSelectedRequest({ reference_number: requestID });
    } catch (error) {
      console.error("Error marking activity as viewed:", error);
    }
  };

  const closeRequestDetails = () => {
    setSelectedRequest(null);
  };

  const loadActivities = async () => {
    try {
      setLoading(true);

      // If there are no requests, return empty activities
      if (allRequests.length === 0) {
        setActivities([]);
        return;
      }

      const userActivities = await fetchMultipleActivities(allRequests);
      setActivities(userActivities || []);
    } catch (error) {
      console.error("Error loading activities:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter activities based on selected tab and unread status
  const filteredActivities = activities.filter(
    (activity) =>
      activity.visibility !== "internal" &&
      (selectedTab === "all" || activity.request_type === selectedTab) &&
      (!showOnlyUnread || !activity.viewed)
  );

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 rounded-lg w-full mt-0 px-3 py-4 flex flex-col gap-6 pb-24">
      <div className="flex justify-between items-center mb-3">
        <Typography variant="h6" color="blue-gray" className="text-lg ">
          Notifications
        </Typography>
        <div className="flex items-center gap-2">
          <div
            className="flex items-center gap-2"
            title="Toggle to show only unread notifications"
          >
            <label
              htmlFor="unread-toggle"
              className="flex items-center gap-2 cursor-pointer text-xs font-semibold"
            >
              Show only unread
              <Switch
                id="unread-toggle"
                checked={showOnlyUnread}
                onChange={() => setShowOnlyUnread((prev) => !prev)}
                className="text-xs font-semibold"
                crossOrigin={undefined}
                color="blue"
              />
            </label>
          </div>
          <div title="Refresh">
            <Button
              variant="text"
              color="blue"
              className="rounded-md text-[10px] py-1 px-1"
              onClick={loadActivities}
              disabled={loading}
            >
              <ArrowClockwise
                size={20}
                className={loading ? "animate-spin" : ""}
              />
            </Button>
          </div>
        </div>
      </div>

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
          {loading ? (
            <div className="text-center py-8">
              <Typography color="gray" className="animate-pulse">
                Loading activities...
              </Typography>
            </div>
          ) : filteredActivities.length > 0 ? (
            filteredActivities
              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
              .map((activity) => (
                <NotificationActivityRender
                  key={activity.id}
                  activity={activity}
                  user={user}
                  onClick={openRequestDetails}
                />
              ))
          ) : (
            <div className="text-gray-500 dark:text-gray-400 w-full text-sm text-center py-5 flex flex-col gap-4 items-center justify-center">
              <img
                src={email}
                alt="No activity"
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
