"use client";
import React, { useState } from "react";
import { FaBell, FaPlus } from "react-icons/fa";
import Image from "next/image";
import LogoGunadarma from "@/assets/Universitas Gunadarma.png";
import Modal from "@/components/Modal";

const Header = () => {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    phone_number: "",
    campus_id: "",
    room: "",
    description: "",
  });

  const campuses = [
    { id: 1, name: "Kampus D - Margonda" },
    { id: 2, name: "Kampus G - Kelapa Dua" },
    { id: 3, name: "Kampus A - Kelapa Dua" },
    { id: 4, name: "Kampus B - Kelapa Dua" },
    { id: 5, name: "Kampus C - Kelapa Dua" },
  ];

  const notifications = [
    {
      action: "Incoming Report",
      detail_action: "{username} report room - Kampus D Room (D423)",
      target_report_id: 59,
      Report: {
        ID: 59,
        token: "TOKEN123",
        username: "testuser",
        phone_number: "123456789",
        room: "D423",
        campus_id: 1,
        status: "pending",
        description: "AC rusak di kelas, tidak bisa dinyalakan lebih dari 1 jam...",
        reported_at: "2025-02-20T01:49:38.304186Z",
      },
    },
    {
      action: "Incoming Report",
      detail_action: "{username} report room - Kampus G Room (D120)",
      target_report_id: 60,
      Report: {
        ID: 60,
        token: "TOKEN456",
        username: "john_doe",
        phone_number: "987654321",
        room: "D120",
        campus_id: 2,
        status: "pending",
        description: "Lampu mati total sejak pagi...",
        reported_at: "2025-02-20T02:30:10.304186Z",
      },
    },
  ];

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = () => {
    console.log("Submitting Report:", formData);
    setIsReportModalOpen(false);
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

            <button className="text-white bg-red-600 cursor-pointer hover:bg-red-800 py-2 px-4 font-semibold rounded-xl">
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

      {/* Modal for Creating a Report */}
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
                <option key={campus.id} value={campus.id}>
                  {campus.name}
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

      {/* Modal for Notifications */}
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
                  {new Date(notif.Report.reported_at).toLocaleDateString("id-ID")}
                </p>
                <p className="font-semibold">{notif.Report.username}</p>
                <p className="text-gray-700">
                  Campus: Kampus {notif.Report.campus_id} - Room {notif.Report.room}
                </p>
                <p className="text-sm text-gray-500">
                  {notif.Report.description.length > 50
                    ? notif.Report.description.substring(0, 50) + "..."
                    : notif.Report.description}
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
