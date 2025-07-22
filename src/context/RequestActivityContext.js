import React, { createContext, useContext, useState } from "react";
import axios from "axios";
import { AuthContext } from "../features/authentication";

const RequestActivityContext = createContext();

export const RequestActivityProvider = ({ children }) => {
  const { user } = useContext(AuthContext); // Get current user from auth context
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Add new activity
  const addActivity = async (activityData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/request_activity`,
        {
          ...activityData,
          performed_by: user.reference_number,
        },
        { withCredentials: true }
      );

      setIsLoading(false);
      return response.data;
    } catch (err) {
      console.error("Error adding activity:", err);
      setError(err.response?.data?.message || "Failed to add activity");
      setIsLoading(false);
      throw err;
    }
  };

  // Fetch activities by reference number
  const fetchActivities = async (referenceNumber) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/request_activity/${referenceNumber}`, {
        withCredentials: true,
      });

      setIsLoading(false);
      return Array.isArray(response.data) ? response.data : [];
    } catch (err) {
      console.error("Error fetching activities:", err);
      setError(err.response?.data?.message || "Failed to fetch activities");
      setIsLoading(false);
      throw err;
    }
  };

  // Fetch multiple activities
  const fetchMultipleActivities = async (allRequests) => {
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

      return combinedActivities;
    } catch (err) {
      console.error("Error fetching multiple activities:", err);
      setError(err.response?.data?.message || "Failed to fetch activities");
      setIsLoading(false);
      throw err;
    }
  };

  // Update existing activity
  const updateActivity = async (id, updateData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/request_activity/${id}`,
        {
          ...updateData,
          performed_by: user.reference_number,
        },
        { withCredentials: true }
      );

      setIsLoading(false);
      return response.data;
    } catch (err) {
      console.error("Error updating activity:", err);
      setError(err.response?.data?.message || "Failed to update activity");
      setIsLoading(false);
      throw err;
    }
  };

  // Mark Request as viewed
  const markRequestViewed = async (id) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/request_activity/${id}`,
        {
          viewed: true,
        },
        { withCredentials: true }
      );

      setIsLoading(false);
      return response.data;
    } catch (err) {
      console.error("Error marking request as viewed:", err);
      setError(
        err.response?.data?.message || "Failed to mark request as viewed"
      );
      setIsLoading(false);
      throw err;
    }
  };

  // Delete activity
  const deleteActivity = async (id) => {
    setIsLoading(true);
    setError(null);

    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/request_activity/${id}`, {
        withCredentials: true,
      });

      setIsLoading(false);
      return true;
    } catch (err) {
      console.error("Error deleting activity:", err);
      setError(err.response?.data?.message || "Failed to delete activity");
      setIsLoading(false);
      throw err;
    }
  };

  // Helper to log status changes
  const logStatusChange = async (referenceNumber, status, details = "") => {
    return addActivity({
      reference_number: referenceNumber,
      visibility: "external",
      type: "status_change",
      action: `Status updated to <i>${status}</i>`,
      details,
    });
  };

  // Helper to log internal notes
  const logInternalNote = async (referenceNumber, content) => {
    return addActivity({
      reference_number: referenceNumber,
      visibility: "internal",
      type: "comment",
      action: "Internal Note",
      details: content,
    });
  };

  // Helper to log client replies
  const logClientReply = async (referenceNumber, content) => {
    return addActivity({
      reference_number: referenceNumber,
      visibility: "client",
      type: "comment",
      action: "Reply to Client",
      details: content,
    });
  };

  // Helper to log assignment
  const logAssignment = async (referenceNumber, assignee) => {
    return addActivity({
      reference_number: referenceNumber,
      visibility: "external",
      type: "assignment",
      action: `Assigned to ${assignee}`,
      details: "Request assignment",
    });
  };

  //Helper to log assign approver
  const logAssignApprover = async (referenceNumber, approver) => {
    return addActivity({
      reference_number: referenceNumber,
      visibility: "external",
      type: "assignment",
      action: `Assigned to ${approver}`,
      details: "Request approver assignment",
    });
  };

  const value = {
    isLoading,
    error,
    addActivity,
    fetchActivities,
    fetchMultipleActivities,
    updateActivity,
    deleteActivity,
    markRequestViewed,
    logStatusChange,
    logInternalNote,
    logClientReply,
    logAssignment,
    logAssignApprover,
  };

  return (
    <RequestActivityContext.Provider value={value}>
      {children}
    </RequestActivityContext.Provider>
  );
};

export const useRequestActivity = () => {
  const context = useContext(RequestActivityContext);
  if (!context) {
    throw new Error(
      "useRequestActivity must be used within a RequestActivityProvider"
    );
  }
  return context;
};
