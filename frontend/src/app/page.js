import Image from "next/image";
import '@/style/homepage.css'
import Logo from '@/assets/Universitas Gunadarma.png'
export default function Home() {
  return (
    <div className="main-container">
      <div className="title-logo">
        <Image src={Logo} className="logo-UG" width={30} height={30} />
        <p>UG Network Assistance</p>
      </div>
      
      <section>
        <div className="welcome">
          <h1>Selamat Siang!</h1>
          <p>Kami siap membantu kapan saja dan dimana saja!</p>
        </div>

        <main>
          <form>
            <div className="form-name">
              <label for="name">Nama lengkap *</label>
              <input type="text" placeholder="Full name"></input>
            </div>

            <div className="form-phone">
              <label for="phone">Nomor telepon *</label>
              <input type="text" placeholder="Phone number"></input>
            </div>

            <div className="form-location">
              <label for="kampus">Kampus *</label>
              <input list="location" id="kampus" name="kampus"></input>
              <datalist id="location">
                <option value="Kampus D Margonda"></option>
                <option value="Kampus E Kelapa Dua"></option>
                <option value="Kampus G Kelapa Dua"></option>
                <option value="Kampus H Kelapa Dua"></option>
                <option value="Kampus J1 Kalimalang"></option>
              </datalist>
            </div>

            <div className="form-room">
              <label for="room">Ruangan *</label>
              <input type="text" placeholder="Job location"></input>
            </div>

            <div className="desc">
              <label for="description">Deskripsi *</label>
              <textarea placeholder="Type here"></textarea>
            </div>

          <div className="footer">
            <div className="submit">
              <button>Kirim Pengaduan</button>
              <p>
                Teknisi kami siap membantu! Kirim pengaduan sekarang,
                dan kami akan segera menuju lokasi Anda.
              </p>
            </div>
          </div>

          </form>

          <div className="track">
            <div className="track-search">
              <label for="tracking">Lacak Pengaduan</label>
              <input type="text" placeholder="Masukkan nomor pengaduan"></input>
              <button className="tracking-submit">Lacak</button>
            </div>
            
            <div className="track-icon">
              ICON
            </div>

            <div className="track-history">
              <h2>Riwayat Pengaduan</h2>
              <div className="history-list">
                a, b , c
              </div>
            </div>
          </div>
        </main>
      </section>
    </div>
    
  );
}
