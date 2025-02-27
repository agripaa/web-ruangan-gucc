package models

import (
	"gorm.io/gorm"
	"time"

)

type Summary struct {
	ID			uint		`gorm:"primaryKey"`
	ReportID  	uint      	`gorm:"uniqueIndex" json:"report_id"`
	AdminID		uint		`gorm:"not null" json:"admin_id"`
	Summary		string		`gorm:"not null" json:"summary"` 
	CreatedAt time.Time 	`json:"created_at"`
}

func (Summary) TableName() string {
	return "report_summaries"
}

func MigrateSummary(db *gorm.DB) {
	db.AutoMigrate(&Summary{})
}