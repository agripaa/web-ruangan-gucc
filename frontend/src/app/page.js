"use client";
import Image from "next/image";
import '@/style/homepage.css';
import Logo from '@/assets/Universitas Gunadarma.png';
import Search from '@/assets/Search.png';
import Plus from '@/assets/Plus.png';
import Back from '@/assets/Back.png';
import Arrow from '@/assets/room-arrow.png';
import Time from '@/assets/time.png';
import React, { useEffect, useState } from "react";
import ProgressBar from "@/components/progressBar";
import { getAllReport } from "../services/report";

export default function Home() {
  const [reports, setReports] = useState([]);

  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    async function fetchReports() {
      try {
        const data = await getAllReport();
        setReports(data);
      } catch (error) {
        console.error("Error fetching reports:", error);
      }
    }
    fetchReports();
  }, []);

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
          {reports.map((report) => (
          <li key={report.id}>
            <strong>Token:</strong> {report.token} - <strong>Status:</strong> {report.status}
          </li>
        ))}
        </div>

        <div className="search-container">
          <h3 className="search-title">Lacak Pengaduan</h3>

          <div className="search-create">
            <div className="search-bar">
              <div className="search-input">
                <Image src={Search} className="search-icon" width={15} height={15} alt=""/>
                <input type="text" placeholder="Masukkan nomor pengaduan"></input>
              </div>
              <button>Lacak</button>
            </div>

            <button className="form-create" onClick={() => setIsOpen(true)}>
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
          <form>
            <div className="form-name">
              <label >Nama lengkap *</label>
              <input type="text" placeholder="Full name"></input>
            </div>

            <div className="form-phone">
              <label >Nomor telepon *</label>
              <input type="text" placeholder="Phone number"></input>
            </div>

            <div className="location-container">
              <div className="form-location">
                <label>Kampus *</label>
                <input list="location" id="kampus" name="kampus" placeholder="Masukkan Kampus"></input>
                <datalist id="location">
                  <option value="Kampus D Margonda"></option>
                  <option value="Kampus E Kelapa Dua"></option>
                  <option value="Kampus G Kelapa Dua"></option>
                  <option value="Kampus H Kelapa Dua"></option>
                  <option value="Kampus J1 Kalimalang"></option>
                </datalist>
              </div>

              <div className="form-room">
                <label>Ruangan *
                <Image src={Arrow} className="arrow-icon" width={10} height={10} alt=""/>
                </label>
                <input type="text" placeholder="Job location"></input>
              </div>
            </div>

            <div className="desc">
              <label>Deskripsi *</label>
              <textarea placeholder="Type here"></textarea>
            </div>

            <div className="modal-footer">
              <div className="submit">
                <button>Kirim Pengaduan</button>
                <p>
                  Teknisi kami siap membantu! Kirim pengaduan sekarang,
                  dan kami akan segera menuju lokasi Anda.
                </p>
              </div>
            </div>
          </form>
        </div>
        </div>
        )
        }
      </section>
      <ProgressBar currentStep={4} />

      <div className="history">
        <h1>Riwayat Pengaduan</h1>
        <div className="room-histories">
          <div className="rooms">

            <div className="room-content">
              <div className="room-detail">
                <h1>Ruangan: D421</h1>
                <div className="room-status">
                  <Image src={Time} className="time-icon" width={13} height={13} alt="Dalam Proses"/>
                  <p>Dalam Proses</p>
                </div>
              </div>
              <div className="room-token">
                <h2>Nomor Pengaduan. 234hjk2xf8n</h2>
              </div>    
            </div>
            <h2>17/01/2025</h2>
          </div>

          <div className="rooms">

            <div className="room-content">
              <div className="room-detail">
                <h1>Ruangan: D244</h1>
                <div className="room-status">
                  <Image src={Time} className="time-icon" width={13} height={13} alt="Dalam Proses"/>
                  <p>Selesai</p>
                </div>
              </div>
              <div className="room-token">
                <h2>Nomor Pengaduan. 234hjk2xf8n</h2>
              </div>    
            </div>
            <h2>17/01/2025</h2>
          </div>

          
        </div>
      </div>
    </div>
    
  );
}
