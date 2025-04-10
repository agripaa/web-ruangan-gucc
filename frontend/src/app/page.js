"use client";
import Image from "next/image";
import '../style/homepage.css';
import Logo from '../assets/Universitas Gunadarma.png';
import Search from '../assets/Search.png';
import Plus from '../assets/Plus.png';
import Back from '../assets/Back.png';
import notrack from '../assets/no-tracks.png';
import React, { useEffect, useState } from "react";
import ProgressBar from "../components/progressBar";
import RoomStatus from "../components/roomStatus";
import { getCampuses } from "../services/campus";
import { getAllReport, createReport, getReportByToken } from "../services/reports";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

export default function Home() {
  const [reports, setReports] = useState([]);
  const [campuses, setCampuses] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [reportToken, setReportToken] = useState(null);
  const [progressStep, setProgressStep] = useState(0);
  const [searchToken, setSearchToken] = useState("");
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const router = useRouter();

  const statusMapping = {
    pending: 1,
    "on the way": 2,
    "in progress": 3,
    done: 4,
  };


  const [formData, setFormData] = useState({
    username: "",
    phone_number: "",
    campus_id: "",
    room: "",
    description: "",
  });

  async function fetchReports() {
    try {
      const data = await getAllReport(
        currentPage, 
        4
      );
      setReports(data.data);  
      setTotalPages(data.total_pages);
      console.log("test", data)
    } catch (error) {
      console.error("Error fetching reports:", error);
      if([400, 401, 402, 403].includes(error.status)){
        router.push('/login')
      }
    }
  }

  useEffect(() => {

    fetchCampuses();
    fetchReports();
    // const interval = setInterval(fetchReports, 5000); 

    // return () => clearInterval(interval);
    
  }, [currentPage]);

  const fetchCampuses = async () => {
    try {
      const data = await getCampuses();
      setCampuses(data || []);
    } catch (error) {
      console.error("Error fetching campuses:", error);
      if([400, 401, 402, 403].includes(error.status)){
        router.push('/login')
      }
    }
  };

  useEffect(() => {
    fetchCampuses();
    fetchReports();
    const interval = setInterval(fetchReports, 5000); 

    return () => clearInterval(interval);
    
  }, []);

  const handleSearch = async () => {
    if (!searchToken.trim()) return;

    try {
      const result = await getReportByToken(searchToken);
      if (result.data.length > 0) {
        setProgressStep(statusMapping[result.data[0].status] || 0);
      } else {
        setProgressStep(-1);
      }
    } catch (error) {
      console.error("Error searching report:", error);
      if([400, 401, 402, 403].includes(error.status)){
        router.push('/login')
      }
      setProgressStep(-1);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "campus_id" ? parseInt(value, 10) || "" : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username || !formData.phone_number || !formData.campus_id || !formData.room || !formData.description) {
      alert("Semua field wajib diisi!");
      return;
    }

    try {
      const response = await createReport(formData);

      // Simpan token laporan
      setReportToken(response.token);

      // Kosongkan form setelah pengiriman
      setFormData({
        username: "",
        phone_number: "",
        campus_id: "",
        room: "",
        description: "",
      });

      Swal.fire({
        title: "Success",
        html: `<h2>Success to submit report!</h2>
        <p>Harap Simpan Nomor Pengaduan: <strong>${response.token}</strong></p>`,
        icon: "success"
      });
      
      fetchReports(); 
      setIsOpen(false)

      // fetchReports();
    } catch (error) {
      Swal.fire("Error", "Failed to submit report!", "error");
      if([400, 401, 402, 403].includes(error.status)){
        router.push('/login')
      }
      return error
    }
  };  

  

  return (
    <div className="main-container">
      <div className="title-logo">
        <Image src={Logo} className="logo-UG" width={30} height={30} alt="" />
        <p>UG Network Assistance</p>
      </div>
      
      <section>
        <div className="welcome">
          <h1>Selamat Siang!</h1>
          <p>Kami siap membantu kapan saja dan dimana saja!</p>
        </div>

        <div className="search-container">
          <h3 className="search-title">Lacak Pengaduan</h3>

          <div className="search-create">
          <div className="search-bar">
              <div className="search-input">
                <Image src={Search} className="search-icon" width={15} height={15} alt=""/>
                <input 
                  type="text" 
                  placeholder="Masukkan nomor pengaduan"
                  value={searchToken}
                  onChange={(e) => setSearchToken(e.target.value)}
                />
              </div>
              <button onClick={handleSearch}>Lacak</button>
            </div>
            <button className="form-create" onClick={() => {
              setIsOpen(true);
              setReportToken(null); // Reset token saat membuka modal
            }}>
              <h3>Buat pengaduan</h3>
              <Image src={Plus} className="plus-icon" width={30} height={30} alt="" /> 
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="overlay" onClick={() => setIsOpen(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-title">
                <Image src={Back} className="back-icon" width={30} height={30} alt="" onClick={() => setIsOpen(false)}/>
                <h1>Form Pengaduan</h1>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-name">
                  <label>Nama lengkap *</label>
                  <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="Full name" required />
                </div>

                <div className="form-phone">
                  <label>Nomor telepon *</label>
                  <input type="text" name="phone_number" value={formData.phone_number} onChange={handleChange} placeholder="Phone number" required />
                </div>

                <div className="location-container">
                  <div className="form-location">
                    <label>Kampus *</label>
                    <select name="campus_id" value={formData.campus_id} onChange={handleChange} required>
                      <option value="">Pilih Kampus</option>
                      {campuses.map((campus) => (
                        <option key={campus.ID} value={campus.ID}>
                          {campus.CampusName} - {campus.CampusLocation}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-room">
                    <label>Ruangan *</label>
                    <input type="text" name="room" value={formData.room} onChange={handleChange} placeholder="Ruangan" required />
                  </div>
                </div>

                <div className="desc">
                  <label>Deskripsi *</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Deskripsikan masalah Anda" required></textarea>
                </div>

                <div className="modal-footer">
                  <div className="submit">
                    <button type="submit">Kirim Pengaduan</button>
                    {reportToken ? (
                      <h2 className="text-[#787878] text-md font-normal italic">
                        Nomor Pengaduan. {reportToken}
                      </h2>
                    ) : (
                      <p>Teknisi kami siap membantu! Kirim pengaduan sekarang, dan kami akan segera menuju lokasi Anda.</p>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </section>
      
      <div className="progress-container flex justify-center items-center my-10">
        {progressStep !== 0 ? (
          <ProgressBar currentStep={progressStep} />
        ) : (
          <div className="no-tracking justify-center">
            <Image src={notrack} alt="Tidak ada pencarian" width={200} height={200} />
          </div>
        )}
      </div>

      <div className="history">
        <h1>Riwayat Pengaduan</h1>
        {/* <pre>{JSON.stringify(reports, null, 2)}</pre> */}
        <div className="room-histories">
          {reports.map((report) => (            
            <div className="rooms" key={`${report.ID}-${report.updated_at}`}>
              <div className="room-content">
                <div className="room-detail">
                  <h1>Ruangan: {report.room}</h1>
                  <div className="room-status">
                  <RoomStatus key={`status-${report.ID}`} initialStatus={report.status}/>
                  </div>
                </div>
                <div className="room-token">
                  <h2>Nomor Pengaduan: {report.token}</h2>
                </div>    
              </div>
              <h2 className="room-date">{new Date(report.updated_at).toLocaleDateString()}</h2>
            </div>
          ))}
        </div>
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
}