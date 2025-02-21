"use client";
import React from "react";
import { FaUserCircle } from "react-icons/fa";

const Profile = () => {
  const user = {
    username: "John Doe",
    phoneNumber: "+62 812-3456-7890",
  };

  return (
    <div className="flex justify-center items-center h-[70vh]">
      <div className="bg-white shadow-md rounded-lg p-6 w-96 text-center">
        <FaUserCircle className="text-gray-500 text-9xl mx-auto mb-4" />
        <h2 className="text-xl font-semibold">{user.username}</h2>
        <p className="text-gray-500">{user.phoneNumber}</p>
      </div>
    </div>
  );
};

export default Profile;
