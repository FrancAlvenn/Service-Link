/**
 * Validation dictionaries and helpers
 *
 * words: exact keywords and phrases (English + Tagalog + variations)
 * stems: partial roots to allow tolerant matching for common misspellings
 */
const DICT = {
  job: {
    words: [
      'job','repair','fix','broken','leak','damage','maintain','maintenance','technician','plumber','electrician',
      'carpenter','painter','ac','aircon','air con','light','fan','door','window','clean','paint','install','replace','check',
      'issue','problem','defect','malfunction',
      'sira','ayos','palitan','gawa','trabaho','tubero','elektrisyan','karpintero','pintor','ilaw','bentilador','pinto','bintana',
      'linis','pintura','palit','problema','depekto','pag-ayos','paglinis','pagkumpuni',
      'fix ko','ayos ko','may sira','paayos','pakiayos','parepair','pa repair','pa-check','pa check','paki-ayos','paki fix','paki repair',
      'reapir','repai','maintenace','electrcian','eletrician','aircon','air-con','aircondition','air conditioner'
    ],
    stems: ['rep','fix','maint','techn','plumb','elect','carpent','paint','air','light','fan','door','window','clean','instal','replac','check','issue','proble','defec','malfunc','sira','ayos','trab','linis','pintu']
  },
  vehicle: {
    words: [
      'vehicle','car','van','pickup','drop off','drop-off','service','driver','transport','ride','shuttle','deliver','fetch',
      'sundo','hatid','ihatid','isundo','trip','field trip','fieldtrip',
      'sasakyan','kotse','hatid-sundo','hatid sundo','pa-sakay','pa sakay','pa-hatid','pa hatid','pa-sundo','pa sundo',
      'vehicl','vehcle','vechicle','vaneo','vanr','drivr'
    ],
    stems: ['vehic','car','van','pick','drop','serv','driv','transpor','shutt','sundo','hatid','deliver','fetch']
  },
  venue: {
    words: [
      'venue','room','hall','auditorium','gym','classroom','conference','meeting','event','reserve','book','reservation','borrow','rent','occupy',
      'function hall','meeting room',
      'gamit','magamit','paggamit','pa-reserve','pa reserve','pa-book','pa book','pa-rent','pa rent','pahiram','pa-upa','paupa',
      'veneu','auditoriom','conferense','clasroom','bookk'
    ],
    stems: ['venu','room','hall','auditor','gym','class','confer','meet','event','reserv','book','rent','occup','gamit','upa','hiram']
  },
  purchasing: {
    words: [
      'purchase','procure','buy','acquire','order','requisition','rfq','po','quotation','supplier','inventory','stock','materials','equipment',
      'bumili','bilhin','pagbili','procurement',
      'purchas','purchse','procur','requistion','quottation'
    ],
    stems: ['purchas','procure','buy','acquir','order','requisi','quot','suppl','invent','stock','mater','equip','bil','procure']
  }
};

const buildPatterns = (words) =>
  words.map((w) => {
    const pat = String(w)
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      .replace(/\s*[-_/]\s*/g, "\\s*[-_\\/]?\\s*");
    return new RegExp(pat, "i");
  });

const MATCHERS = Object.fromEntries(
  Object.entries(DICT).map(([k, v]) => [k, { patterns: buildPatterns(v.words), stems: new Set(v.stems) }])
);

const normalizeText = (text) => {
  const s = String(text || "");
  const noDiacritics = s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const cleaned = noDiacritics.replace(/[^\w\s-/:]/g, " ");
  return cleaned.toLowerCase().replace(/\s+/g, " ").trim();
};

const tokenize = (text) => normalizeText(text).split(" ").filter(Boolean);

const EXAMPLES = [
  "Venue: Book Hall A on 2025-01-15 from 09:00 to 12:00 for orientation",
  "Vehicle: Van for 5 pax on 2025-01-15, depart 08:30 to City Hall",
  "Job: Repair leaking sink in Room 204, needed by 2025-01-16",
];

const lruCache = new Map();
const lruSize = 50;

export const detectTypes = (text) => {
  const original = String(text || "");
  if (lruCache.has(original)) return lruCache.get(original);
  const s = normalizeText(original);
  const tokens = tokenize(original);
  const result = [];
  const matchType = (key) => {
    const { patterns, stems } = MATCHERS[key];
    if (patterns.some((re) => re.test(s))) return true;
    for (const t of tokens) {
      const tok = t.replace(/[^a-z0-9]/g, "");
      if (tok.length < 3) continue;
      for (const st of stems) {
        if (tok.startsWith(st)) return true;
      }
    }
    return false;
  };
  if (matchType("job")) result.push("job_request");
  if (matchType("vehicle")) result.push("vehicle_request");
  if (matchType("venue")) result.push("venue_request");
  if (matchType("purchasing")) result.push("purchasing_request");
  lruCache.set(original, result);
  if (lruCache.size > lruSize) {
    const firstKey = lruCache.keys().next().value;
    lruCache.delete(firstKey);
  }
  return result;
};

const URGENCY_KEYWORDS = [
  'asap', 'as soon as possible', 'earliest', 'urgent', 'immediately',
  'right away', 'kailangan agad', 'agad', 'bilis', 'emergency',
  'as soon as you can', 'fast', 'madaliin', 'dali', 'asap lang'
]

const isUrgencyRequest = (text) => {
  const lower = String(text || '').toLowerCase()
  return URGENCY_KEYWORDS.some(kw => lower.includes(kw))
}

// Minimum 7 days advance notice
const MIN_ADVANCE_DAYS = 7
const getEarliestAllowedDate = () => {
  const d = new Date()
  d.setDate(d.getDate() + MIN_ADVANCE_DAYS)
  d.setHours(0, 0, 0, 0)
  return d
}

const toISODateLocal = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const validatePrompt = (text, helpers) => {
  const raw = String(text || "").trim();
  const s = normalizeText(raw);

  if (!raw) {
    return {
      ok: false,
      code: 400,
      message: "Please describe your request (venue, vehicle, repair, or purchasing)",
      examples: EXAMPLES,
    };
  }

  const types = detectTypes(raw);
  if (types.length === 0) {
    return {
      ok: false,
      code: 400,
      message: "I couldn't detect your request type. Are you asking for a venue, vehicle, repair job, or purchasing?",
      examples: EXAMPLES,
    };
  }

  let requestedDate = helpers.toDate(raw);
  const isUrgent = isUrgencyRequest(raw);

  if (isUrgent && !requestedDate) {
    requestedDate = getEarliestAllowedDate();
    const iso = toISODateLocal(requestedDate);
    return {
      ok: true,
      types,
      autoDate: requestedDate,
      autoDateIso: iso,
      message: `This request requires one week prior notice - the earliest available date is ${iso}`,
    };
  }

  if (requestedDate) {
    const earliest = getEarliestAllowedDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (requestedDate < earliest) {
      return {
        ok: false,
        code: 400,
        message: `Requests must be made at least ${MIN_ADVANCE_DAYS} days in advance.\nEarliest available: ${earliest.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}`,
        examples: [
          `Can you fix the projector on ${earliest.toLocaleDateString()}?`,
          "Van for field trip next week Friday",
          "Book venue 2 weeks from now",
        ],
      };
    }
  }

  const hasDate = !!(helpers.toDate(raw) || /\b(next week|tomorrow|bukas|mamaya)\b/i.test(raw) || /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|\d{1,2}[-\/]\d{1,2}|\d{4}-\d{2}-\d{2})\b/i.test(raw));
  const hasTime = !!(helpers.toTime(raw) || /\b(\d{1,2}:\d{2}|\d{1,2}(am|pm))\b/i.test(raw));
  const hasNumber = /\b(\d+|one|two|three|four|five|six|seven|eight|nine|ten|isa|dalawa|tatlo|apat|lima|anim|pito|walo|siyam|sampu)\b/i.test(raw);
  const hasLocation = /(room|hall|floor|building|city|destination|to|at|in|silid|kwarto|bulwagan|lungsod|venue)\b/i.test(raw);
  const hasPurpose = /(for|because|need|to|event|meeting|training|repair|fix|broken|kailangan|para|pag-ayos|paglinis|sira)\b/i.test(raw);

  const contextScore = [hasDate, hasTime, hasNumber, hasLocation, hasPurpose].filter(Boolean).length;
  const hasStrongKeyword = /(fix|repair|sira|ayos|book|reserve|pickup|sundo|hatid|venue|van|car|room|hall|buy|procure|purchase)\b/i.test(raw);

  if (contextScore < 1 && !hasStrongKeyword) {
    return {
      ok: false,
      code: 400,
      message: 'Please add more details — date, time, location, number of people, or purpose',
      examples: EXAMPLES,
    };
  }

  if (contextScore < 2 && hasStrongKeyword) {
    return {
      ok: true,
      types,
      warning: true,
      message: 'Please add more details — date, time, location, number of people, or purpose',
    };
  }

  return { ok: true, types };
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
