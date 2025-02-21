import api from "./api";

const token = localStorage.getItem("token");

export const getReports = async (page = 1, limit = 10, sort = "reported_at", order = "desc") => {
    try {
        const response = await api.get("/admin/reports/paginate/datum", {
            params: { page, limit, sort, order },
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching reports:", error);
        throw error.response?.data || "Failed to fetch reports";
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
        console.error("Error updating report status:", error);
        throw error.response?.data || "Failed to update report status";
    }
};
