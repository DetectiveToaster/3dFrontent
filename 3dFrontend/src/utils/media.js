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

const STL_CONTENT_TYPES = new Set([
  'model/stl',
  'application/sla',
  'application/vnd.ms-pki.stl',
]);

export function detectModelFormat({ filename, contentType, format } = {}) {
  const explicit = String(format || '').trim().toLowerCase();
  if (explicit === 'stl') return 'stl';
  if (explicit === 'glb' || explicit === 'gltf') return 'gltf';

  const safeFilename = String(filename || '').toLowerCase();
  if (safeFilename.endsWith('.stl')) return 'stl';
  if (safeFilename.endsWith('.glb') || safeFilename.endsWith('.gltf')) return 'gltf';

  const type = String(contentType || '').split(';')[0].trim().toLowerCase();
  if (STL_CONTENT_TYPES.has(type)) return 'stl';

  return 'gltf';
}

export function detectMediaModelFormat(media = {}) {
  return detectModelFormat({
    filename: media.filename || media.name || media.path,
    contentType: media.content_type || media.contentType || media.mime_type || media.mimeType,
    format: media.format || media.model_format || media.modelFormat,
  });
}

function decodeAscii(bytes) {
  try {
    return new TextDecoder('utf-8').decode(bytes);
  } catch (err) {
    return '';
  }
}

function hasGlbHeader(bytes) {
  return bytes.length >= 4 && bytes[0] === 0x67 && bytes[1] === 0x6c && bytes[2] === 0x54 && bytes[3] === 0x46;
}

function looksLikeGltfJson(bytes) {
  const text = decodeAscii(bytes).trimStart();
  return text.startsWith('{') && text.includes('"asset"');
}

function looksLikeStl(blob, bytes) {
  const text = decodeAscii(bytes).trimStart().toLowerCase();
  if (text.startsWith('solid') && (text.includes('facet') || text.includes('endsolid'))) {
    return true;
  }

  if (blob.size < 84 || bytes.length < 84) return false;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const triangles = view.getUint32(80, true);
  return 84 + triangles * 50 === blob.size;
}

export async function detectBlobModelFormat(blob, media = {}) {
  const metadataFormat = detectMediaModelFormat(media);
  if (!blob || typeof blob.slice !== 'function') return metadataFormat;

  const header = new Uint8Array(await blob.slice(0, 512).arrayBuffer());
  if (hasGlbHeader(header) || looksLikeGltfJson(header)) return 'gltf';
  if (looksLikeStl(blob, header)) return 'stl';
  return metadataFormat;
}
