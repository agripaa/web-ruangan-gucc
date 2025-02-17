package models

import "gorm.io/gorm"

type Report struct {
	ID          uint   `gorm:"primaryKey"`
	Username    string `gorm:"type:varchar(125);not null"`
	PhoneNumber string `gorm:"type:varchar(25);not null"`
	RoomID      uint   `gorm:"not null"`
	Status      string `gorm:"type:status_enum;not null;default:'pending'"` // ENUM PostgreSQL
	Constraint  string `gorm:"type:text"`

	Room Room `gorm:"foreignKey:RoomID"`
}

func MigrateReports(db *gorm.DB) {
	db.Exec("CREATE TYPE status_enum AS ENUM ('pending', 'in progress', 'done');")
	db.AutoMigrate(&Report{})
}
