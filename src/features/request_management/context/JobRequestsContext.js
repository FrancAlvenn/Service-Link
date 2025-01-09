import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const JobRequestsContext = createContext();

export const JobRequestsProvider = ({ children }) => {
  const [jobRequests, setJobRequests] = useState([]);

  // Fetch job requests from the database
  useEffect(() => {
    const fetchJobRequests = async () => {
      try {
        const { data } = await axios({
          method: "get",
          url: "http://localhost:8080/service_link_api/job_request/",
          withCredentials: true,
        });
        setJobRequests(data);
      } catch (error) {
        console.error("Error fetching job requests:", error);
      }
    };

    fetchJobRequests();
  }, []);

  // Update a job request
  const updateJobRequest = async (updatedRequest) => {
    try {
      setJobRequests((prev) =>
        prev.map((req) =>
          req.id === updatedRequest.id ? updatedRequest : req
        )
      );
      await axios.put(`/api/requests/job/${updatedRequest.id}`, updatedRequest);
    } catch (error) {
      console.error("Error updating job request:", error);
    }
  };

  // Delete a job request
  const deleteJobRequest = async (requestId) => {
    try {
      setJobRequests((prev) => prev.filter((req) => req.id !== requestId));
      await axios.delete(`/api/requests/job/${requestId}`);
    } catch (error) {
      console.error("Error deleting job request:", error);
    }
  };

  // Add a new job request
  const addJobRequest = async (newRequest) => {
    try {
      const { data: createdRequest } = await axios.post(
        "/api/requests/job",
        newRequest
      );
      setJobRequests((prev) => [...prev, createdRequest]);
    } catch (error) {
      console.error("Error adding job request:", error);
    }
  };

  return (
    <JobRequestsContext.Provider
      value={{
        jobRequests,
        updateJobRequest,
        deleteJobRequest,
        addJobRequest,
      }}
    >
      {children}
    </JobRequestsContext.Provider>
  );
};
