import { Button } from "@material-tailwind/react";
import React, { useContext, useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import axios from "axios";
import { AuthContext } from "../../../authentication";
import { UserContext } from "../../../../context/UserContext";

dayjs.extend(relativeTime);

function getActivityStyle(type, isViewed) {
  const base = "py-2 px-3 border-l-4 rounded-md shadow-md";

  const styles = {
    status_change: isViewed
      ? "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-500"
      : "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-200 border-blue-500",

    request_access: isViewed
      ? "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-500"
      : "bg-pink-100 dark:bg-pink-900 text-pink-900 dark:text-pink-100 border-pink-500",

    approval: isViewed
      ? "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-500"
      : "bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-200 border-green-500",
  };

  return `${base} ${styles[type] || ""}`;
}

const ActivityTab = ({ referenceNumber, activeTab }) => {
  const [selectedTab, setSelectedTab] = useState(
    localStorage.getItem("selected_activity_tab") || "all"
  );
  const [activityType, setActivityType] = useState();
  const [editingActivity, setEditingActivity] = useState(null);
  const [visibility, setVisibility] = useState("");
  const [content, setContent] = useState("");
  const [editContent, setEditContent] = useState("");

  const { user } = useContext(AuthContext);
  const { getUserByReferenceNumber } = useContext(UserContext);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    getRequestActivity();
  }, [activeTab, referenceNumber]);

  const getRequestActivity = async () => {
    try {
      const res = await axios.get(`/request_activity/${referenceNumber}`, {
        withCredentials: true,
      });
      setActivities(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error fetching activities:", error);
    }
  };

  const handleContentChange = (value) => setContent(value);

  const handleTabChange = (tab) => {
    setSelectedTab(tab);
    localStorage.setItem("selected_activity_tab", tab);
  };

  const handleSaveActivity = async () => {
    if (!content || content.trim() === "" || content === "<p><br></p>") return;

    const newActivity = {
      reference_number: referenceNumber,
      type: "comment",
      visibility,
      action: visibility === "internal" ? "Internal Note" : "Reply to Client",
      details: content,
      performed_by: user.reference_number,
    };

    try {
      await axios.post("/request_activity", newActivity, {
        withCredentials: true,
      });
      getRequestActivity();
      setContent("");
      setActivityType(null);
    } catch (error) {
      console.error("Error saving activity:", error);
    }
  };

  const handleEditClick = (activity) => {
    setEditingActivity(activity.id);
    setEditContent(activity.details);
  };

  const handleSaveEdit = async (id) => {
    try {
      await axios.put(
        `/request_activity/${id}`,
        { details: editContent, performed_by: user.reference_number },
        { withCredentials: true }
      );

      setActivities((prev) =>
        prev.map((a) => (a.id === id ? { ...a, details: editContent } : a))
      );
      setEditingActivity(null);
    } catch (error) {
      console.error("Error updating activity:", error);
    }
  };

  const handleDeleteActivity = async (id) => {
    try {
      await axios.delete(`/request_activity/${id}`, { withCredentials: true });
      setActivities((prev) => prev.filter((a) => a.id !== id));
    } catch (error) {
      console.error("Error deleting activity:", error);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-3 mb-3 border-gray-400 border rounded-md">
      <span className="flex gap-1">
        <p className="text-sm font-semibold text-gray-600">Activity</p>
      </span>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <p className="text-sm font-normal text-gray-500">Show</p>
        {["all", "comment", "status_change", "approval"].map((tab) => (
          <Button
            key={tab}
            variant="outlined"
            color={selectedTab === tab ? "blue" : "gray"}
            size="sm"
            className="text-xs py-1 px-2"
            onClick={() => handleTabChange(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1).replace("_", " ")}
          </Button>
        ))}
      </div>

      {/* Visibility Toggle */}
      <div className="flex items-center gap-2 px-4 py-2 border-gray-400 border rounded-md">
        <p className="text-sm font-semibold cursor-pointer">
          <span
            className={`mr-1 ${
              visibility === "internal" ? "text-blue-500" : "text-gray-500"
            }`}
            onClick={() => setVisibility("internal")}
          >
            Add internal note
          </span>
          /
          <span
            className={`ml-1 ${
              visibility === "client" ? "text-blue-500" : "text-gray-500"
            }`}
            onClick={() => setVisibility("client")}
          >
            Reply to client
          </span>
        </p>
      </div>

      {/* Editor */}
      {visibility && (
        <div className="flex flex-col gap-10">
          <ReactQuill
            theme="snow"
            value={content}
            onChange={handleContentChange}
          />
          <div className="flex gap-2 mt-2">
            <Button
              variant="outlined"
              color="blue"
              className="text-xs py-1 px-2"
              onClick={handleSaveActivity}
              disabled={
                !content || content.trim() === "" || content === "<p><br></p>"
              }
            >
              Save
            </Button>
            <Button
              variant="outlined"
              color="gray"
              className="text-xs py-1 px-2"
              onClick={() => setVisibility("")}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Activity List */}
      <div className="mt-4 flex flex-col gap-2 pt-2">
        <div className="flex flex-col gap-3 p-2">
          {activities.length > 0 ? (
            activities
              .filter(
                (a) =>
                  (a.visibility !== "internal" ||
                    a.created_by === user.reference_number) &&
                  (selectedTab === "all" || a.request_type === selectedTab)
              )
              .map((activity) => {
                const isUser = activity.created_by === user.reference_number;
                const isViewed = activity.viewed;

                if (
                  ["status_change", "approval", "request_access"].includes(
                    activity.request_type
                  )
                ) {
                  return (
                    <div
                      key={activity.id}
                      className={getActivityStyle(
                        activity.request_type,
                        isViewed
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div
                          className="dangerous-p dark:text-gray-100 text-xs font-semibold"
                          dangerouslySetInnerHTML={{
                            __html: activity.action,
                          }}
                        ></div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {dayjs(activity.created_at).fromNow()}
                        </span>
                      </div>
                      <p className="text-sm">{activity.details}</p>
                    </div>
                  );
                }

                // Comments (default)
                return (
                  <div
                    key={activity.id}
                    className={`flex ${
                      isUser ? "justify-end" : "justify-start"
                    }`}
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
                                onClick={() => setEditingActivity(null)}
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
                              dangerouslySetInnerHTML={{
                                __html: activity.details,
                              }}
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
              })
          ) : (
            <div className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
              No activities found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityTab;
