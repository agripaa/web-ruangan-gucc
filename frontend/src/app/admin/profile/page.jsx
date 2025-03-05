"use client"
import React, { useEffect, useState } from "react";
import { getProfile, getAdmins, updateProfile, deleteAccount, logout } from "@/services/user";
import { FaUserCircle, FaEdit, FaSignOutAlt, FaTrash, FaSearch, FaUserPlus } from "react-icons/fa";
import Swal from "sweetalert2";

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [updatedProfile, setUpdatedProfile] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ username: "", phone_number: "", password: "" });

  useEffect(() => {
    fetchProfile();
    fetchAdmins();
  }, [page, searchQuery]);

  const fetchProfile = async () => {
    try {
      const userProfile = await getProfile();
      setProfile(userProfile);
      setUpdatedProfile(userProfile);
    } catch (error) {
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async () => {
    try {
      await createAdmin(newAdmin);
      setShowCreateModal(false);
      fetchAdmins();
      Swal.fire("Success", "Admin created successfully", "success");
    } catch (error) {
      Swal.fire("Error", "Failed to create admin", "error");
    }
  };


  const fetchAdmins = async () => {
    try {
      const adminData = await getAdmins(page, 10, searchQuery);
      setAdmins(adminData.data);
      setTotalPages(Math.ceil(adminData.total / 10));
    } catch (error) {
      console.error("Failed to load admin data", error);
    }
  };

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleSave = async () => {
    try {
      const updatedData = {
        username: updatedProfile.username,
        phone_number: updatedProfile.phone_number,
      };
      await updateProfile(updatedData);
      setProfile(updatedProfile);
      setEditMode(false);
      Swal.fire("Success", "Profile updated successfully", "success");
      fetchProfile();
      fetchAdmins();
    } catch (error) {
      Swal.fire("Error", "Failed to update profile", "error");
    }
  };

  const handleLogout = () => {
    Swal.fire({
      title: "Logout",
      text: "Are you sure you want to logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, logout",
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        window.location.href = "/login";
      }
    });
  };

  const handleDelete = () => {
    Swal.fire({
      title: "Delete Account",
      text: "Are you sure you want to delete your account? This action is irreversible!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      dangerMode: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        await deleteAccount();
        Swal.fire("Deleted!", "Your account has been deleted.", "success");
        window.location.href = "/login";
      }
    });
  };

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="flex gap-10 p-10">
      <div className="w-1/3 bg-white shadow-md rounded-lg p-6 text-center">
        <FaUserCircle className="text-gray-500 text-9xl mx-auto mb-4" />
        {editMode ? (
          <>
            <input
              type="text"
              value={updatedProfile.username}
              onChange={(e) => setUpdatedProfile({ ...updatedProfile, username: e.target.value })}
              className="border p-2 w-full rounded"
            />
            <input
              type="text"
              value={updatedProfile.phone_number}
              onChange={(e) => setUpdatedProfile({ ...updatedProfile, phone_number: e.target.value })}
              className="border p-2 w-full rounded mt-2"
            />
            <button onClick={handleSave} className="bg-green-500 text-white py-2 px-4 rounded w-full mt-2">Save</button>
          </>
        ) : (
          <>
            <h2 className="text-xl font-semibold">{profile?.username || "Unknown User"}</h2>
            <p className="text-gray-500">{profile?.phone_number || "No Phone Number"}</p>
            <button onClick={handleEdit} className="flex items-center justify-center bg-blue-500 text-white py-2 px-4 rounded w-full mt-2"><FaEdit className="mr-2"/> Edit</button>
          </>
        )}
        <div className="flex gap-4">
          <button onClick={handleLogout} className="flex items-center justify-center bg-yellow-500 text-white py-2 px-4 rounded w-full mt-2"><FaSignOutAlt className="mr-2 flex-shrink-0"/> Logout</button>
          <button onClick={handleDelete} className="flex items-center justify-center bg-red-500 text-white py-2 px-4 rounded w-full mt-2"><FaTrash className="mr-2 flex-shrink-0"/> Delete</button>
        </div>
      </div>

      <div className="w-2/3 bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-between mb-4">
          <div className="flex">
            <input type="text" placeholder="Search by name..." className="border p-2 w-full rounded" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            <button onClick={fetchAdmins} className="bg-blue-500 text-white py-2 px-4 rounded ml-2"><FaSearch /></button>
          </div>
          <button onClick={() => setShowCreateModal(true)} className="bg-green-500 text-white py-2 px-4 rounded w-auto ml-2 flex items-center"><FaUserPlus className="mr-2 flex-shrink-0"/> Create Admin</button>
        </div>
        <h2 className="text-xl font-semibold mb-4">Admin Users</h2>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-[#3C64FF] text-white">
              <th className="border p-2">ID</th>
              <th className="border p-2">Username</th>
              <th className="border p-2">Phone</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr key={admin.ID} className="text-center">
                <td className="border p-2">{admin.ID}</td>
                <td className="border p-2">{admin.Username}</td>
                <td className="border p-2">{admin.PhoneNumber || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-between mt-4">
          <button disabled={page === 1} onClick={() => setPage(page - 1)} className="bg-gray-300 py-2 px-4 rounded">Prev</button>
          <span>Page {page} of {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="bg-gray-300 py-2 px-4 rounded">Next</button>
        </div>
      </div>
      {showCreateModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Create New Admin</h2>
            <input type="text" placeholder="Username" className="border p-2 w-full rounded mb-2" value={newAdmin.username} onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })} />
            <input type="text" placeholder="Phone Number" className="border p-2 w-full rounded mb-2" value={newAdmin.phone_number} onChange={(e) => setNewAdmin({ ...newAdmin, phone_number: e.target.value })} />
            <input type="password" placeholder="Password" className="border p-2 w-full rounded mb-2" value={newAdmin.password} onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })} />
            <div className="flex justify-end mt-4">
              <button onClick={() => setShowCreateModal(false)} className="bg-gray-300 py-2 px-4 rounded mr-2">Cancel</button>
              <button onClick={handleCreateAdmin} className="bg-green-500 text-white py-2 px-4 rounded">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;