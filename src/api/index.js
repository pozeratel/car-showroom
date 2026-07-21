import * as storage from "./storage";

const DUMMYJSON_BASE = "https://dummyjson.com";
const CATEGORY_URL = `${DUMMYJSON_BASE}/products/category/vehicle`;

async function fetchVehiclePage({ limit, skip }) {
  const res = await fetch(`${CATEGORY_URL}?limit=${limit}&skip=${skip}`);
  if (!res.ok) {
    await res.text().catch(() => "");
    throw new Error("Failed to fetch vehicles");
  }
  const data = await res.json();
  return {
    products: data.products || [],
    total:
      typeof data.total === "number"
        ? data.total
        : (data.products || []).length,
  };
}
async function fetchAllVehicles() {
  const res = await fetch(`${CATEGORY_URL}?limit=0`);
  if (!res.ok) {
    await res.text().catch(() => "");
    throw new Error("Failed to fetch vehicles");
  }
  const data = await res.json();
  return data.products || [];
}

export async function getVehicles({
  search = "",
  page = 1,
  perPage = 20,
} = {}) {
  const safePage = Math.max(1, page);
  const trimmedSearch = search.trim();

  if (trimmedSearch) {
    const all = await fetchAllVehicles();
    const query = trimmedSearch.toLowerCase();
    const filtered = all.filter((p) =>
      `${p.title} ${p.description}`.toLowerCase().includes(query),
    );

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / perPage));
    const start = (safePage - 1) * perPage;
    const items = filtered.slice(start, start + perPage);

    return {
      items,
      total,
      page: safePage,
      perPage,
      totalPages,
    };
  }

  const all = await fetchAllVehicles();
  const total = all.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const start = (safePage - 1) * perPage;
  const items = all.slice(start, start + perPage);

  return {
    items,
    total,
    page: safePage,
    perPage,
    totalPages,
  };
}

export async function getVehicle(id) {
  const res = await fetch(`${DUMMYJSON_BASE}/products/${id}`);
  if (!res.ok) throw new Error("Failed to fetch vehicle");
  const product = await res.json();

  try {
    const stored = storage.getCommentsForVehicle(id);
    if (stored !== null) {
      product.comments = stored;
    } else {
      product.comments = [];
    }
  } catch (e) {
    product.comments = [];
  }

  if (!Array.isArray(product.reviews)) {
    product.reviews = [];
  }

  return product;
}

export function addComment(
  vehicleId,
  { author = "Anonymous", text = "" } = {},
) {
  const trimmed = (text || "").trim();
  if (!trimmed) throw new Error("Comment text is required");
  if (trimmed.length > 1000) throw new Error("Comment is too long");

  const id =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  const comment = {
    id,
    author: (author || "Anonymous").trim().slice(0, 100) || "Anonymous",
    text: trimmed.slice(0, 1000),
    createdAt: new Date().toISOString(),
  };

  try {
    const comments = storage.getCommentsForVehicle(vehicleId) || [];
    comments.unshift(comment);
    storage.saveCommentsForVehicle(vehicleId, comments);
  } catch (e) {}

  return comment;
}

export function getComments(vehicleId) {
  try {
    return storage.getCommentsForVehicle(vehicleId) || [];
  } catch (e) {
    return [];
  }
}

export default {
  getVehicles,
  getVehicle,
  addComment,
  getComments,
};
