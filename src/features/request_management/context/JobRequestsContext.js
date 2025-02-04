import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const JobRequestsContext = createContext();

export const JobRequestsProvider = ({ children }) => {
  const [jobRequests, setJobRequests] = useState([]);

  // Fetch job requests from the database
  useEffect(() => {
    fetchJobRequests();
  }, []);

  const fetchJobRequests = async () => {
    try {
      const { data } = await axios({
        method: "get",
        url: "/job_request/",
        withCredentials: true,
      });
      setJobRequests(data);
    } catch (error) {
      console.error("Error fetching job requests:", error);
    }
  };


  return (
    <JobRequestsContext.Provider
      value={{
        jobRequests,
        fetchJobRequests,
      }}
    >
      {children}
    </JobRequestsContext.Provider>
  );
};
