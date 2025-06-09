import axios from "axios";

/**
 * Determines if a user account should be active based on their designation
 * @param {Object} user - Fully populated user object
 */
const shouldAccountBeActive = async (user) => {
  if (!user) return;
  if (!user.designation_id) return;

  const isStudent = user.designation_id === 1;
  const hasRequiredFields = user.department_id && user.organization_id;

  // Only activate if:
  // - Student and has department & organization
  // - Or not a student
  const shouldActivate = (isStudent && hasRequiredFields) || !isStudent;

  if (shouldActivate && user.status !== "active") {
    try {
      const response = await axios.put(`/users/${user.reference_number}`, {
        status: "active",
      });

      if (response.status === 200) {
        console.log(`User ${user.reference_number} status updated to active.`);
      } else {
        throw new Error("Unexpected response.");
      }
    } catch (error) {
      console.error("User status update failed:", error);
    }
  }
};

export default shouldAccountBeActive;
