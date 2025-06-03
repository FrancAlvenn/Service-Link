import { Button } from "@material-tailwind/react";
import React, { useContext, useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import axios from "axios";
import { AuthContext } from "../../../authentication";
import { UserContext } from "../../../../context/UserContext";
import RequestActivityRender from "../../../../utils/request_activity/RequestActivityRender";
import { useRequestActivity } from "../../../../context/RequestActivityContext";

dayjs.extend(relativeTime);

const ActivityTab = ({ referenceNumber, activeTab }) => {
  const [selectedTab, setSelectedTab] = useState(
    localStorage.getItem("selected_activity_tab") || "all"
  );
  const [visibility, setVisibility] = useState("");
  const [content, setContent] = useState("");
  const [editContent, setEditContent] = useState("");
  const [activities, setActivities] = useState([]);
  const [editingActivity, setEditingActivity] = useState(null);

  const { user } = useContext(AuthContext);
  const { getUserByReferenceNumber } = useContext(UserContext);
  const {
    isLoading,
    error,
    addActivity,
    fetchActivities,
    updateActivity,
    deleteActivity,
  } = useRequestActivity();

  useEffect(() => {
    getRequestActivity();
  }, [activeTab, referenceNumber]);

  const getRequestActivity = async () => {
    try {
      const activitiesData = await fetchActivities(referenceNumber);
      setActivities(activitiesData);
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

    try {
      await addActivity({
        reference_number: referenceNumber,
        type: "comment",
        visibility,
        action: visibility === "internal" ? "Internal Note" : "Reply to Client",
        details: content,
      });

      getRequestActivity();
      setContent("");
      setVisibility("");
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
      await updateActivity(id, { details: editContent });

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
      await deleteActivity(id);
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

                return (
                  <RequestActivityRender
                    key={activity.id}
                    activity={activity}
                    isUser={isUser}
                    isViewed={isViewed}
                    editingActivity={editingActivity}
                    editContent={editContent}
                    setEditContent={setEditContent}
                    handleSaveEdit={handleSaveEdit}
                    handleEditClick={handleEditClick}
                    handleDeleteActivity={handleDeleteActivity}
                    getUserByReferenceNumber={getUserByReferenceNumber}
                  />
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
