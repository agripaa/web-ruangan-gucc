"use client";
import React, { useEffect, useState } from "react";
import { getCampuses, createCampus, updateCampus, deleteCampus } from "@/services/campus";
import { FaEdit, FaTrash } from "react-icons/fa";
import { FaBuildingUser } from "react-icons/fa6";
import Swal from "sweetalert2";
import Modal from "@/components/Modal";

const Campus = () => {
  const [campuses, setCampuses] = useState([]); 
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modalType, setModalType] = useState(null);
  const [selectedCampus, setSelectedCampus] = useState(null);
  const [form, setForm] = useState({ CampusName: "", CampusLocation: "" });

  useEffect(() => {
    fetchCampuses();
  }, [currentPage]);

  const fetchCampuses = async () => {
    try {
      const data = await getCampuses(currentPage, 10);
      setCampuses(data?.data || []); 
      setTotalPages(data?.total_pages || 1);
    } catch (error) {
      console.error("Failed to fetch campuses:", error);
      setCampuses([]); 
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const openModal = (type, campus = null) => {
    setModalType(type);
    if (type === "edit" && campus) {
      setSelectedCampus(campus);
      setForm({ CampusName: campus.CampusName, CampusLocation: campus.CampusLocation });
    } else {
      setForm({ CampusName: "", CampusLocation: "" });
    }
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedCampus(null);
  };

  const handleSubmit = async () => {
    try {
      if (modalType === "create") {
        await createCampus(form);
      } else if (modalType === "edit") {
        await updateCampus(selectedCampus.ID, form);
      }
      fetchCampuses();
      closeModal();
    } catch (error) {
      console.error("Failed to submit:", error);
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        await deleteCampus(id);
        fetchCampuses();
        Swal.fire("Deleted!", "The campus has been deleted.", "success");
      }
    });
  };

  return (
    <div>
      {/* Lists Campus Header */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center">
          <div className="flex justify-center p-3 shrink-0 bg-[#F6F6F6] rounded-xl mr-4">
            <FaBuildingUser className="text-gray-600 text-2xl" />
          </div>
          <h2 className="text-md font-normal">Lists Campus</h2>
        </div>
        <button
          onClick={() => openModal("create")}
          className="text-white w-auto bg-blue-600 cursor-pointer hover:bg-blue-800 py-2 px-4 font-semibold rounded-xl"
        >
          Create Campus
        </button>
      </div>

      {/* Table */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full border-collapse shadow-md">
          <thead>
            <tr className="bg-[#3C64FF] text-white">
              <th className="p-3 text-left">Campus Name</th>
              <th className="p-3 text-left">Campus Location</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {campuses?.length > 0 ? (
              campuses.map((campus) => (
                <tr key={campus.ID} className="border-b">
                  <td className="p-3">{campus.CampusName}</td>
                  <td className="p-3">{campus.CampusLocation}</td>
                  <td className="p-3 flex justify-center space-x-3">
                    <button
                      onClick={() => openModal("edit", campus)}
                      className="bg-yellow-500 p-2 hover:bg-yellow-700 text-white rounded-md"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(campus.ID)}
                      className="bg-red-500 p-2 hover:bg-red-700 text-white rounded-md"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="p-3 text-center text-gray-500">
                  No campuses found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col items-center mt-4">
        <div className="flex justify-center items-center">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            className={`px-3 py-1 mx-1 text-sm font-semibold rounded-md ${
              currentPage === 1 ? "text-gray-400 cursor-not-allowed" : "text-blue-600 hover:text-blue-800"
            }`}
            disabled={currentPage === 1}
          >
            {"<"}
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((page) => {
              if (totalPages <= 3) return true; // Jika total halaman ≤ 3, tampilkan semua
              if (currentPage === 1) return page <= 3; // Jika di halaman pertama, tampilkan 1, 2, 3
              if (currentPage === totalPages) return page >= totalPages - 2; // Jika di halaman terakhir, tampilkan totalPages-2, totalPages-1, totalPages
              return page >= currentPage - 1 && page <= currentPage + 1; // Tampilkan currentPage - 1, currentPage, currentPage + 1
            })
            .map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 mx-1 text-sm font-semibold rounded-md ${
                  currentPage === page ? "bg-blue-600 text-white" : "text-blue-600 hover:text-blue-800"
                }`}
              >
                {page}
              </button>
            ))}

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            className={`px-3 py-1 mx-1 text-sm font-semibold rounded-md ${
              currentPage === totalPages ? "text-gray-400 cursor-not-allowed" : "text-blue-600 hover:text-blue-800"
            }`}
            disabled={currentPage === totalPages}
          >
            {">"}
          </button>
        </div>
      </div>


      {/* Modal */}
      <Modal
        isOpen={modalType !== null}
        title={modalType === "create" ? "Create Campus" : "Edit Campus"}
        onClose={closeModal}
        onSubmit={handleSubmit}
        submitText={modalType === "create" ? "Create" : "Save"}
      >
        <div>
          <label className="block text-gray-700">Campus Name</label>
          <input
            type="text"
            name="CampusName"
            value={form.CampusName}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>
        <div className="mt-4">
          <label className="block text-gray-700">Campus Location</label>
          <input
            type="text"
            name="CampusLocation"
            value={form.CampusLocation}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>
      </Modal>
    </div>
  );
};

export default Campus;
