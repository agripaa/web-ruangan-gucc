"use client";
import React, { useState } from "react";
import { FaSortUp, FaSortDown, FaChevronDown } from "react-icons/fa";
import { IoDocumentTextOutline } from "react-icons/io5";

const AdminPage = () => {
  const [reports, setReports] = useState([
    { token: "sdb-9rb31ib-djh9x", room: "D421", technician: "-", status: "Belum diambil", },
    { token: "sdb-9rb31ib-djh9x", room: "D411", technician: "Setiyoko Adi P.", status: "Dalam Proses", },
    { token: "sdb-9rb31ib-djh9x", room: "D431", technician: "Abel Dimas S.", status: "Dalam Perjalanan", },
    { token: "sdb-9rb31ib-djh9x", room: "D441", technician: "Setiyoko Adi P.", status: "Selesai", },
    { token: "sdb-9rb31ib-djh9x", room: "D451", technician: "Doni Saputra", status: "Dalam Proses", },
    { token: "sdb-9rb31ib-djh9x", room: "D461", technician: "Budi Santoso", status: "Belum diambil", },
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const totalPages = Math.ceil(reports.length / itemsPerPage);

  const [sortConfig, setSortConfig] = useState({ key: "", direction: "" });

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    const sortedReports = [...reports].sort((a, b) => {
      if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
      return 0;
    });

    setReports(sortedReports);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentReports = reports.slice(indexOfFirstItem, indexOfLastItem);

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
        <div className="flex items-center">
        <button className='text-white w-24 bg-green-600 cursor-pointer hover:bg-green-800 mx-2 py-2 px-4 font-semibold rounded-xl'>Excel</button>
        <button className='text-white w-24 bg-red-600 cursor-pointer hover:bg-red-800 mx-2 py-2 px-4 font-semibold rounded-xl'>Pdf</button>
            <div className="flex items-center gap-2">
                <span className="text-gray-500 text-sm">Periode:</span>
                <div className="flex items-center bg-[#F9F9F9] px-3 py-3 rounded-lg border-none w-52 justify-between">
                    <span className="text-gray-700">1-28 Feb, 2024</span>
                    <div className="bg-[#ECECEC] p-2 ml-2 rounded-md cursor-pointer">
                    <FaChevronDown className="text-gray-600" />
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Table */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full border-collapse shadow-md">
            <thead>
                <tr className="bg-[#3C64FF] text-white">
                    <th className="p-3 text-left">Token</th>

                    {/* Sorting Ruangan */}
                    <th 
                    className="p-3 text-left cursor-pointer"
                    onClick={() => handleSort("room")}
                    >
                    <span className="inline-flex items-center gap-3">
                        Ruangan
                        <div className="flex flex-col">
                        <FaSortUp className={`w-3 h-3 ${sortConfig.key === "room" && sortConfig.direction === "asc" ? "text-white" : "text-gray-400"}`} />
                        <FaSortDown className={`w-3 h-3 ${sortConfig.key === "room" && sortConfig.direction === "desc" ? "text-white" : "text-gray-400"}`} />
                        </div>
                    </span>
                    </th>

                    {/* Sorting Teknisi */}
                    <th 
                    className="p-3 text-left cursor-pointer"
                    onClick={() => handleSort("technician")}
                    >
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
            {currentReports.map((report, index) => (
              <tr key={index} className="border-b">
                <td className="p-3">{report.token}</td>
                <td className="p-3">{report.room}</td>
                <td className="p-3">{report.technician}</td>
                <td className="p-3">{report.status}</td>
              </tr>
            ))}
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

export default AdminPage;
