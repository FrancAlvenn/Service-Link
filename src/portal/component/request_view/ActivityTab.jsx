import { Button } from "@material-tailwind/react";
import React, { useContext, useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { UserContext } from "../../../context/UserContext";
import { AuthContext } from "../../../features/authentication";
import RequestActivityRender from "../../../utils/request_activity/RequestActivityRender";
import { useRequestActivity } from "../../../context/RequestActivityContext";

dayjs.extend(relativeTime);

const ActivityTab = ({ referenceNumber }) => {
  const [selectedTab, setSelectedTab] = useState(
    localStorage.getItem("selected_activity_tab") || "all"
  );
  const [editingActivity, setEditingActivity] = useState(null);
  const [visibility, setVisibility] = useState("");
  const [content, setContent] = useState("");
  const [editContent, setEditContent] = useState("");
  const [activities, setActivities] = useState([]);

  const { user } = useContext(AuthContext);
  const { getUserByReferenceNumber } = useContext(UserContext);

  // Use the request activity context
  const { fetchActivities, addActivity, updateActivity, deleteActivity } =
    useRequestActivity();

  useEffect(() => {
    getRequestActivity();
  }, [referenceNumber]);

  const getRequestActivity = async () => {
    try {
      const activitiesData = await fetchActivities(referenceNumber);
      setActivities(Array.isArray(activitiesData) ? activitiesData : []);
    } catch (error) {
      console.error("Error fetching activities:", error);
    }
  };

  const handleContentChange = (value) => {
    setContent(value);
  };

  function handleTabChange(tab) {
    setSelectedTab(tab);
    localStorage.setItem("selected_activity_tab", tab);
  }

  const handleSaveActivity = async () => {
    if (!content || content.trim() === "") return;

    try {
      await addActivity({
        reference_number: referenceNumber,
        type: "comment",
        visibility: "external", // Changed to match your UI
        action: "Reply to Support",
        details: content,
      });

      getRequestActivity();
      setContent("");
      setVisibility("");
    } catch (error) {
      console.error("Error saving activity:", error);
    }
  };

  function handleEditClick(activity) {
    setEditingActivity(activity.id);
    setEditContent(activity.details);
  }

  const handleSaveEdit = async (id) => {
    try {
      await updateActivity(id, { details: editContent });

      // Update local state
      setActivities((prev) =>
        prev.map((activity) =>
          activity.id === id ? { ...activity, details: editContent } : activity
        )
      );
      setEditingActivity(null);
    } catch (error) {
      console.error("Error updating activity:", error);
    }
  };

  const handleDeleteActivity = async (id) => {
    try {
      await deleteActivity(id);
      setActivities((prev) => prev.filter((activity) => activity.id !== id));
    } catch (error) {
      console.error("Error deleting activity:", error);
    }
  };

  return (
    <div className="flex flex-col gap-2 p-3 border-gray-400 dark:border-gray-600 border rounded-md bg-white dark:bg-gray-800">
      <span className="flex gap-1">
        <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">
          Activity
        </p>
      </span>

      {/* Tab Selection */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <p className="text-sm font-normal text-gray-500 dark:text-gray-400">
          Show
        </p>
        <Button
          variant="outlined"
          color={selectedTab === "all" ? "blue" : "gray"}
          size="sm"
          className="text-xs py-1 px-2 dark:border-gray-500 dark:text-gray-300"
          onClick={() => handleTabChange("all")}
        >
          All
        </Button>
        <Button
          variant="outlined"
          color={selectedTab === "comment" ? "blue" : "gray"}
          size="sm"
          className="text-xs py-1 px-2 dark:border-gray-500 dark:text-gray-300"
          onClick={() => handleTabChange("comment")}
        >
          Comment
        </Button>
        <Button
          variant="outlined"
          color={selectedTab === "approval" ? "blue" : "gray"}
          size="sm"
          className="text-xs py-1 px-2 dark:border-gray-500 dark:text-gray-300"
          onClick={() => handleTabChange("approval")}
        >
          Approval
        </Button>
        <Button
          variant="outlined"
          color={selectedTab === "status_change" ? "blue" : "gray"}
          size="sm"
          className="text-xs py-1 px-2 dark:border-gray-500 dark:text-gray-300"
          onClick={() => handleTabChange("status_change")}
        >
          Status Change
        </Button>
      </div>

      {/* Visibility Selection */}
      <div className="flex items-center gap-2 px-4 py-2 border-gray-400 dark:border-gray-600 border rounded-md">
        <p
          className={`text-sm font-semibold cursor-pointer ${
            visibility === "external"
              ? "text-blue-500"
              : "text-gray-500 dark:text-gray-400"
          }`}
          onClick={() => setVisibility("external")}
        >
          Reply to Support
        </p>
      </div>

      {/* Add Request Activity - Comment when there is visibility */}
      {visibility && (
        <div className="flex flex-col gap-2">
          <ReactQuill
            theme="snow"
            value={content}
            onChange={handleContentChange}
            className="dark:text-gray-200"
          />
          <div className="flex gap-2 mt-2">
            <Button
              variant="outlined"
              color="blue"
              className="text-xs py-1 px-2 dark:border-gray-500 dark:text-gray-300"
              disabled={
                !content || content.trim() === "" || content === "<p><br></p>"
              }
              onClick={handleSaveActivity}
            >
              Save
            </Button>
            <Button
              variant="outlined"
              color="gray"
              className="text-xs py-1 px-2 dark:border-gray-500 dark:text-gray-300"
              onClick={() => setVisibility("")}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Activity Feed */}
      <div className="mt-4 flex flex-col gap-2 pt-2">
        <div className="flex flex-col gap-3 p-2">
          {activities?.length > 0 ? (
            activities
              .filter(
                (activity) =>
                  (activity.visibility !== "internal" ||
                    activity.created_by === user.reference_number) &&
                  (selectedTab === "all" ||
                    activity.request_type === selectedTab)
              )
              .map((activity) => (
                <RequestActivityRender
                  key={activity.id}
                  activity={activity}
                  isUser={activity.created_by === user.reference_number}
                  isViewed={activity.viewed}
                  editingActivity={editingActivity}
                  setEditingActivity={setEditingActivity}
                  editContent={editContent}
                  setEditContent={setEditContent}
                  handleSaveEdit={handleSaveEdit}
                  handleEditClick={handleEditClick}
                  handleDeleteActivity={handleDeleteActivity}
                  getUserByReferenceNumber={getUserByReferenceNumber}
                />
              ))
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
