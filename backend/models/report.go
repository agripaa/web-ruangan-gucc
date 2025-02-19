package models

import "gorm.io/gorm"

type Report struct {
	ID          uint   `gorm:"primaryKey"`
	Token       string `gorm:"type:varchar(50); not null"`
	Username    string `gorm:"type:varchar(125);not null"`
	PhoneNumber string `gorm:"type:varchar(25);not null"`
	Room        string `gorm:"type:varchar(25);not null"`
	CampusID    uint   `gorm:"not null"`
	Status      string `gorm:"type:status_enum;not null;default:'pending'"`
	Description string `gorm:"type:text"`
	ReportedAt  string `gorm:"type:timestamp"`
	UpdatedAt   string `gorm:"type:timestamp"`
	Campus      Campus `gorm:"foreignKey:CampusID"`
}

func MigrateReports(db *gorm.DB) {
	db.Exec(`DO $$
	BEGIN
		IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_enum') THEN
			CREATE TYPE status_enum AS ENUM ('pending', 'on the way', 'in progress', 'done');
		ELSE
			ALTER TYPE status_enum ADD VALUE IF NOT EXISTS 'on the way';
		END IF;
	END $$;`)
	db.Exec("DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reports' AND column_name='reported_at') THEN ALTER TABLE reports ADD COLUMN reported_at TIMESTAMP; END IF; END $$;")
	db.Exec("DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reports' AND column_name='updated_at') THEN ALTER TABLE reports ADD COLUMN updated_at TIMESTAMP; END IF; END $$;")
	db.AutoMigrate(&Report{})
}
