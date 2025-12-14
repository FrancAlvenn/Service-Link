import React, { createContext, useContext } from "react";

function parseBoolEnv(name) {
  const raw =
    (process.env[name] ??
      process.env[`REACT_APP_${name}`] ??
      "").toString().trim().toLowerCase();
  if (raw === "1" || raw === "true" || raw === "yes" || raw === "on") return true;
  if (raw === "0" || raw === "false" || raw === "no" || raw === "off") return false;
  return false;
}

const defaultFlags = {
  ENABLE_FILE_ATTACHMENTS:
    parseBoolEnv("ENABLE_FILE_ATTACHMENTS") ||
    (process.env.REACT_APP_FEATURE_ATTACHMENTS || "")
      .toString()
      .trim()
      .toLowerCase()
      .match(/^(1|true|yes|on)$/) !== null,
};

const FeatureFlagsContext = createContext(defaultFlags);

export function useFeatureFlags() {
  return useContext(FeatureFlagsContext);
}

export default function FeatureFlagsProvider({ children, flags }) {
  const merged = {
    ENABLE_FILE_ATTACHMENTS: defaultFlags.ENABLE_FILE_ATTACHMENTS,
  };
  if (flags && typeof flags.ENABLE_FILE_ATTACHMENTS === "boolean") {
    merged.ENABLE_FILE_ATTACHMENTS = flags.ENABLE_FILE_ATTACHMENTS;
  }
  return (
    <FeatureFlagsContext.Provider value={merged}>
      {children}
    </FeatureFlagsContext.Provider>
  );
}
