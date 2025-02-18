package models

import "gorm.io/gorm"

type Report struct {
	ID          uint   `gorm:"primaryKey"`
	Username    string `gorm:"type:varchar(125);not null" json:"username"`
	PhoneNumber string `gorm:"type:varchar(25);not null" json:"phone_number"`
	RoomID      uint   `gorm:"not null" json:"room_id"`
	Status      string `gorm:"type:status_enum;not null;default:'pending'" json:"status"`
	Constraint  string `gorm:"type:text" json:"constraint"`

	Room Room `gorm:"foreignKey:RoomID"`
}

func MigrateReports(db *gorm.DB) {
	db.Exec(`
		DO $$ 
		BEGIN
			IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_enum') THEN
				CREATE TYPE status_enum AS ENUM ('pending', 'in progress', 'done');
			END IF;
		END $$;
	`)

	db.AutoMigrate(&Report{})
}
