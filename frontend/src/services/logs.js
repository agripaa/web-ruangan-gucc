import api from "./api";

const token = localStorage.getItem("token");

export const getActivityLogs = async () => {
  try {
    const response = await api.get("/admin/activity-logs", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    return [];
  }
};

export const getActivityCreateReportLog = async () => {
  try {
    const response = await api.get("/client/create-report", {
      headers: { Authorization: `Bearer ${token}` } 
  });
    return response.data.length > 0 ? response.data : [];
  } catch (error) {
    return [];
  }
};

export const getActivityUpdateReportLog = async () => {
    try {
      const response = await api.get("/client/update-report", {
        headers: { Authorization: `Bearer ${token}` } 
    });
      return response.data.length > 0 ? response.data : [];
    } catch (error) {
      return [];
    }
  };  

export const createActivityLog = async (logData) => {
  try {
    const response = await api.post("/client/logs", logData, {
      headers: { Authorization: `Bearer ${token}` } 
  });
    return response.data;
  } catch (error) {
    throw error.response?.data || "Failed to create log";
  }
};

export const updateActivityLog = async (id, logData) => {
  try {
    const response = await api.put(`/admin/activity-logs/${id}`, logData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || "Failed to update log";
  }
};

export const deleteActivityLog = async (id) => {
  try {
    const response = await api.delete(`/admin/activity-logs/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || "Failed to delete log";
  }
};
