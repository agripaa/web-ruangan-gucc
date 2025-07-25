"use client";
import React, { useEffect, useState } from "react";
import { getReports, updateReportStatus } from "../../../services/reports";
import { getReportSummary, saveReportSummary } from "../../../services/summary";

import { createActivityLog } from "../../../services/logs";
import { FaSortUp, FaSortDown } from "react-icons/fa";
import { IoDocumentTextOutline } from "react-icons/io5";
import Swal from "sweetalert2";
import { getUnreadNotificationsCount } from "../../../services/seen";

const months = [
  { label: "Januari", value: "01" },
  { label: "Februari", value: "02" },
  { label: "Maret", value: "03" },
  { label: "April", value: "04" },
  { label: "Mei", value: "05" },
  { label: "Juni", value: "06" },
  { label: "Juli", value: "07" },
  { label: "Agustus", value: "08" },
  { label: "September", value: "09" },
  { label: "Oktober", value: "10" },
  { label: "November", value: "11" },
  { label: "Desember", value: "12" },
];

const statusOptions = [
  { label: "Semua Status", value: "" },
  { label: "Pending", value: "pending" },
  { label: "On The Way", value: "on the way" },
  { label: "In Progress", value: "in progress" },
  { label: "Done", value: "done" },
];

const years = ["2025", "2026", "2027"];

const LaporanMasuk = () => {
  const [reports, setReports] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [summary, setSummary] = useState("Belum ada laporan teknisi")

  const [totalPages, setTotalPages] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: "reported_at", direction: "desc" });

  const today = new Date();
  const currentMonth = (today.getMonth() + 1).toString().padStart(2, "0"); 
  const currentYear = today.getFullYear().toString();

  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState(currentYear);
  let sortedReports;


  useEffect(() => {
    fetchReports();
  }, [currentPage, sortConfig, selectedMonth, selectedYear, searchQuery, selectedStatus]);

  const fetchReports = async () => {
    try {
      const data = await getReports(
        currentPage,
        10,
        sortConfig.key,
        sortConfig.direction,
        selectedMonth || null,
        selectedYear || null,
        searchQuery,
        selectedStatus
      );

      setReports(data.data);
      setTotalPages(data.total_pages);
      
    } catch (error) {
    }
};

  const statusOrder = { pending: 1, "on the way": 2, "in progress": 3, done: 4 };
  
  if(reports){
    sortedReports = [...reports].sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
  }

  const openModal = async (report) => {
    setSelectedReport(report);
    setIsModalOpen(true);

    try {
      if (report.status === "done") {
        const responses = await getReportSummary(report.ID);
        setSummary(responses.summary || "Belum ada laporan teknisi");
      } else {
        setSummary("Belum ada laporan teknisi");
      }
    } catch (error) {
      setSummary("Gagal mengambil laporan teknisi");
    }
  };

  const closeModal = () => {
    setSelectedReport(null);
    setIsModalOpen(false);
  };

  const openSummaryModal = async (report) => {
    if (!report || !report.ID) {
      return;
    }

    setSelectedReport(report)
    setSelectedReportId(report.ID);
    setSummary("");
    setIsSummaryModalOpen(true);

  };

  const closeSummaryModal = () => {
    setSelectedReport(null);
    setSummary("");
    setIsSummaryModalOpen(false);
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") {
        fetchReports();
    }
};

  const handleStatusUpdate = async (report = null) => {
    if (!report) return;

    const statusFlow = {
      pending: { next: "on the way", buttonText: "Ambil" },
      "on the way": { next: "in progress", buttonText: "Progress" },
      "in progress": { next: "done", buttonText: "Selesai" },
    };

    const currentStatus = report.status;
    const nextStatus = statusFlow[currentStatus]?.next;

    if (!nextStatus) {
      console.warn(`⚠ handleStatusUpdate: No next status found for '${currentStatus}'`);
    return;
    }


    try {
      await updateReportStatus(report.ID, nextStatus);
      await fetchReports()
      await createActivityLog({
        type_log: "update report",
        action: `${report.worker ? report.worker.Username : "Someone"} Update Report`,
        detail_action: `Report Token: ${report.token} status changed from ${currentStatus} to ${nextStatus}`,
        target_report_id: report.ID,
        user_id: report.worker ? report.worker.ID : null,
      });
      // Setelah update berhasil
      window.dispatchEvent(new Event("notification-update"));



      Swal.fire("Success", `Status updated to '${nextStatus}'`, "success");
      await fetchReports(); 
      closeModal();
    } catch (error) {
      Swal.fire("Error", "Failed to update report status!", "error");
      return error
    }
  };

  const handleSaveSummary = async () => {
    if (!selectedReportId || !summary.trim()) {
      Swal.fire("Warning", "Summary cannot be empty!", "warning");
      return;
    }

    try {
      await saveReportSummary(selectedReportId, summary);
      Swal.fire("Success", "Summary saved successfully!", "success");
      
      if (selectedReport?.status === "in progress") {
        await handleStatusUpdate(selectedReport, "done"); // +
      }
      window.dispatchEvent(new Event("notification-update"));

      await fetchReports();
      closeSummaryModal();

    } catch (error) {
      Swal.fire("Error", "Failed to save summary!", "error");
    }
  };



  return (
    <div>
      {/* Lists Pengaduan Header */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center">
          <div className="flex justify-center p-3 shrink-0 bg-[#F6F6F6] rounded-xl mr-4">
            <IoDocumentTextOutline className="text-gray-600 text-2xl" />
          </div>
          <h2 className="text-md font-normal">Lists Pengaduan</h2>
        </div>

        {/* Dropdown Filter Periode */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-sm">Periode:</span>
            <div className="flex items-center bg-[#F9F9F9] px-3 py-2 rounded-lg border-none">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent text-gray-700 outline-none cursor-pointer"
              >
                <option value="">Semua Bulan</option>
                {months.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>

              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-transparent text-gray-700 outline-none cursor-pointer ml-2"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3">
          <select
              className="border px-4 py-2 rounded-lg"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Search..."
              className="border px-4 py-2 rounded-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full border-collapse shadow-md">
          <thead>
            <tr className="bg-[#3C64FF] text-white">
              <th className="p-3 text-left">Token</th>
              <th className="p-3 text-left cursor-pointer" onClick={() => {handleSort("room");}}>
                <span className="inline-flex items-center gap-3">
                  Ruangan
                  <div className="flex flex-col">
                    <FaSortUp className={`w-3 h-3 ${sortConfig.key === "room" && sortConfig.direction === "asc" ? "text-white" : "text-gray-400"}`} />
                    <FaSortDown className={`w-3 h-3 ${sortConfig.key === "room" && sortConfig.direction === "desc" ? "text-white" : "text-gray-400"}`} />
                  </div>
                </span>
              </th>
              <th className="p-3 text-left cursor-pointer" onClick={() => handleSort("worker_id")}>
                <span className="inline-flex items-center gap-3">
                  Teknisi
                  <div className="flex flex-col">
                    <FaSortUp className={`w-3 h-3 ${sortConfig.key === "worker_id" && sortConfig.direction === "asc" ? "text-white" : "text-gray-400"}`} />
                    <FaSortDown className={`w-3 h-3 ${sortConfig.key === "worker_id" && sortConfig.direction === "desc" ? "text-white" : "text-gray-400"}`} />
                  </div>
                </span>
              </th>
              <th className="p-3 text-left">Tanggal Laporan</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white">
          {sortedReports ? 
            sortedReports?.map((report) => {
                const statusFlow = {
                  // pending: { next: "on the way", buttonText: "Ambil", color: "bg-blue-500" },
                  "on the way": { next: "in progress", buttonText: "Progress", color: "bg-yellow-500" },
                  "in progress": { next: "done", buttonText: "Selesai", color: "bg-green-500" },
                };
                  return (
                  <tr key={report.ID} className="border-b">
                    <td className="p-3">{report.token}</td>
                    <td className="p-3">{report.room}</td>
                    <td className="p-3">{report.worker ? report.worker.Username : "-"}</td>
                    <td className="p-3">{new Date(report.reported_at).toLocaleDateString()}</td>
                    <td className="p-3">{report.status}</td>
                    <td className="flex p-3 gap-3">
                    <button
                      onClick={() => {
                        openModal(report); 
                      }}
                      className="bg-gray-400 text-white px-3 py-1 rounded-md"
                    >
                      Detail
                    </button>

                    {report.status !== "in progress" ? (
                      
                      <button
                      
                        onClick={() => handleStatusUpdate(report)}
                        disabled={report.status === "pending" || report.status === "done"}
                        className={`${statusFlow[report.status]?.color} text-white px-3 py-1 rounded-md`}
                        
                      >
                        {statusFlow[report.status]?.buttonText}
                      </button>
                    ) : (
                      <button
                        onClick={() => openSummaryModal(report)}
                        className="bg-green-500 text-white px-3 py-1 rounded-md"
                      >
                        Selesai
                      </button>
                    )}


                  </td>
                </tr>
              );
            }): (
              <tr><td colSpan="4" className="p-3 text-center text-gray-500">Tidak ada laporan</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL DETAIL */}
      {isModalOpen && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className={`${selectedReport.status !== "done" ? "w-1/3" : "w-1/2"} bg-white p-6 rounded-lg shadow-lg`}> 
            <h2 className="text-xl font-bold mb-4">Detail Laporan</h2>
            <div className="flex flex-row justify-between">
              <p><strong>Ruangan:</strong> {selectedReport.room}</p>
              <p><strong>Teknisi:</strong> {selectedReport.worker ? selectedReport.worker.Username : "-"}</p>
            </div>
            <div className="flex flex-row justify-between">
              <p><strong>Tanggal Laporan:</strong> {new Date(selectedReport.reported_at).toLocaleDateString()}</p>
              <p><strong>Status:</strong> {selectedReport.status}</p>
             </div>
             <div className="flex flex-row justify-center gap-5 w-full"> 
                <div className="w-full">  
                  <label className="block mt-4 font-semibold">Deskripsi Laporan:</label>
                  <p
                    className="w-full h-40 border border-gray-300 rounded-lg p-2 mt-1 bg-gray-100 text-gray-700 overflow-y-scroll"
                    readOnly
                  >{selectedReport.description || "Tidak ada deskripsi tersedia"}</p>
                </div>
                {selectedReport.status === "done" && (
                <div className="w-full"> 
                <label className="block mt-4 font-semibold">Laporan Teknisi:</label>
                  <p
                    className="w-full h-40 border border-gray-300 rounded-lg p-2 mt-1 bg-gray-100 text-gray-700 overflow-y-scroll"
                    readOnly
                    
                  >{summary}</p>
                </div>
                )}
              </div>
            
            <div className="flex justify-between">
            <button
              onClick={closeModal}
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded-md"
            >
              Tutup
            </button>

            {selectedReport.status === "pending" && (
                <button
                  onClick={() => handleStatusUpdate(selectedReport)}
                  className="mt-4 bg-green-500 text-white px-4 py-2 rounded-md"
                >
                  Ambil
                </button>
            )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL SUMMARY */}
      {isSummaryModalOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
      <h2 className="text-xl font-bold mb-4">Summary Report</h2>

      <label className="block mt-4 font-semibold">Summary:</label>
      <textarea
        className="w-full h-32 border border-gray-300 rounded-lg p-2 mt-1 bg-gray-100 text-gray-700"
        onChange={(e) => setSummary(e.target.value)}
      ></textarea>

      <div className="flex justify-between mt-4">
        <button
          onClick={() => setIsSummaryModalOpen(false)}
          className="bg-red-500 text-white px-4 py-2 rounded-md"
        >
          Tutup
        </button>

        <button
          onClick={() => {
            handleSaveSummary(); 
          }}
          className="bg-green-500 text-white px-4 py-2 rounded-md"
        >
          Simpan
        </button>

      </div>
    </div>
  </div>
)}


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
    </div>
  );
};

export default LaporanMasuk;