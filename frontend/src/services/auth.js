import api from "./api";


export const login = async (username, password) => {
    try {
        const response = await api.post("/login", { username, password });
        return response.data;
    } catch (error) {
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


export const profile = async () => {
    try {
        const token = localStorage.getItem("token"); 
        if (!token) throw { error: "Unauthorized - No Token Provided" };

        const response = await api.get("/client/user/profile", {
            headers: { Authorization: `Bearer ${token}` } 
        });
        return response;
    } catch (error) {
        throw error.response?.data || "Unauthorized";
    }
};


export const logoutUser = () => {
    localStorage.removeItem("token");
};
