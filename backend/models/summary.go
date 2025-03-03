package models

import (
	"time"

	"gorm.io/gorm"
)

type Summary struct {
	ID        uint      `gorm:"primaryKey"`
	ReportID  uint      `gorm:"not null" json:"report_id"`
	WorkerID  uint      `gorm:"not null" json:"admin_id"`
	Summary   string    `gorm:"not null" json:"summary"`
	CreatedAt time.Time `json:"created_at"`

	Worker    *User     	`gorm:"foreignKey:WorkerID" json:"worker"`
	Report    Report    `gorm:"foreignKey:ReportID" json:"report"`
}

func (Summary) TableName() string {
	return "report_summaries"
}

func MigrateSummary(db *gorm.DB) {
	db.AutoMigrate(&Summary{})
}
