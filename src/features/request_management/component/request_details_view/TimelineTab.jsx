// components/request/TimelineTab.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Typography, Chip } from "@material-tailwind/react";

dayjs.extend(relativeTime);

const TimelineTab = ({ referenceNumber, request }) => {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/request_activity/${referenceNumber}`,
          { withCredentials: true }
        );
        setActivities(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("TimelineTab – fetch activities", e);
      }
    };
    fetch();
  }, [referenceNumber]);

  const STATUS_STAGE = {
    pending: "In-Review",
    "in review": "In-Review",
    "needs revision": "In-Review",
    "returned": "In-Review",

    "in progress": "In-Progress",
    processing: "In-Progress",
    "under review": "In-Progress",
    "on hold": "In-Progress",
    escalated: "In-Progress",
    approved: "In-Progress",

    completed: "Completed",
    done: "Completed",
    delivered: "Completed",
    closed: "Completed",

    rejected: "Rejected",
    canceled: "Rejected",
    cancelled: "Rejected",
  };

  const currentStatus = request.status?.toLowerCase().trim() || "";
  const currentStage = STATUS_STAGE[currentStatus] || "In-Review";
  const isRejected = ["rejected", "canceled", "cancelled"].includes(currentStatus);

  const baseSteps = [
    { label: "In-Review", active: ["In-Review", "In-Progress", "Completed", "Rejected"].includes(currentStage) },
    { label: "In-Progress", active: ["In-Progress", "Completed", "Rejected"].includes(currentStage) },
    { label: "Completed", active: currentStage === "Completed" },
  ];
  const progressSteps = isRejected ? [...baseSteps, { label: "Rejected", active: true }] : baseSteps;

  const creationEntry = {
    id: "created",
    created_at: request.created_at,
    action: "Request created",
    details: "",
  };

  const approvalEntries = (request.approvers ?? [])
    .filter((a) => a.status === "approved" || a.status === "rejected")
    .map((a, i) => ({
      id: `approval-${i}`,
      created_at: a.updated_at ?? a.created_at,
      action: `${a.position.position} ${a.status === "approved" ? "Approved" : "Rejected"}`,
      details: "",
    }));

  const allEntries = [creationEntry, ...approvalEntries, ...activities].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );

  const renderAction = (actionHtml) => {
    const regex = /<i>(.*?)<\/i>/g;
    const parts = [];
    let lastIdx = 0;
    let match;

    while ((match = regex.exec(actionHtml)) !== null) {
      // Text before the tag
      if (match.index > lastIdx) {
        parts.push(actionHtml.slice(lastIdx, match.index));
      }
      // The tag itself → Chip
      const tagText = match[1];
      parts.push(
        <Chip
          key={match.index}
          size="sm"
          variant="ghost"
          value={tagText}
          className="inline-block mx-1 align-middle"
          // optional: colour based on known statuses
          color={
            tagText.toLowerCase().includes("progress")
              ? "amber"
              : tagText.toLowerCase().includes("approved") ||
                tagText.toLowerCase().includes("completed")
              ? "green"
              : tagText.toLowerCase().includes("rejected")
              ? "red"
              : "gray"
          }
        />
      );
      lastIdx = match.index + match[0].length;
    }

    // Remaining text after last tag
    if (lastIdx < actionHtml.length) {
      parts.push(actionHtml.slice(lastIdx));
    }

    return parts.length ? parts : actionHtml;
  };

  return (
    <div className="flex flex-col gap-4 p-3 mb-3 border-gray-400 border rounded-md">
      <span className="flex gap-1">
        <p className="text-sm font-semibold text-gray-600">Timeline</p>
      </span>

      {/* ── Top Progress Bar ── */}
      <div className="flex items-center justify-between relative mb-4">
        {progressSteps.map((step, idx) => (
          <React.Fragment key={step.label}>
            <div className="flex flex-col items-center z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                  ${step.active
                    ? step.label === "Rejected"
                      ? "bg-red-500 text-white"
                      : "bg-green-500 text-white"
                    : "bg-gray-300 text-gray-600 dark:bg-gray-600 dark:text-gray-300"
                  }`}
              >
                {idx + 1}
              </div>
              <Typography variant="small" className="mt-1 text-xs font-medium">
                {step.label}
              </Typography>
            </div>

            {idx < progressSteps.length - 1 && (
              <div
                className={`absolute top-4 h-px transition-all
                  ${step.active
                    ? step.label === "Rejected"
                      ? "bg-red-500"
                      : "bg-green-500"
                    : "bg-gray-300 dark:bg-gray-600"
                  }`}
                style={{
                  width: `calc(${100 / (progressSteps.length * 0.65)}% - 16px)`,
                  left: idx === 0 ? "32px" : `calc(${(100 * (idx + 1)) / (progressSteps.length + 1)}% - 8px)`,
                }}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* ── Timeline ── */}
      <div className="relative pl-2">
        {allEntries.map((e, idx) => {
          const time = dayjs(e.created_at).format("DD MMM YYYY HH:mm");
          const isLast = idx === allEntries.length - 1;
          const isFirst = idx === 0;

          return (
            <div key={e.id ?? idx} className="flex gap-3 mb-3 relative">
              {/* dot + line */}
              <div className="flex flex-col items-center mt-[3px]">
                    <div
                    className={`w-[10px] h-[10px] rounded-full z-10 transition-colors
                        ${isFirst ? "bg-green-500" : isRejected ? "bg-red-500" : "bg-gray-400"}
                    `}
                    />
                {!isLast && <div className="w-px bg-gray-300 dark:bg-gray-600 flex-1 mt-1" />}
              </div>

              {/* content */}
              <div className="flex-1 pb-6">
                <p className="text-[12px] font-medium text-gray-700 dark:text-gray-100">
                  {time}
                </p>

                <p
                  variant="paragraph"
                  className="text-sm text-gray-900 dark:text-gray-300 mt-0.5 inline-block"
                >
                  {renderAction(e.action)}
                </p>

                {e.details && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
                    {e.details}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {allEntries.length === 0 && (
        <Typography className="text-center text-gray-500">
          No timeline events yet.
        </Typography>
      )}
    </div>
  );
};

export default TimelineTab;