// Simple helper to determine admin privileges from various possible user shapes
function truthy(v) {
  if (v === true) return true;
  if (typeof v === 'string') {
    const s = v.trim().toLowerCase();
    return s === 'true' || s === '1' || s === 'yes' || s === 'y' || s === 'on';
  }
  if (typeof v === 'number') return v === 1;
  return false;
}

export function isAdmin(user) {
  if (!user) return false;
  if (truthy(user.is_admin)) return true;
  if (truthy(user.isAdmin)) return true;
  if (truthy(user.is_superuser)) return true;
  if (truthy(user.is_staff)) return true;
  if (user.role && String(user.role).toLowerCase() === 'admin') return true;
  if (Array.isArray(user.roles) && user.roles.map(r => String(r).toLowerCase()).includes('admin')) return true;
  return false;
}
