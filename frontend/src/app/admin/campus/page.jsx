"use client";
import React, { useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { FaBuildingUser } from "react-icons/fa6"; 
import Swal from "sweetalert2";
import Modal from "@/components/Modal"; 

const Campus = () => {
  const [reports, setReports] = useState([
    { id: 1, CampusName: "Kampus D", CampusLocation: "Margonda, Depok" },
    { id: 2, CampusName: "Kampus G", CampusLocation: "Kelapa Dua, Depok" },
    { id: 3, CampusName: "Kampus A", CampusLocation: "Kelapa Dua, Depok" },
    { id: 4, CampusName: "Kampus B", CampusLocation: "Kelapa Dua, Depok" },
    { id: 5, CampusName: "Kampus F", CampusLocation: "Margonda, Depok" },
    { id: 6, CampusName: "Kampus H", CampusLocation: "Kelapa Dua, Depok" },
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  const [modalType, setModalType] = useState(null);
  const [selectedCampus, setSelectedCampus] = useState(null);
  const [form, setForm] = useState({ CampusName: "", CampusLocation: "" });

  const itemsPerPage = 4;
  const totalPages = Math.ceil(reports.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentReports = reports.slice(indexOfFirstItem, indexOfLastItem);

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

  const handleSubmit = () => {
    if (modalType === "create") {
      setReports([...reports, { id: reports.length + 1, ...form }]);
    } else if (modalType === "edit") {
      setReports(
        reports.map((campus) =>
          campus.id === selectedCampus.id ? { ...campus, ...form } : campus
        )
      );
    }
    closeModal();
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        setReports(reports.filter((campus) => campus.id !== id));
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
            {currentReports.map((report) => (
              <tr key={report.id} className="border-b">
                <td className="p-3">{report.CampusName}</td>
                <td className="p-3">{report.CampusLocation}</td>
                <td className="p-3 flex justify-center space-x-3">
                  <button
                    onClick={() => openModal("edit", report)}
                    className="bg-yellow-500 p-2 hover:bg-yellow-700 text-white rounded-md"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(report.id)}
                    className="bg-red-500 p-2 hover:bg-red-700 text-white rounded-md"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col items-center mt-4">
        <div className="flex justify-center items-center">
            <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            className={`px-3 py-1 mx-1 text-sm font-semibold rounded-md ${currentPage === 1 ? "text-gray-400 cursor-not-allowed" : "text-blue-600 hover:text-blue-800"}`}
            disabled={currentPage === 1}
            >
            {"<"}
            </button>

            {[...Array(totalPages)].map((_, i) => (
            <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 mx-1 text-sm font-semibold rounded-md ${currentPage === i + 1 ? "bg-blue-600 text-white" : "text-blue-600 hover:text-blue-800"}`}
            >
                {i + 1}
            </button>
            ))}

            <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            className={`px-3 py-1 mx-1 text-sm font-semibold rounded-md ${currentPage === totalPages ? "text-gray-400 cursor-not-allowed" : "text-blue-600 hover:text-blue-800"}`}
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
