import React, { useState, useContext } from "react";
import { Button, Spinner, Typography } from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../features/authentication/context/AuthContext";
import { detectTypes, validatePrompt, rateLimiter, isStudent, shouldBlockStudent, normalizeType } from "./AIPrompt.validation";

let genAIInstance = null;

const logEvent = async (payload) => {
  try {
    console.warn("AIPrompt", payload);
    const api = process.env.REACT_APP_API_URL;
    if (api) {
      await fetch(`${api}/audit/log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(() => {});
    }
  } catch (_) {}
};

/**
 * @param {{ userRole?: 'student' | 'non_student' }} props
 */
function AIPrompt({ userRole }) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fallbackType, setFallbackType] = useState("");
  const [guidance, setGuidance] = useState([]);
  const navigate = useNavigate();
  const authValue = useContext(AuthContext);
  const user = authValue?.user;
  const studentFlag = userRole ? userRole === 'student' : isStudent(user);

  const toString = (v) => (v == null ? "" : String(v).trim());
  const toInt = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : undefined;
  };
  const toDate = (v) => {
    const s = toString(v);
    const m = s.match(/\d{4}-\d{2}-\d{2}/);
    return m ? m[0] : undefined;
  };
  const toTime = (v) => {
    const s = toString(v);
    const m = s.match(/\b([01]?\d|2[0-3]):[0-5]\d\b/);
    return m ? m[0] : undefined;
  };
  const isArray = (a) => Array.isArray(a);
  const pick = (obj, keys) => {
    for (const k of keys) {
      if (obj && obj[k] != null) return obj[k];
    }
    return undefined;
  };
  const mapDetails = (arr, type) => {
    if (!isArray(arr)) return [];
    return arr
      .map((item) => {
        const particulars = toString(pick(item, ["particulars", "item", "name", "title"]));
        const quantity = toInt(pick(item, ["quantity", "qty", "count"]));
        const description = toString(pick(item, ["description", "details", "note"]));
        const remarks = toString(pick(item, ["remarks", "comment"])) || "";
        const base = { particulars, quantity: quantity || 1 };
        if (type === "job_request") return { ...base, description, remarks };
        if (type === "purchasing_request") return { ...base, description };
        if (type === "venue_request") return base;
        return base;
      })
      .filter((d) => d.particulars);
  };

  const buildPrefillFor = (type, fields) => {
    const f = fields || {};
    if (type === "job_request") {
      return {
        title: toString(pick(f, ["title", "request_title"])) || undefined,
        date_required: toDate(pick(f, ["date_required", "date", "deadline"])) || undefined,
        department: toString(pick(f, ["department", "dept"])) || undefined,
        purpose: toString(pick(f, ["purpose", "reason", "objective"])) || undefined,
        remarks: toString(pick(f, ["remarks", "notes"])) || undefined,
        job_category: toString(pick(f, ["job_category", "category"])) || undefined,
        details: mapDetails(pick(f, ["details", "items"]) || [], type),
      };
    }
    if (type === "purchasing_request") {
      return {
        title: toString(pick(f, ["title", "request_title"])) || undefined,
        date_required: toDate(pick(f, ["date_required", "date"])) || undefined,
        department: toString(pick(f, ["department", "dept"])) || undefined,
        purpose: toString(pick(f, ["purpose", "reason"])) || undefined,
        remarks: toString(pick(f, ["remarks", "notes"])) || undefined,
        supply_category: toString(pick(f, ["supply_category", "category"])) || undefined,
        details: mapDetails(pick(f, ["details", "items"]) || [], type),
      };
    }
    if (type === "vehicle_request") {
      const coords = pick(f, ["destination_coordinates", "coords", "location_coords"]);
      const normalizedCoords = isArray(coords)
        ? JSON.stringify(coords)
        : typeof coords === "string"
        ? coords
        : undefined;
      return {
        title: toString(pick(f, ["title", "request_title"])) || undefined,
        department: toString(pick(f, ["department", "dept"])) || undefined,
        vehicle_id: toString(pick(f, ["vehicle_id"])) || undefined,
        date_of_trip: toDate(pick(f, ["date_of_trip", "date"])) || undefined,
        time_of_departure: toTime(pick(f, ["time_of_departure", "start_time", "departure_time"])) || undefined,
        time_of_arrival: toTime(pick(f, ["time_of_arrival", "end_time", "arrival_time"])) || undefined,
        number_of_passengers: toInt(pick(f, ["number_of_passengers", "passengers", "pax"])) || undefined,
        destination: toString(pick(f, ["destination", "location", "address"])) || undefined,
        destination_coordinates: normalizedCoords,
        purpose: toString(pick(f, ["purpose", "reason"])) || undefined,
        remarks: toString(pick(f, ["remarks", "notes"])) || undefined,
      };
    }
    if (type === "venue_request") {
      return {
        organization: toString(pick(f, ["organization", "org"])) || undefined,
        title: toString(pick(f, ["title", "event_title"])) || undefined,
        department: toString(pick(f, ["department", "dept"])) || undefined,
        event_nature: toString(pick(f, ["event_nature", "nature"])) || undefined,
        event_nature_other: toString(pick(f, ["event_nature_other", "nature_other"])) || undefined,
        event_dates: toDate(pick(f, ["event_dates", "date"])) || undefined,
        event_start_time: toTime(pick(f, ["event_start_time", "start_time"])) || undefined,
        event_end_time: toTime(pick(f, ["event_end_time", "end_time"])) || undefined,
        venue_id: toString(pick(f, ["venue_id"])) || undefined,
        participants: toString(pick(f, ["participants", "audience"])) || undefined,
        pax_estimation: toInt(pick(f, ["pax_estimation", "pax", "headcount"])) || undefined,
        purpose: toString(pick(f, ["purpose", "reason"])) || undefined,
        remarks: toString(pick(f, ["remarks", "notes"])) || undefined,
        details: mapDetails(pick(f, ["details", "items"]) || [], type),
      };
    }
    return {};
  };

  const parseJson = (text) => {
    try {
      return JSON.parse(text);
    } catch (_) {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          return JSON.parse(match[0]);
        } catch (_) {
          return null;
        }
      }
      return null;
    }
  };


  const submitPrompt = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError("");
    setGuidance([]);
    try {
      const rl = rateLimiter(user);
      if (!rl.ok) {
        setError(rl.message);
        await logEvent({ level: "warn", code: rl.code, message: rl.message, user: user?.reference_number || null });
        return;
      }

      const validation = validatePrompt(prompt, { toDate, toTime });
      if (!validation.ok) {
        setError(validation.message);
        setGuidance(validation.examples || []);
        await logEvent({ level: "warn", code: validation.code, message: validation.message, user: user?.reference_number || null });
        return;
      }

      if (!genAIInstance) {
        const mod = await import("@google/genai");
        genAIInstance = new mod.GoogleGenAI({ apiKey: process.env.REACT_APP_GEMINI_API_KEY, apiVersion: "v1" });
      }
      const schema = `Return only JSON with keys: request_type, fields, confidences. request_type in [job_request,purchasing_request,vehicle_request,venue_request,unknown]. Ensure fields map to the portal's form structures: job_request {title,date_required,department,purpose,remarks,job_category,details[{particulars,quantity,description,remarks}]}; purchasing_request {title,date_required,department,purpose,remarks,supply_category,details[{particulars,quantity,description}]}; vehicle_request {title,department,vehicle_id,date_of_trip,time_of_departure,time_of_arrival,number_of_passengers,destination,destination_coordinates,purpose,remarks}; venue_request {organization,title,department,event_nature,event_nature_other,event_dates,event_start_time,event_end_time,venue_id,participants,pax_estimation,purpose,remarks,details[{particulars,quantity}]}. confidences map each provided field to 0..1.`;
      const result = await genAIInstance.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `${schema}\nUser request: ${prompt}`,
      });
      const text = result.text?.trim() || "";
      const data = parseJson(text);
      if (!data) {
        setError("Invalid AI response. Please refine your description.");
        return;
      }
      const type = normalizeType(data.request_type);
      if (type === "unknown" && !fallbackType) {
        setError("Please select a request type.");
        return;
      }
      const selectedRequest = type === "unknown" ? fallbackType : type;

      if (shouldBlockStudent(selectedRequest, user)) {
        const msg = "Your account type does not have permission to submit Job Requests";
        setError(msg);
        await logEvent({ level: "error", code: 403, message: msg, user: user?.reference_number || null, attempt: { type: selectedRequest } });
        return;
      }
      const fields = data.fields || {};
      const confidences = data.confidences || {};

      const prefill = buildPrefillFor(selectedRequest, fields);
      if (!prefill || typeof prefill !== "object") {
        setError("AI response could not be mapped to the form.");
        return;
      }
      Object.keys(prefill).forEach((k) => {
        const v = prefill[k];
        if (v === undefined) delete prefill[k];
      });
      navigate("/portal/create-request", {
        state: { selectedRequest, prefill, aiConfidences: confidences },
      });
    } catch (e) {
      setError("AI service is unavailable. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen h-full w-full bg-white dark:bg-gray-900 rounded-lg mt-0 px-3 flex flex-col transition-colors">
      <div className="flex flex-col h-full max-w-[800px] mx-auto w-full py-6 gap-4">
        <Typography className="text-lg font-bold text-gray-900 dark:text-gray-100">Describe Your Request</Typography>
        <Typography className="text-sm text-gray-600 dark:text-gray-300">Explain what you need in natural language. Include purpose, dates, items, destination, or venue as applicable.</Typography>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={6}
          placeholder="Example: Need a plumber to fix a leaking sink in Room 204 next week."
          className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200"
        />
        {error && (
          <div className="text-red-600 dark:text-red-400 text-sm">{error}</div>
        )}
        {guidance.length > 0 && (
          <div className="mt-2">
            <Typography className="text-xs text-gray-600 dark:text-gray-400">Examples:</Typography>
            <ul className="list-disc ml-5">
              {guidance.map((g) => (
                <li key={g} className="text-xs text-gray-600 dark:text-gray-400">{g}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex items-center gap-3">
          <Button
            color="indigo"
            onClick={submitPrompt}
            disabled={loading || !prompt.trim()}
            className="dark:bg-indigo-600 dark:hover:bg-indigo-500"
          >
            {loading ? (
              <span className="flex items-center gap-2"><Spinner className="h-4 w-4" /> Processing...</span>
            ) : (
              "Generate"
            )}
          </Button>
        </div>
        <div className="mt-4">
          <Typography className="text-xs text-gray-500 dark:text-gray-400">If the type is unclear, select one:</Typography>
          <div className="flex flex-wrap gap-2 mt-2">
            {(() => {
              const allOptions = [
                { k: "job_request", l: "Job" },
                { k: "purchasing_request", l: "Purchasing" },
                { k: "vehicle_request", l: "Vehicle" },
                { k: "venue_request", l: "Venue" },
              ];
              const allowedKeys = studentFlag
                ? ["vehicle_request", "venue_request"]
                : ["job_request", "purchasing_request", "vehicle_request", "venue_request"];
              const visible = allOptions.filter((o) => allowedKeys.includes(o.k));
              return visible;
            })().map((o) => (
              <button
                key={o.k}
                onClick={() => setFallbackType(o.k)}
                className={`px-3 py-1 text-xs rounded border ${fallbackType === o.k ? "bg-indigo-600 text-white border-indigo-600" : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700"}`}
              >
                {o.l}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIPrompt;
export { normalizeType, detectTypes, validatePrompt, rateLimiter, isStudent, shouldBlockStudent };
