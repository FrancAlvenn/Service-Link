const TYPE_REGEX = {
  job: /(job|repair|fix|maintenance|technician|work\s*order|task)/i,
  vehicle: /(vehicle|car|van|transport|driver|pickup|drop\s*off)/i,
  venue: /(venue|room|hall|event|book|reserve|meeting)/i,
};

const EXAMPLES = [
  "Venue: Book Hall A on 2025-01-15 from 09:00 to 12:00 for orientation",
  "Vehicle: Van for 5 pax on 2025-01-15, depart 08:30 to City Hall",
  "Job: Repair leaking sink in Room 204, needed by 2025-01-16",
];

const lruCache = new Map();
const lruSize = 50;

export const detectTypes = (text) => {
  const s = String(text || "");
  if (lruCache.has(s)) return lruCache.get(s);
  const types = [];
  if (TYPE_REGEX.job.test(s)) types.push("job_request");
  if (TYPE_REGEX.vehicle.test(s)) types.push("vehicle_request");
  if (TYPE_REGEX.venue.test(s)) types.push("venue_request");
  lruCache.set(s, types);
  if (lruCache.size > lruSize) {
    const firstKey = lruCache.keys().next().value;
    lruCache.delete(firstKey);
  }
  return types;
};

export const isStudent = (user) => {
  const u = user || {};
  return u.designation === 1 || u.designation_id === 1;
};

export const rateLimiter = (user) => {
  const id = user?.reference_number || user?.email || "anon";
  const key = `aiprompt_rate_${id}`;
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxReq = 5;
  const raw = localStorage.getItem(key);
  const arr = raw ? JSON.parse(raw) : [];
  const recent = arr.filter((t) => now - t < windowMs);
  if (recent.length >= maxReq) {
    return { ok: false, code: 429, message: "Too many requests. Please wait a moment." };
  }
  recent.push(now);
  localStorage.setItem(key, JSON.stringify(recent));
  return { ok: true };
};

export const validatePrompt = (text, helpers) => {
  const s = String(text || "").trim();
  if (!s) return { ok: false, code: 400, message: "Please specify your request type (Venue/Vehicle/Job) and include relevant details", examples: EXAMPLES };
  const types = detectTypes(s);
  if (types.length === 0) return { ok: false, code: 400, message: "Please specify your request type (Venue/Vehicle/Job) and include relevant details", examples: EXAMPLES };
  const d = helpers.toDate(s);
  const t = helpers.toTime(s);
  const hasQty = /\b\d+\b/.test(s);
  const hasDest = /(destination|to\s|at\s|in\s|hall|room|venue)/i.test(s);
  const hasPurpose = /(purpose|for\s|need|request)/i.test(s);
  const contextSignals = [d, t, hasQty, hasDest, hasPurpose].filter(Boolean).length;
  if (contextSignals < 2) return { ok: false, code: 400, message: "Please specify your request type (Venue/Vehicle/Job) and include relevant details", examples: EXAMPLES };
  return { ok: true, types };
};

export const shouldBlockStudent = (type, user) => {
  return isStudent(user) && type === "job_request";
};

export const normalizeType = (t) => {
  const s = String(t || "").toLowerCase();
  if (/job/.test(s)) return "job_request";
  if (/purchas|procure/.test(s)) return "purchasing_request";
  if (/vehicle|car|van|transport/.test(s)) return "vehicle_request";
  if (/venue|room|hall|event/.test(s)) return "venue_request";
  return "unknown";
};

