// services/notif.js

import api from "./api";

// Mengambil token dari localStorage
const token = localStorage.getItem("token");

// Mengecek notifikasi baru untuk user tertentu
export const checkNewNotifications = async (id) => {
  try {
    const response = await api.get(`/client/notification/has-new/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.has_new; // Mengembalikan true atau false
  } catch (error) {
    console.error("Error checking new notifications:", error);
    return false;
  }
};

// Mendapatkan jumlah notifikasi yang belum dibaca untuk user tertentu
export const getUnreadNotificationsCount = async (id) => {
    console.log("please id:( ", id)
  try {
    const response = await api.get(`/client/notification/unread/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
    });
    return response.data.unread_count; // Mengembalikan jumlah notifikasi yang belum dibaca
  } catch (error) {
    console.error("Error fetching unread notifications count:", error);
    
  }
};

// Menandai semua notifikasi sebagai telah dibaca
export const markNotificationsAsRead = async (id) => {
  try {
    const response = await api.post(`/client/notification/mark-read/${id}`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.message; // Mengembalikan pesan setelah berhasil
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    throw error.response?.data || "Failed to mark notifications as read";
  }
};
