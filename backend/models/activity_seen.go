package models

import (
	"gorm.io/gorm"
	"time"
)


 type ActivitySeen struct {
	ID		 	uint			`gorm:"primaryKey"`
	UserID	 	uint			`gorm:"not null" json:"user_id"`
	ActivityID	uint			`gorm:"not null" json:"activity_id"`
	IsRead    	bool      		`gorm:"default:false" json:"is_read"`
	CreatedAt 	time.Time 		`json:"created_at"`

	User 		User 			`gorm:"foreignKey:UserID" json:"id"`
	Activity 	ActivityLog		`gorm:"foreignKey:ActivityID" json:"activity"`
 }	

 func MigrateActivitySeen(db *gorm.DB) {
	db.AutoMigrate(&ActivitySeen{})
}