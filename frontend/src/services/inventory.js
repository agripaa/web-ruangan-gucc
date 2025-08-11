import api from "./api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }
  return { Authorization: `Bearer ${token}` };
};

// ✅ GET All Inventories (non-paginated)
export const getAllInventories = async () => {
  try {
    const response = await api.get("/admin/inventory", {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || "Failed to get inventories";
  }
};

// ✅ GET Inventories with Pagination, Search, Sort, Filter
export const getInventoriesPaginated = async (
  page = 1,
  limit = 10,
  sort = "id",
  order = "asc",
  search = "",
  status = ""
) => {
  try {
    const response = await api.get("/admin/inventory/paginate", {
      params: { page, limit, sort, order, search, status },
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || "Failed to get paginated inventories";
  }
};

// ✅ GET Inventory by ID
export const getInventoryById = async (id) => {
  try {
    const response = await api.get(`/admin/inventory/${id}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || "Failed to fetch inventory by ID";
  }
};

// ✅ CREATE Inventory
export const createInventory = async (inventoryData) => {
  try {
    const response = await api.post("/admin/inventory", inventoryData, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || "Failed to create inventory";
  }
};

// ✅ UPDATE Inventory
export const updateInventory = async (id, updatedData) => {
  try {
    const response = await api.put(`/admin/inventory/${id}`, updatedData, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || "Failed to update inventory";
  }
};

// ✅ DELETE Inventory
export const deleteInventory = async (id) => {
  try {
    const response = await api.delete(`/admin/inventory/inventories/${id}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || "Failed to delete inventory";
  }
};
