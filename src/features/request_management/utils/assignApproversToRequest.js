export default function assignApproversToRequest({
  requestType,
  requestInformation,
  approvalRulesByDepartment,
  approvalRulesByRequestType,
  approvalRulesByDesignation,
  approvers,
  department_id,
  designation_id,
}) {
  // const requestType = "Job Request";

  // const requestInformation = {
  //   approvers: [],
  //   authorized_access: [],
  //   date_required: null,
  //   details: [],
  //   purpose: "",
  //   remarks: "",
  //   requester: "",
  //   title: "",
  // };

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
    (rule) => rule.designation_id === designation_id
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
    (rule) => rule.department_id === department_id
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
      (a) => a.department_id === department_id
    );
    requestInformation.approvers = fallbackApprovers;
  }

  console.log(department_id, designation_id);
  return requestInformation;
}
