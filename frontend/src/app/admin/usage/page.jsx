"use client";
import React, { useEffect, useState } from "react";
import {
  getUsagesPaginated,
  createUsage,
  downloadUsageExcel,
  downloadUsagePDF,
  getAllInventories,
  deleteUsage
} from "../../../services/usage";
import { getCampuses } from "../../../services/campus";
import { useRouter } from "next/navigation";
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

const Usage = () => {
  const [stocks, setStocks] = useState("")
  const [inventoryList, setInventoryList] = useState([]);
  const [campusList, setCampusList] = useState([]);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [totalPages, setTotalPages] = useState(1);

  const today = new Date();
  const currentMonth = (today.getMonth() + 1).toString().padStart(2, "0"); 
  const currentYear = today.getFullYear().toString();

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const [sortConfig, setSortConfig] = useState({ key: "room", direction: "desc" });
  const router = useRouter();

  const [isAddInstallModalOpen, setIsAddInstallModalOpen] = useState(false);
  const [newInstall, setNewInstall] = useState({
  namaBarang: "",
  campusId: "",
  room: "",
  tanggalPasang: "",
  kuantitas: "",
});


  useEffect(() => {
    fetchUsages();
    fetchInventories();
    fetchCampuses();
}, [currentPage, sortConfig, searchQuery, selectedMonth, selectedYear]);

  const fetchUsages = async () => {
  try {
    const data = await getUsagesPaginated(
      currentPage,
      10,
      sortConfig.key,
      sortConfig.direction,
      selectedMonth,
      selectedYear,
      searchQuery
    );
    setStocks(data.data);
    setTotalPages(data.total_pages);
  } catch (error) {
    Swal.fire("Gagal", error?.message || "Gagal mengambil data penggunaan", "error");
  }
};

const fetchInventories = async () => {
  try {
    const data = await getAllInventories();
    setInventoryList(data);
  } catch (error) {
    Swal.fire("Gagal", "Gagal mengambil daftar inventory", "error");
  }
};

const fetchCampuses = async () => {
  try {
    const data = await getCampuses();
    console.log("✅ Data kampus:", data); // tambahkan ini
    setCampusList(data);
  } catch (error) {
    Swal.fire("Gagal", "Gagal mengambil data kampus", "error");
  }
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
        fetchUsage();
    }
  };

  const handleDelete = async (id) => {
  const confirm = await Swal.fire({
    title: "Yakin ingin menghapus?",
    text: "Data yang dihapus tidak dapat dikembalikan.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Ya, hapus",
    cancelButtonText: "Batal",
  });

  if (confirm.isConfirmed) {
    try {
      await deleteUsage(id);
      Swal.fire("Berhasil", "Data berhasil dihapus", "success");
      fetchUsages();
    } catch (error) {
      Swal.fire("Gagal", error?.message || "Gagal menghapus pemasangan", "error");
    }
  }
};


  return (
    <div>
      <div className="flex items-center justify-start">
            <div className="flex items-center my-3">
              <button onClick={() => downloadUsageExcel(selectedMonth, selectedYear)} className="text-white w-24 bg-green-500 hover:bg-green-800 mr-2 py-2 px-4 font-semibold rounded-xl">Excel</button>
              <button onClick={() => downloadUsagePDF(selectedMonth, selectedYear)} className="text-white w-24 bg-red-600 hover:bg-red-800 py-2 px-4 font-semibold rounded-xl">Pdf</button>
            </div>
      </div>
      {/* Lists Pengaduan Header */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center">
          <div className="flex justify-center p-3 shrink-0 bg-[#F6F6F6] rounded-xl mr-4">
            <IoDocumentTextOutline className="text-gray-600 text-2xl" />
          </div>
          <h2 className="text-md font-normal">Usage</h2>
        </div>

        {/* Filter  */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
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
                <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="bg-transparent text-gray-700 outline-none cursor-pointer ml-2">
                  {years.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search..."
              className="border px-4 py-2 rounded-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                router.push("/admin/inventory");
              }}
              className="bg-green-500 text-white text-md px-3 py-2 rounded-md"
            >
              Tambah Barang
            </button>
            <button
              onClick={() => {
                setIsAddInstallModalOpen(true);
              }}
              className="bg-yellow-500 text-white text-md px-3 py-2 rounded-md"
            >
              Tambah Pemasangan
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full border-collapse shadow-md">
          <thead>
            <tr className="bg-[#3C64FF] text-white">
             <th className="p-3 text-center">Nama Barang</th>
              <th className="p-3 text-center">Quantity</th>
              
              <th className="p-3 text-center cursor-pointer" onClick={() => handleSort("room")}>
                <span className="inline-flex items-center gap-3">
                  Room
                  <div className="flex flex-col">
                    <FaSortUp className={`w-3 h-3 ${sortConfig.key === "room" && sortConfig.direction === "asc" ? "text-white" : "text-gray-400"}`} />
                    <FaSortDown className={`w-3 h-3 ${sortConfig.key === "room" && sortConfig.direction === "desc" ? "text-white" : "text-gray-400"}`} />
                  </div>
                </span>
              </th>
              <th className="p-3 text-center">Tanggal Pasang</th>
              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {stocks && stocks.length > 0 ? (
              stocks.map((item) => (
                <tr key={item.ID} className="border-b">
                  <td className="p-3 text-center">{item.Inventory?.Name || "-"}</td>
                  <td className="p-3 text-center">{item.Amount}</td>
                  <td className="p-3 text-center">{item.Room}</td>
                  <td className="p-3 text-center">{new Date(item.InstallationDate).toLocaleDateString()}</td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => {
                        setEditData(item);
                        setIsEditModalOpen(true);
                      }}
                      className="bg-blue-500 text-white px-3 mx-1 py-1 rounded-md"
                    >
                      Edit
                    </button>
                    <button
                      onClick={async () => {
                        const confirm = await Swal.fire({
                          title: "Yakin ingin menghapus?",
                          text: "Data yang dihapus tidak bisa dikembalikan.",
                          icon: "warning",
                          showCancelButton: true,
                          confirmButtonText: "Ya, hapus",
                          cancelButtonText: "Batal",
                        });

                        if (confirm.isConfirmed) {
                          try {
                            await deleteUsage(item.ID);
                            Swal.fire("Berhasil", "Data berhasil dihapus", "success");
                            fetchUsages();
                          } catch (error) {
                            Swal.fire("Gagal", error?.message || "Gagal menghapus", "error");
                          }
                        }
                      }}
                      className="bg-red-500 text-white px-3 mx-1 py-1 rounded-md"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="p-3 text-center text-gray-500">Tidak ada barang terpasang</td>
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

      {/* Modal create pemasangan */}
      {isAddInstallModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
            <h2 className="text-lg font-bold mb-4">Tambah Pemasangan</h2>

            <div className="flex flex-col gap-4">
              <select
                value={newInstall.namaBarang}
                onChange={(e) => setNewInstall({ ...newInstall, namaBarang: e.target.value })}
                className="border px-4 py-2 rounded-md"
              >
                <option value="">Pilih Barang</option>
                {inventoryList.map((item) => (
                  <option key={item.ID} value={item.ID}>
                    {item.Name} ({item.Amount} {item.Type})
                  </option>
                ))}
              </select> 
              <select
                value={newInstall.campusId}
                onChange={(e) => setNewInstall({ ...newInstall, campusId: e.target.value })}
                className="border px-4 py-2 rounded-md"
              >
                <option value="">Pilih Kampus</option>
                {campusList.map((campus) => (
                  <option key={campus.ID} value={campus.ID}>
                    {campus.CampusName} - {campus.CampusLocation}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Ruangan"
                value={newInstall.room}
                onChange={(e) => setNewInstall({ ...newInstall, room: e.target.value })}
                className="border px-4 py-2 rounded-md"
              />
              <input
                type="date"
                placeholder="Tanggal Pasang"
                value={newInstall.tanggalPasang}
                onChange={(e) => setNewInstall({ ...newInstall, tanggalPasang: e.target.value })}
                className="border px-4 py-2 rounded-md"
              />
              <input
                type="number"
                min="1"
                placeholder="Kuantitas"
                value={newInstall.kuantitas}
                onChange={(e) => setNewInstall({ ...newInstall, kuantitas: e.target.value })}
                className="border px-4 py-2 rounded-md"
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsAddInstallModalOpen(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded-md"
              >
                Batal
              </button>
              <button
                onClick={async () => {
                  const { namaBarang, campusId, room, tanggalPasang, kuantitas } = newInstall;
                  if (!namaBarang || !campusId || !room || !tanggalPasang || !kuantitas) {
                    Swal.fire("Peringatan", "Semua field wajib diisi!", "warning");
                    return;
                  }

                  try {
                    await createUsage({
                      inventory_id: parseInt(namaBarang),
                      campus_id: parseInt(campusId),
                      room: room,
                      amount: kuantitas,
                      installation_date: tanggalPasang, // tidak dipakai, tapi kirim tetap aman
                    });

                    Swal.fire("Berhasil", "Data pemasangan berhasil ditambahkan!", "success");
                    setNewInstall({
                      namaBarang: "",
                      campusId: "",
                      room: "",
                      tanggalPasang: "",
                      kuantitas: "",
                    });
                    setIsAddInstallModalOpen(false);
                    fetchUsages();
                  } catch (error) {
                    Swal.fire("Gagal", error?.warning || "Gagal menambahkan pemasangan", "error");
                  }
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded-md"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* modal edit */}
      {isEditModalOpen && editData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
            <h2 className="text-lg font-bold mb-4">Edit Pemasangan</h2>
            <div className="flex flex-col gap-4">
              <span>Room</span>
              <input
                type="text"
                value={editData.Room}
                onChange={(e) => setEditData({ ...editData, Room: e.target.value })}
                className="border px-4 py-2 rounded-md"
                placeholder="Ruangan"
              />
              <span>Quantity</span>
              <input
                type="number"
                value={editData.Amount}
                onChange={(e) => setEditData({ ...editData, Amount: e.target.value })}
                className="border px-4 py-2 rounded-md"
                placeholder="Kuantitas"
              />
              <span>Tanggal Pasang</span>
              <input
                type="date"
                value={editData.InstallationDate ? new Date(editData.InstallationDate).toISOString().split("T")[0] : ""}
                onChange={(e) => setEditData({ ...editData, InstallationDate: e.target.value })}
                className="border px-4 py-2 rounded-md"
              />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded-md"
              >
                Batal
              </button>
              <button
                onClick={async () => {
                  try {
                    await updateUsage(editData.ID, {
                      room: editData.Room,
                      amount: editData.Amount,
                      installation_date: editData.InstallationDate, // kirim tanggal yang diubah
                    });
                    Swal.fire("Berhasil", "Data berhasil diperbarui", "success");
                    setIsEditModalOpen(false);
                    fetchUsages();
                  } catch (error) {
                    Swal.fire("Gagal", error?.message || "Gagal memperbarui", "error");
                  }
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded-md"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Usage;