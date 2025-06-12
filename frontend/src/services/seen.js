import api from "./api";

// Mengambil token dari localStorage
const token = localStorage.getItem("token");

export const getUnreadNotificationsCount = async () => {
try {
  const response = await api.get(`/admin/notification/unread/`, {
    headers: {
      Authorization: `Bearer ${token}`
    },
  });
  return response.data.unread_count; // Mengembalikan jumlah notifikasi yang belum dibaca
} catch (error) {
  if([400, 401, 402, 403].includes(error.status)){
    window.location.href = '/login-admin'
  }
}
};


// Mengecek notifikasi baru untuk user tertentu
export const checkNewNotifications = async () => {
  try {
    const response = await api.get(`/admin/notification/has-new/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.has_new; // Mengembalikan true atau false
  } catch (error) {
    return false;
  }
};

// Mendapatkan jumlah notifikasi yang belum dibaca untuk user tertentu

// Menandai semua notifikasi sebagai telah dibaca
export const markNotificationsAsRead = async () => {
  try {
    const response = await api.post(`/admin/notification/mark-read/`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.message; // Mengembalikan pesan setelah berhasil
  } catch (error) {
    throw error.response?.data || "Failed to mark notifications as read";
  }
};

export const getUnreadActivityLogs = async () => {
  try {
    const response = await api.post(`/admin/notification/`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.message; // Mengembalikan pesan setelah berhasil
  } catch (error) {
    throw error.response?.data || "Failed to mark notifications as read";
  }
};

export const markAllNotificationsAsRead = async () => {
  try {
    const response = await api.post(`/admin/notification/read`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data; // Mengembalikan pesan setelah berhasil
  } catch (error) {
    throw error.response?.data || "Failed to mark notifications as read";
  }
};
