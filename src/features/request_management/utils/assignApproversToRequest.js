export default function assignApproversToRequest({
  approvalRulesByDepartment,
  approvalRulesByRequestType,
  approvalRulesByDesignation,
  approvers,
  department,
  position,
  designation,
}) {
  const requestType = "Job Request";

  const requestInformation = {
    approvers: [],
    authorized_access: [],
    date_required: null,
    department_id: 1,
    designation_id: 1,
    position_id: 1,
    details: [],
    purpose: "",
    remarks: "",
    requester: "",
    title: "",
  };

  const addedPositions = new Set();

  const addApprovers = (positionId) => {
    const matches = approvers.filter((a) => a.position_id === positionId);
    matches.forEach((a) => {
      if (!requestInformation.approvers.find((ap) => ap.id === a.id)) {
        requestInformation.approvers.push(a);
        addedPositions.add(positionId);
      }
    });
  };

  const removeApprovers = (positionId) => {
    requestInformation.approvers = requestInformation.approvers.filter(
      (a) => a.position_id !== positionId
    );
    addedPositions.delete(positionId);
  };

  let appliedDepartmentRule = false;
  let appliedDesignationRule = false;
  let appliedRequestTypeRule = false;

  // ---------------------
  // Request Type Rule
  // ---------------------
  const typeRules = approvalRulesByRequestType.filter(
    (rule) => rule.request_type === requestType
  );
  if (typeRules.length > 0) {
    appliedRequestTypeRule = true;
    for (const rule of typeRules) {
      if (rule.required) {
        addApprovers(rule.position_id);
      } else {
        removeApprovers(rule.position_id);
      }
    }
  }

  // ---------------------
  // Designation Rule
  // ---------------------
  const desigRules = approvalRulesByDesignation.filter(
    (rule) => rule.designation_id === 1
  );
  if (desigRules.length > 0) {
    appliedDesignationRule = true;
    for (const rule of desigRules) {
      if (rule.required) {
        addApprovers(rule.position_id);
      } else {
        removeApprovers(rule.position_id);
      }
    }
  }

  // ---------------------
  // Department Rule
  // ---------------------
  const deptRules = approvalRulesByDepartment.filter(
    (rule) => rule.department_id === 1
  );
  if (deptRules.length > 0) {
    appliedDepartmentRule = true;
    for (const rule of deptRules) {
      if (rule.required) {
        addApprovers(rule.position_id);
      } else {
        removeApprovers(rule.position_id);
      }
    }
  }

  // ---------------------
  // Fallback Rule
  // ---------------------
  if (
    !appliedDepartmentRule &&
    !appliedDesignationRule &&
    !appliedRequestTypeRule
  ) {
    const fallbackApprovers = approvers.filter(
      (a) => a.department_id === 1 && a.position_id === 1
    );
    requestInformation.approvers = fallbackApprovers;
  }

  console.log(requestInformation);
  return requestInformation;
}
