import api from "./api";

export const getProfile = async () => {
    try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");

        const response = await api.get("/admin/user/profile", {
            headers: { Authorization: `Bearer ${token}` },
        });

        console.log("Profile Response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching profile:", error);
        throw error.response?.data || "Failed to fetch profile";
    }
};
