"use client";
import React, { useEffect, useState } from "react";
import { getCampuses } from "../services/campus";
import { logoutUser } from "../services/auth";
import {
  getUnreadNotificationsCount,
  markAllNotificationsAsRead,
} from "../services/seen";
import api from "../services/api";
import { FaBell } from "react-icons/fa";
import Image from "next/image";
import LogoGunadarma from "../assets/Universitas Gunadarma.png";
import { RiArrowLeftLine } from "react-icons/ri";
import Modal from "../components/Modal";
import { useRouter } from "next/navigation";

const Header = () => {
  const router = useRouter();
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [campuses, setCampuses] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    const init = async () => {
      await fetchUnreadCount();
      await fetchCampuses();
    };

    init();

    // 🟡 Listen for custom event to refresh notification count
    const handleNotificationUpdate = async () => {
      await fetchUnreadCount();
    };

    window.addEventListener("notification-update", handleNotificationUpdate);

    // Cleanup
    return () => {
      window.removeEventListener("notification-update", handleNotificationUpdate);
    };
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const count = await getUnreadNotificationsCount();
      setUnreadCount(count);
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  };

  const fetchCampuses = async () => {
    try {
      const data = await getCampuses();
      setCampuses(data || []);
    } catch (error) {
      console.error("Failed to fetch campuses:", error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await api.get("/admin/notification", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setNotifications(response.data || []);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  };

  const handleClick = async () => {
    setIsNotifModalOpen(true);
    await markAllNotificationsAsRead();
    await fetchNotifications();
    setUnreadCount(0);
  };

  const handleLogout = () => {
    logoutUser();
    router.push("/login");
  };

  return (
    <header className="w-full flex justify-between items-center p-5 px-7 bg-white">
      <div className="w-full relative">
        <div className="absolute top-4">
          <button onClick={() => router.back()} className="flex items-center justify-center gap-2 text-blue-500 hover:text-blue-600">
            <RiArrowLeftLine size={20} />
            Kembali
          </button>
        </div>
        <div className="flex items-center mt-6 w-full justify-between py-8">

          <div className="flex items-center">
            <Image src={LogoGunadarma} alt="logo gunadarma" width={35} />
            <h1 className="text-md font-medium ml-2">UG Network Assistance</h1>
          </div>
          <div className="flex items-center">
            <div className="relative cursor-pointer" onClick={handleClick}>
              <FaBell className="text-gray-600 text-2xl mr-6 hover:text-blue-600 transition" />
              {unreadCount > 0 && (
                <button className="absolute -top-1 right-5 bg-red-500 text-white text-xs font-bold rounded-full px-1 h-4 w-4">
                  {unreadCount}
                </button>
              )}
            </div>
            <button
              className="text-white bg-red-600 cursor-pointer hover:bg-red-800 py-2 px-4 font-semibold rounded-xl"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isNotifModalOpen}
        title="Activity Log"
        onClose={() => setIsNotifModalOpen(false)}
        submitText="Close"
      >
        <div className="max-h-64 overflow-y-auto border rounded-md p-2">
          {notifications.length > 0 ? (
            notifications.map((notif, index) => (
              <div
                key={index}
                className={`p-3 border-b last:border-none rounded-md ${
                  notif.is_read ? "bg-white" : "bg-blue-50"
                }`}
              >
                <p className="font-semibold">{notif.action}</p>
                <p className="text-gray-600 text-xs">
                  {notif.timestamp
                    ? new Date(notif.timestamp).toLocaleDateString("id-ID", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}
                </p>
                {notif.Report && (
                  <p className="text-sm text-gray-500">
                    Room: {notif.Report.room}, Status: {notif.Report.status}
                  </p>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-600 text-center py-4">
              No notifications available.
            </p>
          )}
        </div>
      </Modal>
    </header>
  );
};

export default Header;
