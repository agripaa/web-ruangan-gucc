"use client";
import React, { useEffect, useState } from "react";
import { getCampuses } from "../services/campus";
import { createReport } from "../services/reports";
import { logoutUser } from "../services/auth";
import { getActivityCreateReportLog, createActivityLog } from "../services/logs";
import { FaBell, FaPlus } from "react-icons/fa";
import Image from "next/image";
import LogoGunadarma from "../assets/Universitas Gunadarma.png";
import Modal from "../components/Modal";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

const Header = () => {
  const router = useRouter();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [campuses, setCampuses] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [formData, setFormData] = useState({
    username: "",
    phone_number: "",
    campus_id: "",
    room: "",
    description: "",
  });

  useEffect(() => {
    fetchCampuses();
    fetchNotifications();
  }, []);

  // Ambil data kampus dari API
  const fetchCampuses = async () => {
    try {
      const data = await getCampuses();
      setCampuses(data || []);
    } catch (error) {
      return error
    }
  };

  const fetchNotifications = async () => {
    try {
      const logs = await getActivityCreateReportLog();
      setNotifications(logs || []);
    } catch (error) {
      return error
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "campus_id" ? parseInt(value, 10) || "" : value, 
    });
  };

  // Handle submit pengaduan
  const handleSubmit = async () => {
    try {
      const new_report = await createReport(formData);
      await createActivityLog({
        type_log: "create report",
        action: `${formData.username} Create Report`,
        detail_action: `Report Room: ${formData.room} => ${formData.description}`,
        target_report_id: new_report.ID,
        user_id: null,
      })
      Swal.fire("Success", "Report submitted successfully!", "success");
      setIsReportModalOpen(false);
    } catch (error) {
      Swal.fire("Error", "Failed to submit report!", "error");
    }
  };

  // Fungsi logout
  const handleLogout = () => {
    logoutUser();
    router.push("/login"); // Redirect ke halaman login setelah logout
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
            {/* Notification Icon */}
            <div className="relative cursor-pointer">
              <FaBell
                className="text-gray-600 text-2xl mr-6 hover:text-blue-600 transition"
                onClick={() => setIsNotifModalOpen(true)}
              />
              {notifications.length > 0 && (
                <span className="absolute -top-1 right-5 bg-red-600 text-white text-xs font-bold rounded-full px-1">
                  {notifications.length}
                </span>
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

        <div className="flex w-full justify-between items-center">
          <div>
            <h1 className="text-4xl font-medium mb-3 tracking-normal">
              Selamat Siang!
            </h1>
            <p className="text-gray-500 text-base">
              Kami siap membantu kapan saja dan dimana saja!
            </p>
          </div>

          <button
            className="flex items-center gap-3 bg-[#5981FB] text-white py-3 px-4 font-medium rounded-xl shadow-md hover:bg-blue-700 transition"
            onClick={() => setIsReportModalOpen(true)}
          >
            Buat Pengaduan
            <div className="bg-[#1942FF] p-2 rounded-md">
              <FaPlus className="text-white" />
            </div>
          </button>
        </div>
      </div>

      <Modal
        isOpen={isReportModalOpen}
        title="Buat Pengaduan"
        onClose={() => setIsReportModalOpen(false)}
        onSubmit={handleSubmit}
        submitText="Submit"
      >
        <div className="grid grid-cols-2 gap-4">
          {/* Username */}
          <div>
            <label className="block text-gray-700">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-gray-700">Phone Number</label>
            <input
              type="text"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          {/* Campus Selection */}
          <div>
            <label className="block text-gray-700">Campus</label>
            <select
              name="campus_id"
              value={formData.campus_id}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            >
              <option value="">Select Campus</option>
              {campuses.map((campus) => (
                <option key={campus.ID} value={campus.ID}>
                  {campus.CampusName} - {campus.CampusLocation}
                </option>
              ))}
            </select>
          </div>

          {/* Room Input */}
          <div>
            <label className="block text-gray-700">Room</label>
            <input
              type="text"
              name="room"
              value={formData.room}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>
        </div>

        {/* Description Textarea */}
        <div className="mt-4">
          <label className="block text-gray-700">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            rows="4"
            required
          ></textarea>
        </div>
      </Modal>

      <Modal
        isOpen={isNotifModalOpen}
        title="Incoming Reports"
        onClose={() => setIsNotifModalOpen(false)}
        submitText="Close"
        onSubmit={() => setIsNotifModalOpen(false)}
      >
        <div className="max-h-64 overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map((notif, index) => (
              <div key={index} className="p-3 border-b last:border-none">
                <p className="text-gray-600 text-sm">
                  {notif.timestamp && new Date(notif.timestamp).toString() !== "Invalid Date"
                    ? new Date(notif.timestamp).toLocaleDateString("id-ID", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })
                    : "No Date Available"}
                </p>
                <p className="font-semibold">{notif.action || "No Action Data"}</p>
                <p className="text-gray-700">
                  {notif.Report
                    ? notif.detail_action
                    : "No report data available"}
                </p>
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
