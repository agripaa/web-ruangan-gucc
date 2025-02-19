package models

import "gorm.io/gorm"

type Role struct {
	ID         uint   `gorm:"primaryKey"`
	RoleName   string `gorm:"type:varchar(255);not null"`
	Permission string `gorm:"type:text;not null"`
}

func MigrateRoles(db *gorm.DB) {
	db.AutoMigrate(&Role{})
}
