import api from "./api";

export const login = async (username, password) => {
    try {
        const response = await api.post("/login", { username, password });
        return response.data;
    } catch (error) {
        console.error(error)
        throw error.response?.data || "Login failed";
    }
};

export const register = async (userData) => {
    try {
        const response = await api.post("/register", userData);
        return response.data;
    } catch (error) {
        throw error.response?.data || "Registration failed";
    }
};
