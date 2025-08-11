import api from "./api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }
  return { Authorization: `Bearer ${token}` };
};

// ✅ GET Paginated Usages (admin)
export const getUsagesPaginated = async (
  page = 1,
  limit = 10,
  sort = "installation_date",
  order = "desc",
  month = "",
  year = "",
  search = ""
) => {
  try {
    const response = await api.get("/admin/usage/paginate", {
      params: { page, limit, sort, order, month, year, search },
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || "Failed to fetch usage data";
  }
};

// ✅ GET All Usages (non-paginated, optional use)
export const getAllUsages = async () => {
  try {
    const response = await api.get("/admin/usage", {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || "Failed to fetch all usage data";
  }
};

// ✅ GET Usage by ID
export const getUsageById = async (id) => {
  try {
    const response = await api.get(`/admin/usage/${id}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || "Failed to fetch usage detail";
  }
};

// ✅ CREATE Usage
export const createUsage = async (usageData) => {
  try {
    const response = await api.post("/admin/usage", usageData, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || "Failed to create usage";
  }
};

// ✅ UPDATE Usage
export const updateUsage = async (id, usageData) => {
  try {
    const response = await api.put(`/admin/usage/${id}`, usageData, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || "Failed to update usage";
  }
};

// ✅ DELETE Usage
export const deleteUsage = async (id) => {
  try {
    const response = await api.delete(`/admin/usage/${id}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || "Failed to delete usage";
  }
};

// ✅ DOWNLOAD Excel
export const downloadUsageExcel = async (month = "", year = "") => {
  try {
    const response = await api.get("/admin/usage/export/excel", {
      params: { month, year },
      headers: getAuthHeaders(),
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `usage_${year}_${month}.xlsx`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    throw error.response?.data || "Failed to download Excel";
  }
};

// ✅ DOWNLOAD PDF
export const downloadUsagePDF = async (month = "", year = "") => {
  try {
    const response = await api.get("/admin/usage/export/pdf", {
      params: { month, year },
      headers: getAuthHeaders(),
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `usage_${year}_${month}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    throw error.response?.data || "Failed to download PDF";
  }
};

export const getAllInventories = async () => {
  try {
    const response = await api.get("/admin/inventory", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || "Failed to fetch inventories";
  }
};
