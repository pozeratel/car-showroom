const STORAGE_KEY = "vehicle_comments_v1";

export function getAllCommentsMap() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return null;
  }
}

export function getCommentsForVehicle(id) {
  const map = getAllCommentsMap();
  if (map === null) return null;
  return Object.prototype.hasOwnProperty.call(map, id) ? map[id] : null;
}

export function saveCommentsForVehicle(id, comments) {
  try {
    const map = getAllCommentsMap();
    if (map === null) {
      const newMap = {};
      newMap[id] = comments;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newMap));
      return true;
    }
    map[id] = comments;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    return true;
  } catch (e) {
    return false;
  }
}

export function clearAllComments() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (e) {
    return false;
  }
}

export default {
  getAllCommentsMap,
  getCommentsForVehicle,
  saveCommentsForVehicle,
  clearAllComments,
};

export function getStorageState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null)
      return { available: true, hasData: false, corrupt: false };
    try {
      JSON.parse(raw);
      return { available: true, hasData: true, corrupt: false };
    } catch (e) {
      return { available: true, hasData: false, corrupt: true };
    }
  } catch (e) {
    return { available: false, hasData: false, corrupt: false };
  }
}
