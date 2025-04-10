import api from "./api";

const token = localStorage.getItem("token");

export const getAllReport = async (
    page = 1,
    limit = 10,
    sort = "reported_at",
    order = "desc",
    month = "",
    year = "",
    search = "",
    status = ""
) => {
    try {
        const response = await api.get("/client/reports/paginating",{
            params: { page, limit, sort, order, month, year, search, status },
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch(error) {
    throw error.response?.data || "Failed to get data reports";
  }
};

export const getReportByToken = async (token) => {
    const tokenAuth = localStorage.getItem("token");
    try {
    const response = await api.get('/client/reports/search', {
        params: {token},
        headers: { Authorization: `Bearer ${tokenAuth}` } 
    });
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to get data report by Token";
    }
};

export const getReports = async (
    page = 1,
    limit = 10,
    sort = "reported_at",
    order = "desc",
    month = "",
    year = "",
    search = "",
    status = ""
) => {
    try {
        const response = await api.get("/admin/reports/paginate/datum", {
            params: { page, limit, sort, order, month, year, search, status },
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || "Failed to fetch reports";
    }
};

export const createReport = async (reportData) => {
    try {
      const response = await api.post("/client/reports", reportData, {
        headers: { Authorization: `Bearer ${token}` } 
    });
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to create report";
    }
  };

export const updateReportStatus = async (reportId, status) => {
    try {
        const response = await api.put(
            `/admin/reports/${reportId}/status`,
            { status },
            { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || "Failed to update report status";
    }
};

export const downloadExcel = async (month = "", year = "") => {
    try {
        const response = await api.get("/admin/reports/export/excel", {
            params: { month, year },
            headers: { Authorization: `Bearer ${token}` },
            responseType: "blob",
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `reports_${year}_${month}.xlsx`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        throw error.response?.data || "Failed to download Excel";
    }
};

export const downloadPDF = async (month = "", year = "") => {
    try {
        const response = await api.get("/admin/reports/export/pdf", {
            params: { month, year },
            headers: { Authorization: `Bearer ${token}` },
            responseType: "blob",
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `reports_${year}_${month}.pdf`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        throw error.response?.data || "Failed to download PDF";
    }
};

export const getReportStatusCounts = async () => {
  try {
    const response = await api.get("/admin/reports/status/count", {
        headers:{
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
  } catch (error) {
    return [];
  }
};
