package seeders

import (
	"backend/models"
	"log"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func SeedAdmin(db *gorm.DB) {
	// Cek apakah admin sudah ada
	var admin models.User
	if err := db.Where("username = ?", "admingucc").First(&admin).Error; err == nil {
		log.Println("Admin admingucc already exists, skipping seeding.")
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte("sendalgucc"), bcrypt.DefaultCost)
	if err != nil {
		log.Fatalf("Failed to hash admin password: %v", err)
	}

	// Buat user admin
	newAdmin := models.User{
		Username:    "admingucc",
		Password:    string(hashedPassword),
		PhoneNumber: "081234567890",
		Role:        "admin",
	}

	// Simpan ke DB
	if err := db.Create(&newAdmin).Error; err != nil {
		log.Fatalf("Failed to create admin user: %v", err)
	}

	log.Println("Admin user admingucc successfully seeded.")
}
