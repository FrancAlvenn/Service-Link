// components/NotificationActivityRender.jsx
import React from "react";
import { Chip } from "@material-tailwind/react";
import dayjs from "dayjs";

const NotificationActivityRender = ({ activity, onClick, user }) => {
  const isUser = activity.created_by === user.reference_number;
  const isViewed = activity.viewed;

  const getActivityStyle = () => {
    const base = "py-2 px-3 border-l-4 rounded-md shadow-md cursor-pointer";

    if (isViewed) {
      return `${base} bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-500`;
    }

    switch (activity.request_type) {
      case "status_change":
        return `${base} bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 border-blue-500`;
      case "request_access":
        return `${base} bg-pink-100 dark:bg-pink-900 text-pink-900 dark:text-pink-100 border-pink-500`;
      case "approval":
        return `${base} bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-100 border-green-500`;
      case "assign_approver":
        return `${base} bg-teal-100 dark:bg-teal-900 text-teal-900 dark:text-teal-100 border-teal-500`;
      default:
        return `${base} bg-fuchsia-100 dark:bg-fuchsia-900 text-fuchsia-900 dark:text-fuchsia-100 border-fuchsia-500`;
    }
  };

  return (
    <div
      className={getActivityStyle()}
      onClick={() => onClick(activity.request_id, activity.id)}
    >
      <div className="flex items-center justify-between">
        <div
          className="dangerous-p dark:text-gray-100 text-xs font-semibold whitespace-normal text-wrap"
          dangerouslySetInnerHTML={{ __html: activity.action }}
        />
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {dayjs(activity.created_at).fromNow()}
        </span>
      </div>

      <div className="flex items-center justify-between pt-1">
        <div
          className="text-sm whitespace-normal text-wrap overflow-hidden"
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={activity.details}
          dangerouslySetInnerHTML={{ __html: activity.details }}
        />
        <Chip
          size="sm"
          className="rounded dark:bg-gray-700 dark:text-gray-100 ml-1"
          variant="outlined"
          color="black"
          value={activity.request_id}
        />
      </div>
    </div>
  );
};

export default NotificationActivityRender;
