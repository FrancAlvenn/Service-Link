//Resolves an entity's ID by matching its name in departments, positions, or designations.

export function resolveEntityIdByName(
  name,
  { departments = [], positions = [], designations = [] }
) {
  const lowerName = name.toLowerCase().trim();

  const matchInCollection = (collection, key) =>
    collection.find((item) => item[key]?.toLowerCase().trim() === lowerName);

  const dept = matchInCollection(departments, "name");
  if (dept) return dept.id;

  const pos = matchInCollection(positions, "position");
  if (pos) return pos.id;

  const desig = matchInCollection(designations, "designation");
  if (desig) return desig.id;

  return null;
}
