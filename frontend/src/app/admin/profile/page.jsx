"use client";
import React, { useEffect, useState } from "react";
import { getProfile } from "@/services/user";
import { FaUserCircle } from "react-icons/fa";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");

        const userProfile = await getProfile(token);
        setProfile(userProfile);
      } catch (error) {
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, []);

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="flex justify-center items-center h-[70vh]">
      <div className="bg-white shadow-md rounded-lg p-6 w-96 text-center">
        <FaUserCircle className="text-gray-500 text-9xl mx-auto mb-4" />
        <h2 className="text-xl font-semibold">{profile?.username || "Unknown User"}</h2>
        <p className="text-gray-500">{profile?.phone_number || "No Phone Number"}</p>
      </div>
    </div>
  );
};

export default Profile;
