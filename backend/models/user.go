package models

import "gorm.io/gorm"

type User struct {
	ID          uint   `gorm:"primaryKey"`
	Username    string `gorm:"type:varchar(50);unique;not null"`
	Password    string `gorm:"type:varchar(255);not null"`
	PhoneNumber string `gorm:"type:varchar(255);not null"`
	Role        string `gorm:"type:varchar(255);not null"`
}

func MigrateUsers(db *gorm.DB) {
	db.AutoMigrate(&User{})
}
