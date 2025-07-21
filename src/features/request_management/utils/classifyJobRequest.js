const JOB_CATEGORIES = {
  electrician: [
    // Core electrical terms
    "light",
    "bulb",
    "wiring",
    "socket",
    "electric",
    "outlet",
    "lighting",
    "switch",
    "breaker",
    "fuse",
    "panel",
    "circuit",
    "voltage",
    "generator",
    "transformer",

    // Problems & failures
    "flicker",
    "spark",
    "shock",
    "outage",
    "trip",
    "surge",
    "short",
    "burn",
    "failure",

    // Fixtures & devices
    "chandelier",
    "sconce",
    "lamp",
    "fluorescent",
    "led",
    "dimmer",
    "gfci",
    "conduit",

    // Actions
    "install",
    "replace",
    "rewire",
    "upgrade",
    "test",
    "troubleshoot",
    "connect",
  ],

  plumber: [
    // Fixtures & locations
    "bathroom",
    "toilet",
    "faucet",
    "sink",
    "shower",
    "tub",
    "kitchen",
    "lavatory",
    "urinal",
    "bidet",
    "vanity",
    "basin",
    "pantry",
    "laundry",

    // Components
    "pipe",
    "leak",
    "drain",
    "valve",
    "gasket",
    "seal",
    "flush",
    "trap",
    "vent",
    "hose",
    "spigot",
    "cartridge",
    "aerator",
    "nozzle",

    // Problems & actions
    "clog",
    "drip",
    "flush",
    "unclog",
    "pressure",
    "backflow",
    "overflow",
    "sewer",
    "water",
    "gas",
    "install",
    "repair",
    "replace",
    "clear",
    "snake",
  ],

  carpenter: [
    // Materials & structures
    "door",
    "table",
    "wood",
    "cabinet",
    "hinge",
    "frame",
    "trim",
    "molding",
    "shelf",
    "counter",
    "desk",
    "chair",
    "bench",
    "railing",
    "stair",
    "deck",
    "fence",
    "plywood",
    "lumber",
    "stud",
    "joist",

    // Fixtures & hardware
    "handle",
    "knob",
    "drawer",
    "lock",
    "latch",
    "bracket",
    "fastener",
    "nail",
    "screw",

    // Actions & problems
    "build",
    "install",
    "repair",
    "replace",
    "hang",
    "level",
    "squeak",
    "warp",
    "split",
    "crack",
    "sand",
    "varnish",
    "stain",
    "paint",
  ],

  groundskeeper: [
    // Vegetation
    "grass",
    "tree",
    "flower",
    "bush",
    "weed",
    "mulch",
    "shrub",
    "hedge",
    "lawn",
    "turf",
    "plant",
    "foliage",
    "ivy",
    "vines",
    "garden",
    "bed",
    "sod",
    "seedling",

    // Land features
    "path",
    "fountain",
    "pond",
    "drainage",
    "sprinkler",
    "irrigation",
    "ditch",
    "gutter",

    // Tools & maintenance
    "mow",
    "trim",
    "prune",
    "rake",
    "blow",
    "cultivate",
    "fertilize",
    "pesticide",
    "compost",
    "dig",
    "plant",
    "water",
    "harvest",
    "spray",
    "edge",
    "sweep",
  ],

  general_service_maintenance: [
    // Generic repairs
    "repair",
    "fix",
    "maintain",
    "service",
    "adjust",
    "troubleshoot",
    "restore",
    "renew",
  ],
};

// Levenshtein distance function for fuzzy matching
const levenshtein = (a, b) => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      matrix[i][j] = Math.min(
        matrix[i - 1][j - 1] + (b[i - 1] === a[j - 1] ? 0 : 1),
        matrix[i][j - 1] + 1,
        matrix[i - 1][j] + 1
      );
    }
  }
  return matrix[b.length][a.length];
};

// Precompute fuzzy indexes for faster matching
const buildFuzzyIndex = (keywords) => {
  const index = {};
  keywords.forEach((keyword) => {
    const prefix = keyword.slice(0, 4);
    if (!index[prefix]) index[prefix] = [];
    index[prefix].push(keyword);
  });
  return index;
};

// Build fuzzy indexes for all categories
const CATEGORY_FUZZY_INDEX = {};
Object.entries(JOB_CATEGORIES).forEach(([category, keywords]) => {
  CATEGORY_FUZZY_INDEX[category] = buildFuzzyIndex(keywords);
});

export const classifyJobRequest = ({
  title,
  description = "",
  remarks = "",
  purpose = "",
}) => {
  const fullText =
    `${title} ${description} ${remarks} ${purpose}`.toLowerCase();

  // Extract and normalize words
  const words = fullText
    .split(/\W+/)
    .filter((word) => word.length > 3) // Only consider words >3 chars
    .map((word) => word.replace(/[^a-z]/, ""));

  // Count matches per category
  const categoryScores = {};

  Object.entries(JOB_CATEGORIES).forEach(([category, keywords]) => {
    const fuzzyIndex = CATEGORY_FUZZY_INDEX[category];
    let score = 0;
    const matchedKeywords = new Set();

    words.forEach((word) => {
      // Check exact matches
      if (keywords.includes(word) && !matchedKeywords.has(word)) {
        matchedKeywords.add(word);
        score++;
        return;
      }

      // Check fuzzy matches
      const prefix = word.slice(0, 4);
      if (fuzzyIndex[prefix]) {
        for (const keyword of fuzzyIndex[prefix]) {
          if (matchedKeywords.has(keyword)) continue;

          // Check for prefix match
          if (keyword.startsWith(word) && keyword.length - word.length <= 2) {
            matchedKeywords.add(keyword);
            score++;
            return;
          }

          // Check Levenshtein distance
          if (
            Math.abs(keyword.length - word.length) <= 2 &&
            levenshtein(word, keyword) <= 2
          ) {
            matchedKeywords.add(keyword);
            score++;
            return;
          }
        }
      }
    });

    categoryScores[category] = score;
  });

  // Find best match with priority to specialized categories
  let bestCategory = "general";
  let bestScore = -1;

  Object.entries(categoryScores).forEach(([category, score]) => {
    if (
      score > bestScore ||
      (score === bestScore &&
        Object.keys(JOB_CATEGORIES).indexOf(category) <
          Object.keys(JOB_CATEGORIES).indexOf(bestCategory))
    ) {
      bestScore = score;
      bestCategory = category;
    }
  });

  return bestScore > 0 ? bestCategory : "general";
};
