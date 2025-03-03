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
