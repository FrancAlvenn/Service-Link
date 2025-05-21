import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [departments, setDepartments] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [userPreferences, setUserPreferences] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [approvers, setApprovers] = useState([]);
  const [positions, setPositions] = useState([]);

  useEffect(() => {
    fetchDepartments();
    fetchPriorities();
    fetchStatuses();
    fetchDesignations();
    fetchUserPreferences();
    fetchOrganizations();
    fetchApprovers();
    fetchPositions();
  }, []);

  // === Department ===
  const fetchDepartments = async () => {
    try {
      const response = await axios.get("/settings/department", {
        withCredentials: true,
      });

      if (Array.isArray(response.data.departments)) {
        setDepartments(response.data.departments);
      } else {
        console.error("Invalid response: 'departments' is not an array");
      }
    } catch (err) {
      console.error("Error fetching departments:", err);
    }
  };

  const createDepartment = async (payload) => {
    await axios.post(`/settings/department`, payload, {
      withCredentials: true,
    });
    fetchDepartments();
  };

  const updateDepartment = async (id, payload) => {
    await axios.put(`/settings/department/${id}`, payload, {
      withCredentials: true,
    });
    fetchDepartments();
  };

  const deleteDepartment = async (id) => {
    await axios.delete(`/settings/department/${id}`, {
      withCredentials: true,
    });
    fetchDepartments();
  };

  // === Priority ===
  const fetchPriorities = async () => {
    try {
      const response = await axios.get("/settings/priority", {
        withCredentials: true,
      });

      if (Array.isArray(response.data.priority)) {
        setPriorities(response.data.priority);
      } else {
        console.error("Invalid response: 'priorities' is not an array");
      }
    } catch (err) {
      console.error("Error fetching priorities:", err);
    }
  };

  const createPriority = async (payload) => {
    await axios.post(`/settings/priority`, payload, { withCredentials: true });
    fetchPriorities();
  };

  const updatePriority = async (id, payload) => {
    await axios.put(`/settings/priority/${id}`, payload, {
      withCredentials: true,
    });
    fetchPriorities();
  };

  const deletePriority = async (id) => {
    await axios.delete(`/settings/priority/${id}`, {
      withCredentials: true,
    });
    fetchPriorities();
  };

  // === Status ===
  const fetchStatuses = async () => {
    try {
      const response = await axios.get("/settings/status", {
        withCredentials: true,
      });

      if (Array.isArray(response.data.status)) {
        setStatuses(response.data.status);
      } else {
        console.error("Invalid response: 'statuses' is not an array");
      }
    } catch (err) {
      console.error("Error fetching statuses:", err);
    }
  };

  const createStatus = async (payload) => {
    await axios.post(`/settings/status`, payload, { withCredentials: true });
    fetchStatuses();
  };

  const updateStatus = async (id, payload) => {
    await axios.put(`/settings/status/${id}`, payload, {
      withCredentials: true,
    });
    fetchStatuses();
  };

  const deleteStatus = async (id) => {
    await axios.delete(`/settings/status/${id}`, {
      withCredentials: true,
    });
    fetchStatuses();
  };

  // === Designation ===
  const fetchDesignations = async () => {
    try {
      const { data } = await axios.get(`/settings/designation`, {
        withCredentials: true,
      });
      setDesignations(data);
    } catch (err) {
      console.error("Error fetching designations:", err);
    }
  };

  const createDesignation = async (payload) => {
    await axios.post(`/settings/designation`, payload, {
      withCredentials: true,
    });
    fetchDesignations();
  };

  const updateDesignation = async (id, payload) => {
    await axios.put(`/settings/designation/${id}`, payload, {
      withCredentials: true,
    });
    fetchDesignations();
  };

  const deleteDesignation = async (id) => {
    await axios.delete(`/settings/designation/${id}`, {
      withCredentials: true,
    });
    fetchDesignations();
  };

  // === User Preferences ===
  const fetchUserPreferences = async () => {
    try {
      const { data } = await axios.get(`/settings/user_preference`, {
        withCredentials: true,
      });
      setUserPreferences(data);
    } catch (err) {
      console.error("Error fetching user preferences:", err);
    }
  };

  const createUserPreference = async (payload) => {
    await axios.post(`/settings/user_preference`, payload, {
      withCredentials: true,
    });
    fetchUserPreferences();
  };

  const updateUserPreference = async (user_id, payload) => {
    await axios.put(`/settings/user_preference/${user_id}`, payload, {
      withCredentials: true,
    });
    fetchUserPreferences();
  };

  const deleteUserPreference = async (user_id) => {
    await axios.delete(`/settings/user_preference/${user_id}`, {
      withCredentials: true,
    });
    fetchUserPreferences();
  };

  // === Organization ===
  const fetchOrganizations = async () => {
    try {
      const response = await axios.get("/settings/organization", {
        withCredentials: true,
      });

      if (Array.isArray(response.data.organizations)) {
        setOrganizations(response.data.organizations);
      } else {
        console.error("Invalid response: 'organizations' is not an array");
      }
    } catch (err) {
      console.error("Error fetching organizations:", err);
    }
  };

  const createOrganization = async (payload) => {
    await axios.post(`/settings/organization`, payload, {
      withCredentials: true,
    });
    fetchOrganizations();
  };

  const updateOrganization = async (id, payload) => {
    await axios.put(`/settings/organization/${id}`, payload, {
      withCredentials: true,
    });
    fetchOrganizations();
  };

  const deleteOrganization = async (id) => {
    await axios.delete(`/settings/organization/${id}`, {
      withCredentials: true,
    });
    fetchOrganizations();
  };

  // === Approvers ===
  const fetchApprovers = async () => {
    try {
      const response = await axios.get("/settings/approver", {
        withCredentials: true,
      });

      if (Array.isArray(response.data.allApprovers)) {
        setApprovers(response.data.allApprovers);
      } else {
        console.error("Invalid response: 'approvers' is not an array");
      }
    } catch (err) {
      console.error("Error fetching approvers:", err);
    }
  };

  const createApprover = async (payload) => {
    await axios.post(`/settings/approver`, payload, { withCredentials: true });
    fetchApprovers();
  };

  const updateApprover = async (id, payload) => {
    await axios.put(`/settings/approver/${id}`, payload, {
      withCredentials: true,
    });
    fetchApprovers();
  };

  const deleteApprover = async (id) => {
    await axios.delete(`/settings/approver/${id}`, {
      withCredentials: true,
    });
    fetchApprovers();
  };

  // === Position ===

  const fetchPositions = async (id) => {
    try {
      const response = await axios.get(`/settings/position/${id}`, {
        withCredentials: true,
      });

      if (Array.isArray(response.data.positions)) {
        setPositions(response.data.positions);
      } else {
        console.error("Invalid response: 'positions' is not an array");
      }
    } catch (err) {
      console.error("Error fetching positions:", err);
    }
  };

  const createPosition = async (payload) => {
    await axios.post(`/settings/position`, payload, { withCredentials: true });
    fetchPositions();
  };

  const updatePosition = async (id, payload) => {
    await axios.put(`/settings/position/${id}`, payload, {
      withCredentials: true,
    });
    fetchPositions();
  };

  const deletePosition = async (id) => {
    await axios.delete(`/settings/position/${id}`, {
      withCredentials: true,
    });
    fetchPositions();
  };

  return (
    <SettingsContext.Provider
      value={{
        departments,
        fetchDepartments,
        createDepartment,
        updateDepartment,
        deleteDepartment,

        priorities,
        fetchPriorities,
        createPriority,
        updatePriority,
        deletePriority,

        statuses,
        fetchStatuses,
        createStatus,
        updateStatus,
        deleteStatus,

        designations,
        fetchDesignations,
        createDesignation,
        updateDesignation,
        deleteDesignation,

        userPreferences,
        fetchUserPreferences,
        createUserPreference,
        updateUserPreference,
        deleteUserPreference,

        organizations,
        fetchOrganizations,
        createOrganization,
        updateOrganization,
        deleteOrganization,

        approvers,
        fetchApprovers,
        createApprover,
        updateApprover,
        deleteApprover,

        positions,
        fetchPositions,
        createPosition,
        updatePosition,
        deletePosition,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
