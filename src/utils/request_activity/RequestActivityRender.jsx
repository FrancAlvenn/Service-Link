// components/ActivityItem.jsx

import React from "react";
import { getActivityStyle } from "./getActivityStyle";
import dayjs from "dayjs";
import ReactQuill from "react-quill";
import { Button } from "@material-tailwind/react";

const RequestActivityRender = ({
  activity,
  isUser,
  isViewed,
  editingActivity,
  editContent,
  setEditContent,
  handleSaveEdit,
  handleEditClick,
  handleDeleteActivity,
  getUserByReferenceNumber,
}) => {
  if (
    ["status_change", "approval", "request_access"].includes(
      activity.request_type
    )
  ) {
    return (
      <div
        key={activity.id}
        className={getActivityStyle(activity.request_type, isViewed)}
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
        <p className="text-sm">{activity.details}</p>
      </div>
    );
  }

  return (
    <div
      key={activity.id}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div className="flex flex-col gap-2 max-w-[100%]">
        <div
          className={`relative p-2 rounded-lg text-sm shadow-md ${
            isViewed
              ? "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-500"
              : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
          }`}
        >
          {editingActivity === activity.id ? (
            <>
              <ReactQuill
                theme="snow"
                value={editContent}
                onChange={setEditContent}
                className="w-full dark:text-gray-200"
              />
              <div className="flex gap-2 mt-2">
                <Button
                  variant="outlined"
                  color="blue"
                  className="text-xs py-1 px-2"
                  onClick={() => handleSaveEdit(activity.id)}
                  disabled={
                    !editContent ||
                    editContent.trim() === "" ||
                    editContent === "<p><br></p>"
                  }
                >
                  Save
                </Button>
                <Button
                  variant="outlined"
                  color="gray"
                  className="text-xs py-1 px-2"
                  onClick={() => setEditContent("")}
                >
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between items-center gap-4">
                <p className="dark:text-gray-100 text-xs font-semibold">
                  {getUserByReferenceNumber(activity.created_by)}
                </p>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {dayjs(activity.created_at).fromNow()}
                </span>
              </div>
              <div
                className="dangerous-p dark:text-gray-100 text-sm break-words whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: activity.details }}
              />
            </>
          )}
        </div>

        {isUser && editingActivity !== activity.id && (
          <div className="right-2 flex gap-1 ml-auto">
            <button
              className="text-xs text-white bg-gray-600 dark:bg-gray-500 px-2 py-1 rounded"
              onClick={() => handleEditClick(activity)}
            >
              Edit
            </button>
            <button
              className="text-xs text-white bg-red-500 px-2 py-1 rounded"
              onClick={() => handleDeleteActivity(activity.id)}
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestActivityRender;
