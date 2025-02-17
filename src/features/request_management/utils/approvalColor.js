/**
 * Returns a color string based on the given approval status.
 * The color string can be any valid CSS color string, such as
 * a hex code or a named color.
 *
 * @param {string} approvalStatus - The approval status to get the
 * color for. Can be one of "approved", "pending", or "rejected".
 * Unknown statuses default to "gray".
 * @returns {string} The color string for the given approval status.
 */
export const getApprovalColor = (approvalStatus) => {
    switch (approvalStatus.toLowerCase()) {
      case "approved":
        return "green";
      case "pending":
        return "amber";
      case "rejected":
        return "red";
      default:
        return "gray"; // Default color for unknown statuses
    }
  };
