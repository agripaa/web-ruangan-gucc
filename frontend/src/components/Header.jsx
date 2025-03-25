"use client";
import React, { useEffect, useState } from "react";
import { getCampuses } from "@/services/campus";
import { createReport } from "@/services/reports";
import { logoutUser } from "../services/auth";
import { getActivityCreateReportLog, createActivityLog, getActivityUpdateReportLog } from "@/services/logs";
import { getUnreadNotificationsCount, markNotificationsAsRead } from "../services/seen";
import { FaBell, FaPlus } from "react-icons/fa";
import Image from "next/image";
import LogoGunadarma from "@/assets/Universitas Gunadarma.png";
import Modal from "../components/Modal";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

const Header = ({ id }) => {
  const router = useRouter();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [campuses, setCampuses] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    phone_number: "",
    campus_id: "",
    room: "",
    description: "",
  });
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  

  useEffect(() => {
    const token = localStorage.getItem("token");

    // Jika tidak ada token, langsung arahkan ke /login dan hentikan eksekusi
    if (!token) {
      router.push("/login");
      return; // Menghentikan eksekusi lebih lanjut jika tidak ada token
    }

    const fetchUnreadCount = async () => {
      setLoading(true);
      const count = await getUnreadNotificationsCount(id);
      setUnreadCount(count);
      setLoading(false);
    };

    const fetchNotificationsPeriodically = () => {
      const intervalId = setInterval(() => {
        fetchUnreadCount();
        fetchNotifications();
      }, 10000); 
      return intervalId;
    };

    fetchUnreadCount();
    fetchCampuses();
    fetchNotifications();

    const intervalId = fetchNotificationsPeriodically();

  // Cleanup interval ketika komponen di-unmount
  return () => clearInterval(intervalId);
  }, [id]);

  const fetchNotificationsPeriodically = () => {
    const intervalId = setInterval(fetchNotifications, 10000); // 10 detik
    return intervalId;
  };

  const handleClick = async () => {
    handleOpenNotifications();
    await markNotificationsAsRead(id);
    setUnreadCount(0); // Reset unread count setelah notifikasi dibaca
  };

  const fetchCampuses = async () => {
    try {
      const data = await getCampuses();
      setCampuses(data || []);
    } catch (error) {
      return error;
    }
  };

  const fetchNotifications = async () => {
    try {
      const logs = await getActivityUpdateReportLog();
      setNotifications(logs || []);
      setUnreadNotifications(logs.length > 0);
    } catch (error) {
      return error;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "campus_id" ? parseInt(value, 10) || "" : value,
    });
  };

  const handleLogout = () => {
    logoutUser();
    router.push("/login");
  };

  const handleOpenNotifications = () => {
    setIsNotifModalOpen(true);
    setUnreadNotifications(false);
  };

  return (
    <header className="w-full flex justify-between items-center p-5 px-7 bg-white">
      <div className="w-full">
        <div className="flex items-center w-full justify-between py-8">
          <div className="flex items-center">
            <Image src={LogoGunadarma} alt="logo gunadarma" width={35} />
            <h1 className="text-md font-medium ml-2">UG Network Assistance</h1>
          </div>
          <div className="flex items-center">
            <div className="relative cursor-pointer" onClick={handleClick}>
              <FaBell className="text-gray-600 text-2xl mr-6 hover:text-blue-600 transition" />
              {unreadCount > 0 && (
                <button className="absolute -top-1 right-5 bg-red-500 text-white text-xs font-bold rounded-full px-1 h-4 w-4">{unreadCount}</button>
              )}
              
            </div>
            <button 
              className="text-white bg-red-600 cursor-pointer hover:bg-red-800 py-2 px-4 font-semibold rounded-xl"
              onClick={() => handleLogout()}
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
              <div key={index} className="p-3 border-b last:border-none">
                <p className="font-semibold">{notif.action}</p>
                <p className="text-gray-600 text-xs">
                  {notif.timestamp ? new Date(notif.timestamp).toLocaleDateString("id-ID", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }) : ""}
                </p>
                {notif.Report && (
                  <p className="text-sm text-gray-500">
                    Room: {notif.Report.room}, Status: {notif.Report.status}
                  </p>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-600 text-center py-4">No notifications available.</p>
          )}
        </div>
      </Modal>
    </header>
  );
};

export default Header;