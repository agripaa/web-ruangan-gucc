import api from "./api";

const token = localStorage.getItem("token");

export const getCampuses = async () => {
    try {
      const response = await api.get("/campuses");
      return response.data;
    } catch (error) {
      console.error("Error fetching campus:", error);
      throw error.response?.data || "Failed to fetch campus";
    }
  };

export const getCampusesPaginate = async (page = 1, limit = 10) => {
  try {
    const response = await api.get("/admin/campus", {
      params: { page, limit },
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching campus:", error);
    throw error.response?.data || "Failed to fetch campus";
  }
};

export const getCampusById = async (id) => {
  try {
    const response = await api.get(`/admin/campus/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching campus:", error);
    throw error.response?.data || "Failed to fetch campus";
  }
};

export const createCampus = async (campusData) => {
  try {
    const response = await api.post("/admin/campus", campusData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating campus:", error);
    throw error.response?.data || "Failed to create campus";
  }
};

export const updateCampus = async (id, campusData) => {
  try {
    const response = await api.put(`/admin/campus/${id}`, campusData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating campus:", error);
    throw error.response?.data || "Failed to update campus";
  }
};

export const deleteCampus = async (id) => {
  try {
    const response = await api.delete(`/admin/campus/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting campus:", error);
    throw error.response?.data || "Failed to delete campus";
  }
};
