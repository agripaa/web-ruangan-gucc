package models

import "gorm.io/gorm"

type Inventory struct {
	ID     uint    `gorm:"primaryKey"`
	Name   string  `gorm:"type:varchar(225);not null"`
	Amount string  `gorm:"type:varchar(255);not null"`
	Type   string  `gorm:"type:inventory_type;not null"`
	Status string  `gorm:"type:inventory_status;not null"`
	Usages []Usage `gorm:"foreignKey:InventoryID" json:"usages"`
}

func MigrateInventory(db *gorm.DB) {
	db.Exec(`DO $$ BEGIN
		IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'inventory_type') THEN
			CREATE TYPE inventory_type AS ENUM ('qty', 'meter');
		END IF;
	END $$;`)

	db.Exec(`DO $$ BEGIN
		IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'inventory_status') THEN
			CREATE TYPE inventory_status AS ENUM ('rusak', 'normal');
		END IF;
	END $$;`)

	db.AutoMigrate(&Inventory{})
}
