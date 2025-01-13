export const getApprovalColor = (approvalStatus) => {
    switch (approvalStatus.toLowerCase()) {
      case "approved":
        return "green";
      case "pending":
        return "gray";
      case "rejected":
        return "red";
      default:
        return "gray"; // Default color for unknown statuses
    }
  };
