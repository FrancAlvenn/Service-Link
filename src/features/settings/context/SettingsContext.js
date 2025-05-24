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
  const [approvalRulesByDepartment, setApprovalRulesByDepartment] = useState(
    []
  );
  const [approvalRulesByRequestType, setApprovalRulesByRequestType] = useState(
    []
  );
  const [approvalRulesByDesignation, setApprovalRulesByDesignation] = useState(
    []
  );
  const [manualApprovalRules, setManualApprovalRules] = useState([]);

  useEffect(() => {
    fetchDepartments();
    fetchPriorities();
    fetchStatuses();
    fetchDesignations();
    fetchUserPreferences();
    fetchOrganizations();
    fetchApprovers();
    fetchPositions();
    fetchApprovalRulesByDepartment();
    fetchApprovalRulesByRequestType();
    fetchApprovalRulesByDesignation();
    fetchManualApprovalRules();
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
      const response = await axios.get("/settings/designation", {
        withCredentials: true,
      });

      if (Array.isArray(response.data.designations)) {
        setDesignations(response.data.designations);
      } else {
        console.error("Invalid response: 'designations' is not an array");
      }
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

  const fetchPositions = async () => {
    try {
      const response = await axios.get(`/settings/position`, {
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

  // === Approval Rules By Department ===

  const fetchApprovalRulesByDepartment = async () => {
    try {
      const response = await axios.get(
        `/settings/approval_rule_by_department`,
        {
          withCredentials: true,
        }
      );

      if (Array.isArray(response.data.allApprovalRules)) {
        setApprovalRulesByDepartment(response.data.allApprovalRules);
      } else {
        console.error("Invalid response: 'allApprovalRules' is not an array");
      }
    } catch (err) {
      console.error("Error fetching approval rules:", err);
    }
  };

  const createApprovalRuleByDepartment = async (payload) => {
    await axios.post(`/settings/approval_rule_by_department`, payload, {
      withCredentials: true,
    });
    fetchApprovalRulesByDepartment();
  };

  const updateApprovalRuleByDepartment = async (id, payload) => {
    await axios.put(`/settings/approval_rule_by_department/${id}`, payload, {
      withCredentials: true,
    });
    fetchApprovalRulesByDepartment();
  };

  const deleteApprovalRuleByDepartment = async (id) => {
    await axios.delete(`/settings/approval_rule_by_department/${id}`, {
      withCredentials: true,
    });
    fetchApprovalRulesByDepartment();
  };

  // === Approval Rules By Designation ===

  const fetchApprovalRulesByDesignation = async () => {
    try {
      const response = await axios.get(
        `/settings/approval_rule_by_designation`,
        {
          withCredentials: true,
        }
      );

      if (Array.isArray(response.data.allApprovalRules)) {
        setApprovalRulesByDesignation(response.data.allApprovalRules);
      } else {
        console.error("Invalid response: 'allApprovalRules' is not an array");
      }
    } catch (err) {
      console.error("Error fetching approval rules:", err);
    }
  };

  const createApprovalRuleByDesignation = async (payload) => {
    await axios.post(`/settings/approval_rule_by_designation`, payload, {
      withCredentials: true,
    });
    fetchApprovalRulesByDesignation();
  };

  const updateApprovalRuleByDesignation = async (id, payload) => {
    await axios.put(`/settings/approval_rule_by_designation/${id}`, payload, {
      withCredentials: true,
    });
    fetchApprovalRulesByDesignation();
  };

  const deleteApprovalRuleByDesignation = async (id) => {
    await axios.delete(`/settings/approval_rule_by_designation/${id}`, {
      withCredentials: true,
    });
    fetchApprovalRulesByDesignation();
  };

  // === Approval Rules by Request Type ===

  const fetchApprovalRulesByRequestType = async () => {
    try {
      const response = await axios.get(
        `/settings/approval_rule_by_request_type`,
        {
          withCredentials: true,
        }
      );

      if (Array.isArray(response.data.allApprovalRules)) {
        setApprovalRulesByRequestType(response.data.allApprovalRules);
      } else {
        console.error("Invalid response: 'allApprovalRules' is not an array");
      }
    } catch (err) {
      console.error("Error fetching approval rules:", err);
    }
  };

  const createApprovalRuleByRequestType = async (payload) => {
    await axios.post(`/settings/approval_rule_by_request_type`, payload, {
      withCredentials: true,
    });
    fetchApprovalRulesByRequestType();
  };

  const updateApprovalRuleByRequestType = async (id, payload) => {
    await axios.put(`/settings/approval_rule_by_request_type/${id}`, payload, {
      withCredentials: true,
    });
    fetchApprovalRulesByRequestType();
  };

  const deleteApprovalRuleByRequestType = async (id) => {
    await axios.delete(`/settings/approval_rule_by_request_type/${id}`, {
      withCredentials: true,
    });
    fetchApprovalRulesByRequestType();
  };

  // === Manual Approval Rules ===

  const fetchManualApprovalRules = async () => {
    try {
      const response = await axios.get(`/settings/manual_approval_rule`, {
        withCredentials: true,
      });

      if (Array.isArray(response.data.allManualApprovalRules)) {
        setManualApprovalRules(response.data.allManualApprovalRules);
      } else {
        console.error(
          "Invalid response: 'allManualApprovalRules' is not an array"
        );
      }
    } catch (err) {
      console.error("Error fetching approval rules:", err);
    }
  };

  const createManualApprovalRule = async (payload) => {
    await axios.post(`/settings/manual_approval_rule`, payload, {
      withCredentials: true,
    });
    fetchManualApprovalRules();
  };

  const updateManualApprovalRule = async (id, payload) => {
    await axios.put(`/settings/manual_approval_rule/${id}`, payload, {
      withCredentials: true,
    });
    fetchManualApprovalRules();
  };

  const deleteManualApprovalRule = async (id) => {
    await axios.delete(`/settings/manual_approval_rule/${id}`, {
      withCredentials: true,
    });
    fetchManualApprovalRules();
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

        approvalRulesByDepartment,
        fetchApprovalRulesByDepartment,
        createApprovalRuleByDepartment,
        updateApprovalRuleByDepartment,
        deleteApprovalRuleByDepartment,

        approvalRulesByDesignation,
        fetchApprovalRulesByDesignation,
        createApprovalRuleByDesignation,
        updateApprovalRuleByDesignation,
        deleteApprovalRuleByDesignation,

        approvalRulesByRequestType,
        fetchApprovalRulesByRequestType,
        createApprovalRuleByRequestType,
        updateApprovalRuleByRequestType,
        deleteApprovalRuleByRequestType,

        manualApprovalRules,
        fetchManualApprovalRules,
        createManualApprovalRule,
        updateManualApprovalRule,
        deleteManualApprovalRule,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
