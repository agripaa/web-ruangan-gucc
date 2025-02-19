package models

import "gorm.io/gorm"

type Campus struct {
	ID             uint   `gorm:"primaryKey"`
	CampusName     string `gorm:"type:varchar(255);not null"`
	CampusLocation string `gorm:"type:varchar(255);not null"`
}

func MigrateCampus(db *gorm.DB) {
	db.AutoMigrate(&Campus{})
}
