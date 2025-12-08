export function sortMediaList(list = []) {
  return [...list].sort((a, b) => {
    const sa = Number.isFinite(Number(a?.sort_order)) ? Number(a.sort_order) : 0;
    const sb = Number.isFinite(Number(b?.sort_order)) ? Number(b.sort_order) : 0;
    if (sa !== sb) return sa - sb;
    const roleBias = getRoleRank(a?.role) - getRoleRank(b?.role);
    if (roleBias !== 0) return roleBias;
    return (a?.id ?? 0) - (b?.id ?? 0);
  });
}

function getRoleRank(role) {
  if (!role) return 5;
  const key = String(role).toLowerCase();
  if (key === 'thumbnail' || key === 'thumb' || key === 'primary') return 0;
  if (key === 'gallery') return 1;
  if (key === 'model') return 2;
  if (key === 'document' || key === 'pdf') return 3;
  return 4;
}

export function pickMediaByRole(list = [], kind = 'image') {
  const sorted = sortMediaList(list);
  const rolePreferred = sorted.find(
    (m) =>
      normalizeKind(m) === kind &&
      ['thumbnail', 'thumb', 'primary'].includes(String(m?.role || '').toLowerCase())
  );
  if (rolePreferred) return rolePreferred;
  return sorted.find((m) => normalizeKind(m) === kind) || sorted[0];
}

export function normalizeKind(media) {
  return (media?.kind || media?.media_type || '').toLowerCase();
}
