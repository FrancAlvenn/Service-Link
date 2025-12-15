import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { formatDate } from "../../utils/dateFormatter";
import { X } from "@phosphor-icons/react";
import AttachmentCard from "./AttachmentCard";

/**
 * @typedef {Object} AttachmentMeta
 * @property {string} name
 * @property {number} size
 * @property {string} type
 * @property {string} r2Path
 * @property {string} uploadedAt
 * @property {string} [url]
 */

function parseR2Path(r2Path) {
  if (!r2Path || !r2Path.startsWith("r2://")) return null;
  const rest = r2Path.replace("r2://", "");
  const idx = rest.indexOf("/");
  if (idx === -1) return null;
  const bucket = rest.slice(0, idx);
  const key = rest.slice(idx + 1);
  return { bucket, key };
}

async function fetchSignedUrl({ r2Path }) {
  const endpoint = process.env.REACT_APP_SIGNED_URL_ENDPOINT;
  if (!endpoint) return null;
  try {
    const { data } = await axios.get(`${endpoint}`, {
      params: { path: r2Path },
      withCredentials: true,
    });
    return typeof data === "string" ? data : data?.url;
  } catch {
    return null;
  }
}

function resolvePublicUrl({ r2Path }) {
  const base = process.env.REACT_APP_R2_PUBLIC_BASE_URL;
  const parsed = parseR2Path(r2Path);
  if (!base || !parsed?.key) return null;
  return `${base.replace(/\/$/, "")}/${parsed.key}`;
}

export default function AttachmentList({
  attachments,
  canView = true,
  className = "",
}) {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previewIndex, setPreviewIndex] = useState(null);
  const [previewLoaded, setPreviewLoaded] = useState(false);

  const items = Array.isArray(attachments) ? attachments : [];

  const resolved = useMemo(() => {
    return items.map((a) => {
      if (a?.url) return a.url;
      const pub = resolvePublicUrl({ r2Path: a?.r2Path });
      return pub || null;
    });
  }, [attachments]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      setError(null);
      const next = [...resolved];
      const needSigned = next.map((u, i) => (u ? null : i)).filter((i) => i !== null);
      if (needSigned.length && canView) {
        await Promise.all(
          needSigned.map(async (i) => {
            const url = await fetchSignedUrl({ r2Path: items[i]?.r2Path });
            next[i] = url;
          })
        );
      }
      if (!cancelled) {
        setUrls(next);
        setLoading(false);
        if (next.some((u) => !u)) {
          setError("Some files cannot be previewed or downloaded.");
        }
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [resolved, canView]);

  if (!canView) {
    return (
      <div
        className={`w-full border rounded-md p-3 ${className}`}
        role="region"
        aria-label="File attachments"
      >
        <p className="text-sm text-gray-600 dark:text-gray-300">
          You do not have permission to view files.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`w-full ${className}`}
      role="region"
      aria-label="File attachments"
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
          Files
        </p>
        {loading && (
          <span
            className="text-xs text-gray-500 dark:text-gray-400"
            aria-live="polite"
          >
            Loading…
          </span>
        )}
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">No files uploaded.</p>
      ) : (
        <ul role="list" className="flex flex-col gap-3">
          {items.map((a, i) => (
            <AttachmentCard
              key={`${a?.name}_${i}`}
              attachment={a}
              url={urls[i]}
              onPreview={() => {
                setPreviewLoaded(false);
                setPreviewIndex(i);
              }}
              disabled={!canView}
            />
          ))}
        </ul>
      )}

      {previewIndex !== null && items[previewIndex] ? (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="File preview"
        >
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[85vh] overflow-hidden">
            <div className="flex items-center justify-between p-3 border-b dark:border-gray-700">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
                {items[previewIndex]?.name}
              </p>
              <button
                type="button"
                className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                aria-label="Close preview"
                onClick={() => setPreviewIndex(null)}
              >
                <X size={16} />
                <span>Close</span>
              </button>
            </div>
            <div className="w-full h-[70vh] bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              {(() => {
                const a = items[previewIndex];
                const url = urls[previewIndex];
                const t = (a?.type || "").toLowerCase();
                if (!url) {
                  return (
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Preview unavailable.
                    </p>
                  );
                }
                if (t.startsWith("image/")) {
                  return (
                    <>
                      {!previewLoaded && (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Loading image…
                        </span>
                      )}
                      <img
                        src={url}
                        alt={a?.name || "Image preview"}
                        className="max-h-full max-w-full object-contain"
                        onLoad={() => setPreviewLoaded(true)}
                        onError={() => setPreviewLoaded(true)}
                      />
                    </>
                  );
                }
                if (t.includes("pdf")) {
                  return (
                    <iframe
                      title="PDF preview"
                      src={url}
                      className="w-full h-full"
                      onLoad={() => setPreviewLoaded(true)}
                    />
                  );
                }
                return (
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Open file
                  </a>
                );
              })()}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
