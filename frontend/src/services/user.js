import api from "./api";

export const getProfile = async () => {
    try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");

        const response = await api.get("/client/user/profile", {
            headers: { Authorization: `Bearer ${token}` },
        });

        return response.data;
    } catch (error) {
        throw error.response?.data || "Failed to fetch profile";
    }
};
