import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const JobRequestsContext = createContext();

/**
 * The JobRequestsProvider component is a context provider that provides
 * the following values to its children components:
 *
 *   - jobRequests: an array of job requests
 *   - fetchJobRequests: a function that fetches job requests from the server
 *
 * The component fetches job requests from the server when mounted and
 * makes them available to its children components.
 *
 * @param {{ children: React.ReactNode }} props
 * @returns {React.ReactElement}
 */
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
