import React from "react";
import { formatDate } from "../../utils/dateFormatter";
import {
  File,
  FilePdf,
  FileImage,
  FileArchive,
  FileText,
  DownloadSimple,
  Eye,
} from "@phosphor-icons/react";

/**
 * @typedef {Object} AttachmentMeta
 * @property {string} name
 * @property {number} size
 * @property {string} type
 * @property {string} r2Path
 * @property {string} uploadedAt
 * @property {string} [url]
 */

function formatBytes(bytes) {
  if (bytes === 0 || bytes === undefined || bytes === null) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const val = (bytes / Math.pow(k, i)).toFixed(2);
  return `${val} ${sizes[i]}`;
}

function iconForType(type) {
  const t = (type || "").toLowerCase();
  if (t.includes("pdf")) return FilePdf;
  if (t.startsWith("image/")) return FileImage;
  if (t.includes("zip") || t.includes("rar") || t.includes("7z")) return FileArchive;
  if (t.startsWith("text/")) return FileText;
  return File;
}

/**
 * @param {{
 *  attachment: AttachmentMeta,
 *  url: string | null,
 *  onPreview: () => void,
 *  disabled?: boolean
 * }} props
 */
export default function AttachmentCard({ attachment, url, onPreview, disabled = false }) {
  const Icon = iconForType(attachment?.type);
  const canPreview =
    !!url &&
    ((attachment?.type || "").startsWith("image/") ||
      (attachment?.type || "").includes("pdf"));

  return (
    <li
      className="group border rounded-md p-3 bg-white dark:bg-gray-800 dark:border-gray-700 flex flex-col gap-2"
      role="listitem"
    >
      <div className="flex items-center gap-2">
        <Icon
          size={22}
          className="text-gray-700 dark:text-gray-200"
          aria-hidden="true"
        />
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
            {attachment?.name || "Unnamed file"}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {formatBytes(attachment?.size)} •{" "}
            {attachment?.uploadedAt ? formatDate(attachment.uploadedAt) : "Unknown date"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md ${
            url && !disabled
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-300 text-gray-600 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400"
          }`}
          aria-label={`Download ${attachment?.name || "file"}`}
          onClick={() => {
            if (!url || disabled) return;
            const link = document.createElement("a");
            link.href = url;
            link.download = attachment?.name || "";
            link.target = "_blank";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") e.currentTarget.click();
          }}
        >
          <DownloadSimple size={16} />
          <span>Download</span>
        </button>

        <button
          type="button"
          className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md ${
            canPreview && !disabled
              ? "bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              : "bg-gray-300 text-gray-600 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400"
          }`}
          aria-label={`Preview ${attachment?.name || "file"}`}
          onClick={() => {
            if (!canPreview || disabled) return;
            onPreview();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") e.currentTarget.click();
          }}
        >
          <Eye size={16} />
          <span>View</span>
        </button>
      </div>
    </li>
  );
}

