export function blockedCommonsIds(value = process.env.MUPHO_BLOCKED_COMMONS_IDS) {
  return [...new Set((value ?? "").split(",").map((id) => id.trim()).filter((id) => /^\d+$/.test(id)))].sort();
}
