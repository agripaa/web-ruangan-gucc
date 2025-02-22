package models

import "gorm.io/gorm"

type User struct {
	ID          uint     `gorm:"primaryKey"`
	Username    string   `gorm:"type:varchar(50);unique;not null"`
	Password    string   `gorm:"type:varchar(255);not null"`
	PhoneNumber string   `gorm:"type:varchar(255);not null"`
	Role        string   `gorm:"type:varchar(255);not null"`
	Reports     []Report `gorm:"foreignKey:WorkerID"` // Semua laporan yang dikerjakan oleh user
}

func MigrateUsers(db *gorm.DB) {
	db.Exec("DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='phone_number') THEN ALTER TABLE users ADD COLUMN phone_number VARCHAR(255) NOT NULL DEFAULT ''; END IF; END $$;")
	db.Exec("DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='role') THEN ALTER TABLE users ADD COLUMN role VARCHAR(255) NOT NULL DEFAULT 'user'; END IF; END $$;")
	db.AutoMigrate(&User{})
}
