package models

import "gorm.io/gorm"

type ActivityLog struct {
	ID             uint   `gorm:"primaryKey"`
	Action         string `gorm:"type:varchar(50);not null"`
	DetailAction   string `gorm:"type:varchar(125);not null"`
	TargetReportID uint   `gorm:"not null"`
	UserID         *uint  `gorm:"foreignKey:UserID"`
	Timestamp      string `gorm:"default:CURRENT_TIMESTAMP"`

	User   User   `gorm:"foreignKey:UserID"`
	Report Report `gorm:"foreignKey:TargetReportID"`
}

func MigrateActivityLogs(db *gorm.DB) {
	db.AutoMigrate(&ActivityLog{})
}
