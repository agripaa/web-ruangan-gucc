import api from "./api"


const token = localStorage.getItem("token");

export const saveReportSummary = async (reportId, summary) => {
    try {
      const response = await api.post(`/admin/summary/${reportId}`, {
         summary: String(summary) },
        {
        headers: { Authorization: `Bearer ${token}` },
      } );
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to create summary";
    }
  };

  export const getReportSummary = async (reportId) => {
    try {
      const response = await api.get(`/admin/summary/${reportId}`, {
        headers: { Authorization: `Bearer ${token}` },  
        params: {reportId}
    });
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to get data summary";
    }
};
