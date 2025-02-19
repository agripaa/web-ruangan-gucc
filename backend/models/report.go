package models

import "gorm.io/gorm"

type Report struct {
	ID          uint   `gorm:"primaryKey"`
	Token       string `gorm:"type:varchar(50); not null"`
	Username    string `gorm:"type:varchar(125);not null"`
	PhoneNumber string `gorm:"type:varchar(25);not null"`
	Room        string `gorm:"type:varchar(25);not null"`
	CampusID    uint   `gorm:"not null"`
	Status      string `gorm:"type:enum('pending','on the way','in progress','done');default:'pending'"`
	Description string `gorm:"type:text"`
	ReportedAt  string `gorm:"type:datetime"`
	UpdatedAt   string `gorm:"type:datetime"`
	Campus      Campus `gorm:"foreignKey:CampusID"`
}

func MigrateReports(db *gorm.DB) {
	db.AutoMigrate(&Report{})
}
