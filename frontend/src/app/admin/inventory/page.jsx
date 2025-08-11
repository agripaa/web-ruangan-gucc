"use client";
import React, { useEffect, useState } from "react";
import {
  getInventoriesPaginated,
  createInventory,
  updateInventory,
  deleteInventory,
  getInventoryById,
} from "../../../services/inventory";
import { FaSortUp, FaSortDown } from "react-icons/fa";
import { IoDocumentTextOutline } from "react-icons/io5";
import Swal from "sweetalert2";

const statusOptions = [
  { label: "Semua Status", value: "" },
  { label: "Normal", value: "normal" },
  { label: "Rusak", value: "rusak" },
];

const Inventory = () => {
  const [stocks, setStocks] = useState([]);
  const [sortedStocks, setSortedStocks] = useState("")
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStock, setNewStock] = useState({
    nama: "",
    quantity: "",
    type: "qty",
    status: "normal",
  });
  const [totalPages, setTotalPages] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: "name", direction: "asc" });

  useEffect(() => {
    fetchStocks();
  }, [currentPage, sortConfig, searchQuery, selectedStatus]);

 const fetchStocks = async () => {
  try {
    const data = await getInventoriesPaginated(
      currentPage,
      10,
      sortConfig.key,
      sortConfig.direction,
      searchQuery,
      selectedStatus
    );

    setStocks(data.data); // data.data berisi array inventories
    setTotalPages(data.total_pages || 1);
  } catch (error) {
    console.error("Gagal ambil data inventories:", error);
    Swal.fire("Gagal", "Gagal mengambil data inventaris", "error");
  }
};


  const statusOrder = { "normal": 1, "rusak": 2 };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") {
        fetchStocks();
    }
};

const handleDeleteStock = async (id) => {
  const confirm = await Swal.fire({
    title: "Yakin ingin menghapus?",
    text: "Data yang dihapus tidak bisa dikembalikan.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Ya, hapus!",
    cancelButtonText: "Batal",
  });

  if (confirm.isConfirmed) {
    try {
      await deleteInventory(id);
      Swal.fire("Berhasil", "Data berhasil dihapus", "success");
      fetchStocks(); // refresh table
    } catch (error) {
      console.error(error);
      Swal.fire("Gagal", "Gagal menghapus data", "error");
    }
  }
};

const handleSaveStock = async () => {
  if (!newStock.nama || !newStock.quantity) {
    Swal.fire("Peringatan", "Nama barang dan jumlah wajib diisi", "warning");
    return;
  }

  const payload = {
    name: newStock.nama,
    amount: newStock.quantity,
    type: newStock.type,
    status: newStock.status,
  };

  try {
    if (isEditing) {
      await updateInventory(editId, payload);
      Swal.fire("Berhasil", "Stok berhasil diperbarui", "success");
    } else {
      await createInventory(payload);
      Swal.fire("Berhasil", "Stok berhasil ditambahkan", "success");
    }

    setNewStock({ nama: "", quantity: "", type: "qty", status: "normal" });
    setIsEditing(false);
    setEditId(null);
    setIsModalOpen(false);
    fetchStocks();
  } catch (error) {
    console.error(error);
    Swal.fire("Gagal", "Gagal menyimpan stok", "error");
  }
};

const openEditModal = (item) => {
  setIsEditing(true);
  setEditId(item.ID);
  setNewStock({
    nama: item.Name,
    quantity: item.Amount,
    type: item.Type,
    status: item.Status,
  });
  setIsModalOpen(true);
};

const openCreateModal = () => {
  setIsEditing(false);
  setEditId(null);
  setNewStock({
    nama: "",
    quantity: "",
    type: "qty",
    status: "normal",
  });
  setIsModalOpen(true);
};



  return (
    <div>
      {/* Lists Pengaduan Header */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center">
          <div className="flex justify-center p-3 shrink-0 bg-[#F6F6F6] rounded-xl mr-4">
            <IoDocumentTextOutline className="text-gray-600 text-2xl" />
          </div>
          <h2 className="text-md font-normal">Inventory</h2>
        </div>

        {/* Download data */}
        {/* <div className="flex items-center gap-2">
          <button onClick={() => downloadExcel(selectedMonth, selectedYear)} className="text-white w-24 bg-green-600 hover:bg-green-800 mx-2 py-2 px-4 font-semibold rounded-xl">Excel</button>
          <button onClick={() => downloadPDF(selectedMonth, selectedYear)} className="text-white w-24 bg-red-600 hover:bg-red-800 mx-2 py-2 px-4 font-semibold rounded-xl">Pdf</button>
        </div> */}

        {/* Filter  */}
        <div className="flex items-center gap-2">
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
          <div className="flex items-center gap-3">
           <button
              onClick={openCreateModal}
              className="bg-green-500 text-white text-md px-3 py-2 rounded-md"
            >
              Tambah Stock
            </button>

          </div>
        </div>
      </div>

      {/* Table */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full border-collapse shadow-md">
          <thead>
            <tr className="bg-[#3C64FF] text-white">
              <th className="p-3 text-center cursor-pointer" onClick={() => {handleSort("name");}}>
                <span className="inline-flex items-center gap-3">
                  Nama Barang
                  <div className="flex flex-col">
                    <FaSortUp className={`w-3 h-3 ${sortConfig.key === "name" && sortConfig.direction === "asc" ? "text-white" : "text-gray-400"}`} />
                    <FaSortDown className={`w-3 h-3 ${sortConfig.key === "name" && sortConfig.direction === "desc" ? "text-white" : "text-gray-400"}`} />
                  </div>
                </span>
              </th>
              <th className="p-3 text-center">Quantity</th>
              <th className="p-3 text-center cursor-pointer" onClick={() => handleSort("status")}>
                <span className="inline-flex items-center gap-3">
                  Status
                  <div className="flex flex-col">
                    <FaSortUp className={`w-3 h-3 ${sortConfig.key === "status" && sortConfig.direction === "asc" ? "text-white" : "text-gray-400"}`} />
                    <FaSortDown className={`w-3 h-3 ${sortConfig.key === "status" && sortConfig.direction === "desc" ? "text-white" : "text-gray-400"}`} />
                  </div>
                </span>
              </th>
              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {stocks && stocks.length > 0 ? (
              stocks.map((item) => (
                <tr key={item.ID} className="border-b">
                  <td className="p-3 text-center">{item.Name}</td>
                  <td className="p-3 text-center">
                    {item.Type === "qty" ? item.Amount : `${item.Amount} ${item.Type}`}
                  </td>
                  <td className="p-3 text-center capitalize">{item.Status}</td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => openEditModal(item)}
                      className="bg-blue-500 text-white px-3 mx-1 py-1 rounded-md"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteStock(item.ID)}
                      className="bg-red-500 text-white px-3 mx-1 py-1 rounded-md"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="p-3 text-center text-gray-500">Tidak ada data</td>
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

      {/* Modal create stock */}
      {isModalOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
      <h2 className="text-lg font-bold mb-4">
        {isEditing ? "Edit Stok" : "Tambah Stok Baru"}
      </h2>

      <div className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Nama Barang"
          value={newStock.nama}
          onChange={(e) => setNewStock({ ...newStock, nama: e.target.value })}
          className="border px-4 py-2 rounded-md"
        />
        <input
          type="number"
          placeholder="Kuantitas"
          value={newStock.quantity}
          onChange={(e) => setNewStock({ ...newStock, quantity: e.target.value })}
          className="border px-4 py-2 rounded-md"
        />
        <select
          value={newStock.type}
          onChange={(e) => setNewStock({ ...newStock, type: e.target.value })}
          className="border px-4 py-2 rounded-md"
        >
          <option value="qty">Qty</option>
          <option value="meter">Meter</option>
        </select>
        <select
          value={newStock.status}
          onChange={(e) => setNewStock({ ...newStock, status: e.target.value })}
          className="border px-4 py-2 rounded-md"
        >
          <option value="normal">Normal</option>
          <option value="rusak">Rusak</option>
        </select>
      </div>


      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={() => setIsModalOpen(false)}
          className="bg-gray-400 text-white px-4 py-2 rounded-md"
        >
          Batal
        </button>
        <button
          onClick={handleSaveStock}
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

export default Inventory;