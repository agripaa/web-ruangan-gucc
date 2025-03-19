import api from "./api";

export const getProfile = async () => {
    try {
        const token = localStorage.getItem("token");
        if (!token) throw { status: 401, msg: "No token found" };

        const response = await api.get("/client/user/profile", {
            headers: { Authorization: `Bearer ${token}` },
        });

        return response.data;
    } catch (error) {
        throw error || "Failed to fetch profile";
    }
};

export const getAdmins = async (page = 1, limit = 10) => {
    try {
        const token = localStorage.getItem("token");
        if (!token) throw { status: 401, msg: "No token found" };

        const response = await api.get(`/admin/users?page=${page}&limit=${limit}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        return response.data;
    } catch (error) {
        throw error || "Failed to fetch admins";
    }
};

export const updateProfile = async (id, updatedData) => {
    try {
        const token = localStorage.getItem("token");
        if (!token) throw { status: 401, msg: "No token found" };

        const response = await api.put(`/admin/users/${id}`, updatedData, {
            headers: { Authorization: `Bearer ${token}` },
        });

        return response.data;
    } catch (error) {
        throw error || "Failed to update profile";
    }
};

export const deleteAccount = async () => {
    try {
        const token = localStorage.getItem("token");
        if (!token) throw { status: 401, msg: "No token found" };

        const response = await api.get("/client/user/profile", {
            headers: { Authorization: `Bearer ${token}` },
        });

        return response.data;
    } catch (error) {
        throw error || "Failed to delete account";
    }
};
