package models

import (
	"time"

	"gorm.io/gorm"
)

type Report struct {
	ID          uint      `gorm:"primaryKey"`
	Token       string    `gorm:"type:varchar(50); not null" json:"token"`
	Username    string    `gorm:"type:varchar(125);not null" json:"username"`
	PhoneNumber string    `gorm:"type:varchar(25);not null" json:"phone_number"`
	Room        string    `gorm:"type:varchar(25);not null" json:"room"`
	CampusID    uint      `gorm:"not null" json:"campus_id"`
	WorkerID    *uint     `gorm:"default:null" json:"admin_id"` // Foreign key to User
	Status      string    `gorm:"type:status_enum;not null;default:'pending'" json:"status"`
	Description string    `gorm:"type:text" json:"description"`
	ReportedAt  time.Time `gorm:"type:timestamp" json:"reported_at"`
	UpdatedAt   time.Time `gorm:"type:timestamp" json:"updated_at"`
	Campus      Campus    `gorm:"foreignKey:CampusID"`
	Worker      User     `gorm:"foreignKey:WorkerID" json:"worker"` // Relasi ke User
}

func MigrateReports(db *gorm.DB) {
	db.Exec(`DO $$ 
	BEGIN 
		IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_enum') THEN
			CREATE TYPE status_enum AS ENUM ('pending', 'on the way', 'in progress', 'done');
		END IF;
	END $$;`)
	db.Exec("DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reports' AND column_name='worker_id') THEN ALTER TABLE reports ADD COLUMN worker_id INTEGER NULL; END IF; END $$;")
	db.AutoMigrate(&Report{})
}
