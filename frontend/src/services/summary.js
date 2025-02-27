import api from "./api"


const token = localStorage.getItem("token");

// ✅ Fungsi untuk menyimpan summary laporan
// export const saveReportSummary = async (reportId, adminId, summary) => {
//   try {
//     console.log("Sending request to API:", { reportId, adminId, summary });
//     const response = await axios.post(API_URL/reportId, {
//         admin_id: adminId,
//         summary: summary,
//     });

//     console.log("API Response:", response.data);
//     return response.data;
//   } catch (error) {
//     console.error("Error saving summary:", error);
//     throw error;
//   }
// };

export const saveReportSummary = async (reportId, adminId, summary) => {
    try {
      const response = await api.post(`/admin/summary/${reportId}`, {
        admin_id: adminId, summary: summary },
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
      console.error(error);
      throw error.response?.data || "Failed to get data summary";
    }
};

// // ✅ Fungsi untuk mengambil summary laporan berdasarkan reportId
// export const getReportSummary = async (reportId) => {
//   try {
//     const response = await axios.get(API_URL/reportId);
//     return response.data;
//   } catch (error) {
//     console.error("Error fetching summary:", error);
//     throw error;
//   }
// };
