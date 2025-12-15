import {
  Menu,
  MenuHandler,
  MenuList,
  Button,
  Typography,
  Switch,
} from "@material-tailwind/react";
import React, { useContext, useEffect, useRef, useState } from "react";
import { ArrowClockwise, Bell } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";
import email from "../../../assets/email_img.png";
import notificationSound from "../../../assets/notification.wav";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import { AuthContext } from "../../../features/authentication";
import { JobRequestsContext } from "../../../features/request_management/context/JobRequestsContext";
import { PurchasingRequestsContext } from "../../../features/request_management/context/PurchasingRequestsContext";
import { VenueRequestsContext } from "../../../features/request_management/context/VenueRequestsContext";
import { VehicleRequestsContext } from "../../../features/request_management/context/VehicleRequestsContext";
import { useRequestActivity } from "../../../context/RequestActivityContext";
import NotificationActivityRender from "../../../utils/request_activity/NotificationActivityRender";

dayjs.extend(relativeTime);

const NotificationModal = () => {
  const [open, setOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("all");
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [audioAllowed, setAudioAllowed] = useState(true);
  const audioRef = useRef(null);
  const prevActivityIdsRef = useRef(new Set());
  const pollTimerRef = useRef(null);

  const { user } = useContext(AuthContext);
  const { fetchMultipleActivities, markRequestViewed } = useRequestActivity();

  const { jobRequests } = useContext(JobRequestsContext);
  const { purchasingRequests } = useContext(PurchasingRequestsContext);
  const { venueRequests } = useContext(VenueRequestsContext);
  const { vehicleRequests } = useContext(VehicleRequestsContext);

  const navigate = useNavigate();
  const hasLoadedActivities = useRef(false);

  // Combine all requests (admin sees all)
  const allRequests = [
    ...Object.values(jobRequests),
    ...Object.values(purchasingRequests),
    ...Object.values(venueRequests),
    ...Object.values(vehicleRequests),
  ];

  useEffect(() => {
    if (allRequests.length > 0 && !hasLoadedActivities.current) {
      loadActivities();
      hasLoadedActivities.current = true;
    }
  }, [allRequests]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const userActivities = await fetchMultipleActivities(allRequests);
      setActivities(userActivities || []);
      const visible = (userActivities || []).filter((a) => a.visibility !== "internal");
      const unread = visible.filter((a) => !a.viewed);
      setUnreadCount(unread.length);
      const incomingIds = new Set(visible.map((a) => a.id));
      const prevIds = prevActivityIdsRef.current;
      const isNew = [...incomingIds].some((id) => !prevIds.has(id));
      prevActivityIdsRef.current = incomingIds;
      if (isNew && audioRef.current && audioAllowed) {
        try {
          audioRef.current.volume = 0.5;
          await audioRef.current.play();
        } catch {}
      }
    } catch (error) {
      console.error("Error loading activities:", error);
    } finally {
      setLoading(false);
    }
  };
 
  useEffect(() => {
    if (hasLoadedActivities.current) {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      pollTimerRef.current = setInterval(loadActivities, 15000);
    }
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [hasLoadedActivities.current]);

  const handleNotificationClick = async (requestID, activityID) => {
    const type = getRequestType(requestID);

    try {
      await markRequestViewed(activityID);
      setActivities((prev) =>
        prev.map((a) => (a.id === activityID ? { ...a, viewed: true } : a))
      );
      const visible = activities.filter((a) => a.visibility !== "internal");
      const unread = visible.filter((a) => !a.viewed && a.id !== activityID);
      setUnreadCount(unread.length);
    } catch (err) {
      console.error("Failed to mark as viewed", err);
    }

    setOpen(false);
    navigate(
      `/workspace/requests-management/queues/${type}?referenceNumber=${requestID}`
    );
  };

  const getRequestType = (referenceNumber) => {
    if (referenceNumber.startsWith("JR")) return "job-requests";
    if (referenceNumber.startsWith("VR")) return "venue-requests";
    if (referenceNumber.startsWith("PR")) return "purchasing-requests";
    if (referenceNumber.startsWith("SV")) return "vehicle-requests";
    return "";
  };

  // Filter activities based on selected tab and visibility
  const filteredActivities = activities.filter(
    (activity) =>
      activity.visibility !== "internal" &&
      (selectedTab === "all" || activity.request_type === selectedTab) &&
      (!showOnlyUnread || !activity.viewed)
  );

  return (
    <Menu
      open={open}
      handler={setOpen}
      placement="bottom-end"
      dismiss={{ itemPress: false }}
    >
      <MenuHandler>
        <div
          title="Click to open notifications"
          aria-label="Notifications"
          onClick={() => setAudioAllowed(true)}
          className="relative"
        >
          <Button
            variant="text"
            className="flex items-center px-3 py-3 gap-x-3"
          >
            <Bell size={24} className="cursor-pointer" />
          </Button>
          <span
            aria-live="polite"
            role="status"
            className={`absolute inline-flex items-center justify-center rounded-full text-[10px] font-bold px-1.5 py-0.5 ${unreadCount > 0 ? "bg-red-600 text-white" : "bg-gray-300 text-gray-700"}`}
            style={{ top: "-2px", right: "-2px", position: "absolute" }}
          >
            {unreadCount}
          </span>
          <audio ref={audioRef} src={notificationSound} preload="auto" aria-hidden="true" />
        </div>
      </MenuHandler>

      <MenuList className="w-[420px] max-h-[500px] overflow-auto p-4 dark:bg-gray-900 dark:text-gray-100 z-[9999]">
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
                <ArrowClockwise size={20} />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-4 flex-wrap">
          {[
            "all",
            "comment",
            "approval",
            "status_change",
            "request_access",
          ].map((tab) => (
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
        <div
          className="flex flex-col max-h-[310px] overflow-auto"
          style={{ scrollbarGutter: "stable" }}
        >
          <div className="flex flex-col gap-3">
            {loading ? (
              <div className="text-center py-4">
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
                    onClick={handleNotificationClick}
                  />
                ))
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
  );
};

export default NotificationModal;
