"use client";
import React, { useEffect, useState } from "react";
import { getReports, updateReportStatus } from "@/services/reports";
import { FaSortUp, FaSortDown, FaChevronDown } from "react-icons/fa";
import { IoDocumentTextOutline } from "react-icons/io5";

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

const years = ["2023", "2024", "2025"];

const LaporanMasuk = () => {
  const [reports, setReports] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: "reported_at", direction: "desc" });

  const [selectedMonth, setSelectedMonth] = useState("02"); // Default Februari
  const [selectedYear, setSelectedYear] = useState("2025");

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

  const handleStatusUpdate = async (reportId, newStatus) => {
    try {
      await updateReportStatus(reportId, newStatus);
      fetchReports();
    } catch (error) {
      console.error("Failed to update report status:", error);
    }
  };

  console.log(reports)
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
            reports.map((report, index) => (
              <tr key={index} className="border-b">
                <td className="p-3">{report.token}</td>
                <td className="p-3">{report.room}</td>
                <td className="p-3">{report.worker ? report.worker.Username : "-"}</td>
                <td className="p-3">{new Date(report.reported_at).toLocaleDateString()}</td>
                <td className="p-3">{report.status}</td>
                <td className="p-3">
                  {report.status === "pending" && (
                    <button
                      onClick={() => handleStatusUpdate(report.ID, "on the way")}
                      className="bg-blue-500 text-white px-3 py-1 rounded-md"
                    >
                      Ambil
                    </button>
                  )}
                  {report.status === "on the way" && (
                    <button
                      onClick={() => handleStatusUpdate(report.ID, "in progress")}
                      className="bg-yellow-500 text-white px-3 py-1 rounded-md"
                    >
                      Progress
                    </button>
                  )}
                  {report.status === "in progress" && (
                    <button
                      onClick={() => handleStatusUpdate(report.ID, "done")}
                      className="bg-green-500 text-white px-3 py-1 rounded-md"
                    >
                      Selesai
                    </button>
                  )}
                </td>
              </tr>
            ))
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

{/* Wrapper agar pagination tetap di bawah tabel */}
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
    </div>
  );
};

export default LaporanMasuk;
