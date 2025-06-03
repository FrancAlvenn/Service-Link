// utils/activityUtils.js

export function getActivityStyle(type, isViewed) {
  const base = "py-2 px-3 border-l-4 rounded-md shadow-md";

  const styles = {
    status_change: isViewed
      ? "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-500"
      : "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-200 border-blue-500",

    request_access: isViewed
      ? "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-500"
      : "bg-pink-100 dark:bg-pink-900 text-pink-900 dark:text-pink-100 border-pink-500",

    approval: isViewed
      ? "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-500"
      : "bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-200 border-green-500",
  };

  return `${base} ${styles[type] || ""}`;
}
