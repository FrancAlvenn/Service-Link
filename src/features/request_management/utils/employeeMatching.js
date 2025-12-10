export const keywordToSkill = {
  plumbing: "Plumbing",
  pipe: "Plumbing",
  leak: "Plumbing",
  faucet: "Plumbing",
  toilet: "Plumbing",
  bathroom: "Plumbing",
  electrical: "Electrical",
  wiring: "Electrical",
  outlet: "Electrical",
  light: "Electrical",
  bulb: "Electrical",
  carpentry: "Carpentry",
  wood: "Carpentry",
  door: "Carpentry",
  window: "Carpentry",
  hvac: "HVAC",
  aircon: "HVAC",
  cooling: "HVAC",
  welding: "Welding",
  paint: "Painting",
  masonry: "Masonry",
  computer: "IT Support",
  network: "IT Support",
  clean: "Cleaning",
  maintenance: "General Maintenance",
};

export function parseRequiredSkills({ title = "", description = "", details = [], job_category }) {
  const text = `${title} ${description} ${details.map((d) => `${d.particulars} ${d.description || ''}`).join(" ")}`.toLowerCase();
  const required = new Set();
  for (const [kw, skill] of Object.entries(keywordToSkill)) {
    if (text.includes(kw)) required.add(skill);
  }
  if (job_category && keywordToSkill[job_category.toLowerCase()]) {
    required.add(keywordToSkill[job_category.toLowerCase()]);
  }
  return Array.from(required);
}

export function scoreCandidate(candidate, requiredSkills, contextText = "") {
  const quals = Array.isArray(candidate.qualifications) ? candidate.qualifications : [];
  const matches = requiredSkills.filter((s) => quals.includes(s));
  const matchScore = matches.length;
  const expBoost = candidate.experience_level === "Senior" ? 2 : candidate.experience_level === "Mid" ? 1 : 0;
  const specs = Array.isArray(candidate.specializations) ? candidate.specializations : [];
  const specializationBoost = specs.some((s) => contextText.toLowerCase().includes(String(s).toLowerCase())) ? 1 : 0;
  return { score: matchScore * 3 + expBoost + specializationBoost, matches };
}

