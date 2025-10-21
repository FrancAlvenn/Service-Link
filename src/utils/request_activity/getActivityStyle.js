// utils/activityUtils.js

export function getActivityStyle(type) {
  const base = "py-2 px-3 border-l-4 rounded-md shadow-md";

  const styles = {
    status_change:
      "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-200 border-blue-500",
    request_access:
      "bg-pink-100 dark:bg-pink-900 text-pink-900 dark:text-pink-100 border-pink-500",
    approval:
      "bg-yellow-100 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-200 border-yellow-500",
    assign_approver:
      "bg-teal-100 dark:bg-teal-900 text-teal-900 dark:text-teal-100 border-teal-500",
    comment:
      "bg-fuchsia-100 dark:bg-fuchsia-900 text-fuchsia-900 dark:text-fuchsia-100 border-fuchsia-500",
  };

  return `${base} ${styles[type] || ""}`;
}
