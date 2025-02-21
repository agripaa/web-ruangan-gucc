import api from "./api";

const token = localStorage.getItem("token");

export const getActivityLogs = async () => {
  try {
    const response = await api.get("/admin/activity-logs", {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching logs:", error);
    return [];
  }
};
