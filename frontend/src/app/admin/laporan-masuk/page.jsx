"use client";
import React, { useEffect, useState } from "react";
import { getReports, updateReportStatus } from "@/services/reports";
import { createActivityLog } from "@/services/logs";
import { FaSortUp, FaSortDown } from "react-icons/fa";
import { IoDocumentTextOutline } from "react-icons/io5";
import Swal from "sweetalert2";

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

const years = ["2025", "2026", "2027"];

const LaporanMasuk = () => {
  const [reports, setReports] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: "reported_at", direction: "desc" });

  const today = new Date();
  const currentMonth = (today.getMonth() + 1).toString().padStart(2, "0"); 
  const currentYear = today.getFullYear().toString();

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  useEffect(() => {
    fetchReports();
  }, [currentPage, sortConfig, selectedMonth, selectedYear]);

  const fetchReports = async () => {
    try {
      const data = await getReports(currentPage, 10, sortConfig.key, sortConfig.direction, selectedMonth, selectedYear);
      setReports(data.data);
      setTotalPages(data.total_pages);
    } catch (error) {
      console.error("Failed to fetch reports:", error);
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleStatusUpdate = async (report) => {
    const statusFlow = {
      pending: { next: "on the way", buttonText: "Ambil" },
      "on the way": { next: "in progress", buttonText: "Progress" },
      "in progress": { next: "done", buttonText: "Selesai" },
    };

    const currentStatus = report.status;
    const nextStatus = statusFlow[currentStatus]?.next;
    const buttonText = statusFlow[currentStatus]?.buttonText;

    if (!nextStatus) return;

    try {
      await updateReportStatus(report.ID, nextStatus);

      // Simpan ke dalam activity logs
      await createActivityLog({
        type_log: "update report",
        action: `${report.worker ? report.worker.Username : "Someone"} Update Report`,
        detail_action: `Report Token: ${report.token} status changed from ${currentStatus} to ${nextStatus}`,
        target_report_id: report.ID,
        user_id: report.worker ? report.worker.ID : null,
      });

      fetchReports(); // Refresh data setelah update status
      Swal.fire("Success", `Status changed to ${nextStatus}`, "success");
    } catch (error) {
      console.error("Failed to update report status:", error);
      Swal.fire("Error", "Failed to update report status!", "error");
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
          <span className="text-gray-500 text-sm">Periode:</span>
          <div className="flex items-center bg-[#F9F9F9] px-3 py-2 rounded-lg border-none">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-gray-700 outline-none cursor-pointer"
            >
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
      </div>

      {/* Table */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full border-collapse shadow-md">
          <thead>
            <tr className="bg-[#3C64FF] text-white">
              <th className="p-3 text-left">Token</th>
              <th className="p-3 text-left cursor-pointer" onClick={() => handleSort("room")}>
                <span className="inline-flex items-center gap-3">
                  Ruangan
                  <div className="flex flex-col">
                    <FaSortUp className={`w-3 h-3 ${sortConfig.key === "room" && sortConfig.direction === "asc" ? "text-white" : "text-gray-400"}`} />
                    <FaSortDown className={`w-3 h-3 ${sortConfig.key === "room" && sortConfig.direction === "desc" ? "text-white" : "text-gray-400"}`} />
                  </div>
                </span>
              </th>
              <th className="p-3 text-left cursor-pointer" onClick={() => handleSort("technician")}>
                <span className="inline-flex items-center gap-3">
                  Teknisi
                  <div className="flex flex-col">
                    <FaSortUp className={`w-3 h-3 ${sortConfig.key === "technician" && sortConfig.direction === "asc" ? "text-white" : "text-gray-400"}`} />
                    <FaSortDown className={`w-3 h-3 ${sortConfig.key === "technician" && sortConfig.direction === "desc" ? "text-white" : "text-gray-400"}`} />
                  </div>
                </span>
              </th>
              <th className="p-3 text-left">Tanggal Laporan</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {reports?.length > 0 ? (
              reports.map((report) => {
                const statusFlow = {
                  pending: { next: "on the way", buttonText: "Ambil", color: "bg-blue-500" },
                  "on the way": { next: "in progress", buttonText: "Progress", color: "bg-yellow-500" },
                  "in progress": { next: "done", buttonText: "Selesai", color: "bg-green-500" },
                };

                const statusData = statusFlow[report.status];

                return (
                  <tr key={report.ID} className="border-b">
                    <td className="p-3">{report.token}</td>
                    <td className="p-3">{report.room}</td>
                    <td className="p-3">{report.worker ? report.worker.Username : "-"}</td>
                    <td className="p-3">{new Date(report.reported_at).toLocaleDateString()}</td>
                    <td className="p-3">{report.status}</td>
                    <td className="p-3">
                      {statusData && (
                        <button
                          onClick={() => handleStatusUpdate(report)}
                          className={`${statusData.color} text-white px-3 py-1 rounded-md`}
                        >
                          {statusData.buttonText}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="p-3 text-center text-gray-500">
                  Tidak ada laporan masuk
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
    </div>
  );
};

export default LaporanMasuk;
