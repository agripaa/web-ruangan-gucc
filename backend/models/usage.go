package models

import (
	"time"

	"gorm.io/gorm"
)

type Usage struct {
	ID               uint      `gorm:"primaryKey"`
	InventoryID      uint      `gorm:"not null" json:"inventory_id"`
	CampusID         uint      `gorm:"not null" json:"campus_id"`
	Room             string    `gorm:"type:varchar(255);not null"`
	Amount           string    `gorm:"type:varchar(255);not null"`
	InstallationDate time.Time `gorm:"type:timestamp;not null"`

	Inventory Inventory `gorm:"foreignKey:InventoryID"`
	Campus    Campus    `gorm:"foreignKey:CampusID"`
}

func MigrateUsage(db *gorm.DB) {
	db.AutoMigrate(&Usage{})
}
