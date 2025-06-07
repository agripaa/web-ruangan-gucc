package seeders

import (
	"backend/models"
	"log"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func SeedUsers(db *gorm.DB) {
	// Cek apakah user test12 sudah ada
	var user models.User
	if err := db.Where("username = ?", "test12").First(&user).Error; err == nil {
		log.Println("User test12 already exists, skipping seeding.")
		return
	}

	// Hash password sebelum menyimpan ke database
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte("test123"), bcrypt.DefaultCost)
	if err != nil {
		log.Fatalf("Failed to hash password: %v", err)
	}

	// Buat user baru
	newUser := models.User{
		Username:    "test12",
		Password:    string(hashedPassword),
		PhoneNumber: "081234567890", // Bisa diganti dengan nomor lain
		Role:        "user",
	}

	// Simpan ke database
	if err := db.Create(&newUser).Error; err != nil {
		log.Fatalf("Failed to create user: %v", err)
	}

	log.Println("User test12 successfully seeded.")
}

func SeedCampuses(db *gorm.DB) {
	var count int64
	db.Model(&models.Campus{}).Count(&count)
	if count > 0 {
		log.Println("Campus data already seeded, skipping.")
		return
	}

	campuses := []models.Campus{
		{CampusName: "Kampus A", CampusLocation: "Jl. Kenari nomor 13, Jakarta Pusat"},
		{CampusName: "Kampus B", CampusLocation: "Jl. Salemba Bluntas, Jakarta Pusat"},
		{CampusName: "Kampus C", CampusLocation: "Jl. Salemba Raya nomor 53, Jakarta Pusat"},
		{CampusName: "Kampus D", CampusLocation: "Jl. Margonda Raya, Pondok Cina, Depok"},
		{CampusName: "Kampus E", CampusLocation: "Jl. Akses Kelapa Dua, Kelapa Dua, Cimanggis, Depok"},
		{CampusName: "Kampus F1", CampusLocation: "Jl. Taman Puspa, Pasir Gunung Selatan, Cimanggis, Depok"},
		{CampusName: "Kampus F2", CampusLocation: "Jl. Taman Puspa, Pasir Gunung Selatan, Cimanggis, Depok"},
		{CampusName: "Kampus F3", CampusLocation: "Jl. Kol. Pol Pranoto No.14b, Tugu, Cimanggis, Depok"},
		{CampusName: "Kampus F4", CampusLocation: "Jl. Raya Jakarta-Bogor No.20, Cisalak Pasar, Cimanggis, Depok"},
		{CampusName: "Kampus F5", CampusLocation: "Gg. Asem No.5, Pondok Cina, Beji, Depok"},
		{CampusName: "Kampus F6", CampusLocation: "Perumahan Taman Puspa, Jl. Taman Puspa, Pasir Gunung Selatan, Cimanggis, Depok"},
		{CampusName: "Kampus F7", CampusLocation: "Jl. Raya Kelapa Dua Wetan No.5a 4, RT.4/RW.8, Kelapa Dua Wetan, Ciracas, Jakarta Timur"},
		{CampusName: "Kampus F8", CampusLocation: "Tugu, Cimanggis, Depok"},
		{CampusName: "Kampus G", CampusLocation: "Jl. Akses Kelapa Dua, Kelapa Dua, Cimanggis"},
		{CampusName: "Kampus H", CampusLocation: "Jl. Akses Kelapa Dua, Kelapa Dua, Cimanggis"},
		{CampusName: "Kampus J", CampusLocation: "Jl. KH. Noer Ali, Kalimalang, Bekasi"},
		{CampusName: "Kampus K", CampusLocation: "Jl. Kelapa Dua Raya No.93, Kelapa Dua, Kecamatan Kelapa Dua, Kabupaten Tangerang"},
		{CampusName: "Kampus L", CampusLocation: "Jl. Ruko Mutiara Palem Raya Blok C7 No.20, RT.7/RW.14, Cengkareng Timur, Cengkareng, Jakarta Barat"},
		{CampusName: "Kampus M", CampusLocation: "Technopark, Mande, Cianjur"},
		{CampusName: "Kampus N", CampusLocation: "Kabupaten Penajam Paser Utara, Kalimantan Timur"},
	}

	if err := db.Create(&campuses).Error; err != nil {
		log.Fatalf("Failed to seed campuses: %v", err)
	}

	log.Println("Gunadarma campuses successfully seeded.")
}
