"use client";
import React, { useEffect, useState } from "react";
import { getReports, downloadExcel, downloadPDF } from "../../../services/reports";
import { FaSortUp, FaSortDown } from "react-icons/fa";
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

const statusOptions = [
  { label: "Semua Status", value: "" },
  { label: "Pending", value: "pending" },
  { label: "On The Way", value: "on the way" },
  { label: "In Progress", value: "in progress" },
  { label: "Done", value: "done" },
];

const years = ["2025", "2026", "2027"];

const Laporan = () => {
  const [reports, setReports] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: "reported_at", direction: "desc" });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const today = new Date();
  const currentMonth = (today.getMonth() + 1).toString().padStart(2, "0"); 
  const currentYear = today.getFullYear().toString();

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  useEffect(() => {
    fetchReports();
  }, [currentPage, sortConfig, selectedMonth, selectedYear, searchQuery, selectedStatus]);

  const fetchReports = async () => {
    try {
      const monthValue = selectedMonth.toString().padStart(2, "0"); // Ensure two-digit format
      const data = await getReports(
        currentPage, 
        10, 
        sortConfig.key, 
        sortConfig.direction, 
        selectedMonth, 
        selectedYear, 
        searchQuery,
        selectedStatus
      );

      setReports(data.data);
      setTotalPages(data.total_pages);
    } catch (error) {
      return error
    }
  };

  const statusOrder = { pending: 1, "on the way": 2, "in progress": 3, done: 4 };
  const sortedReports = [...reports].sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);


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
        <div className="flex items-center gap-4">
          <button onClick={() => downloadExcel(selectedMonth, selectedYear)} className="text-white w-24 bg-green-600 hover:bg-green-800 mx-2 py-2 px-4 font-semibold rounded-xl">Excel</button>
          <button onClick={() => downloadPDF(selectedMonth, selectedYear)} className="text-white w-24 bg-red-600 hover:bg-red-800 mx-2 py-2 px-4 font-semibold rounded-xl">Pdf</button>
          
          <div className="flex items-center bg-[#F9F9F9] px-3 py-2 rounded-lg border-none">
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="bg-transparent text-gray-700 outline-none cursor-pointer">
              {months.map((month) => (
                <option key={month.value} value={month.value}>{month.label}</option>
              ))}
            </select>
            <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="bg-transparent text-gray-700 outline-none cursor-pointer ml-2">
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
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
              <th className="p-3 text-left cursor-pointer" onClick={() => handleSort("technician")}>
                <span className="inline-flex items-center gap-3">
                  Teknisi
                  <div className="flex flex-col">
                    <FaSortUp className={`w-3 h-3 ${sortConfig.key === "technician" && sortConfig.direction === "asc" ? "text-white" : "text-gray-400"}`} />
                    <FaSortDown className={`w-3 h-3 ${sortConfig.key === "technician" && sortConfig.direction === "desc" ? "text-white" : "text-gray-400"}`} />
                  </div>
                </span>
              </th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {reports.length > 0 ? (
              reports.map((report, index) => (
                <tr key={index} className="border-b">
                  <td className="p-3">{report.token}</td>
                  <td className="p-3">{report.room}</td>
                  <td className="p-3">{report.worker ? report.worker.Username : "-"}</td>
                  <td className="p-3">{report.status}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="4" className="p-3 text-center text-gray-500">Tidak ada laporan</td></tr>
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

export default Laporan;
