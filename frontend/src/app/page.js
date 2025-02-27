"use client";
import Image from "next/image";
import '@/style/homepage.css';
import Logo from '@/assets/Universitas Gunadarma.png';
import Search from '@/assets/Search.png';
import Plus from '@/assets/Plus.png';
import Back from '@/assets/Back.png';
import Time from '@/assets/time.png';
import notrack from '@/assets/no-tracks.png';
import React, { useEffect, useState } from "react";
import ProgressBar from "@/components/progressBar";
import RoomStatus from "@/components/roomStatus";
import { getCampuses } from "@/services/campus";
import { getAllReport, createReport, getReportByToken } from "@/services/reports";

export default function Home() {
  const [reports, setReports] = useState([]);
  const [campuses, setCampuses] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [reportToken, setReportToken] = useState(null);
  const [progressStep, setProgressStep] = useState(0);
  const [searchToken, setSearchToken] = useState("");
  const [statusProgress, setStatusProgress] = useState(0)

  const [forceRender, setForceRender] = useState(0);
  

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

  useEffect(() => {
    async function fetchReports() {
      try {
        const data = await getAllReport();
        console.log("Data terbaru dari API:", data);
        setReports([...data]);
      } catch (error) {
        console.error("Error fetching reports:", error);
      }
    }

    fetchCampuses();
    fetchReports();
    const interval = setInterval(fetchReports, 5000); 

    return () => clearInterval(interval);
    
  }, []);

  const fetchCampuses = async () => {
    try {
      const data = await getCampuses();
      setCampuses(data || []);
    } catch (error) {
      console.error("Error fetching campuses:", error);
    }
  };

  const handleSearch = async () => {
    if (!searchToken.trim()) return;

    try {
      const result = await getReportByToken(searchToken);
      if (result.length > 0) {
        setProgressStep(statusMapping[result[0].status] || 0);
      } else {
        setProgressStep(-1);
      }
    } catch (error) {
      console.error("Error searching report:", error);
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

      // Refresh riwayat laporan
      const data = await getAllReport();
      setReports(data);
    } catch (error) {
      alert("Gagal mengirim laporan!");
      console.error("Error creating report:", error);
    }

    const reportsReducer = (state, action) => {
      switch (action.type) {
        case "SET_REPORTS":
          return [...action.payload]; // Paksa perubahan state
        default:
          return state;
      }
    };
    
    const [reports, dispatch] = useReducer(reportsReducer, []);
    

    const refreshReports = async () => {
      const data = await getAllReport();
      console.log("🔹 Data terbaru dari API:", data);
      setReports([...data]); // Paksa perubahan state
      setForceRender(forceRender + 1); // Paksa re-render
    };

    useEffect(() => {
      refreshReports();
    }, [forceRender]);
    
    const getAllReport = async () => {
      const response = await fetch(`/api/reports?timestamp=${new Date().getTime()}`, {
        cache: "no-store",
      });
      return response.json();
    };
    

    useEffect(() => {
  console.log("🔄 State reports diperbarui:", reports);
}, [reports]);
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
    </div>
  );
}