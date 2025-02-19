package models

import "gorm.io/gorm"

type Room struct {
	ID         uint   `gorm:"primaryKey"`
	NameRoom   string `gorm:"type:varchar(50);not null"`
	NumberRoom string `gorm:"type:varchar(25);not null"`
}

func MigrateRooms(db *gorm.DB) {
	db.AutoMigrate(&Room{})
}
