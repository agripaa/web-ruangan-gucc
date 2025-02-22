import api from "./api"

export const getAllReport = async () => {
    try {
        const response = await api.get("/reports");
        return response.data;
    } catch(error) {
    console.error(error);
    throw error.response?.data || "Failed to get data reports";
  }
};

export const getReportByToken = async (token) => {
    try {
      const response = await api.get('/reports', {token});
      return response.data;
    } catch (error) {
      console.error(error);
      throw error.response?.data || "Failed to get data report by Token";
    }
};

export const createReport = async (reportData) => {
    try {
      const response = await api.post('/report', reportData);
      return response.data;
    } catch (error) {
      console.error(error);
      throw error.response?.data || "Failed to create report";
    }
  };