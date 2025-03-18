package handlers

import (
	"backend/config"
	"backend/models"
	"time"

	"github.com/gofiber/fiber/v2"
)

func GetActivityLogs(c *fiber.Ctx) error {
	var logs []models.ActivityLog
	config.DB.Preload("User").Preload("Report").Find(&logs)
	return c.JSON(logs)
}

func GetCreateReportLogs(c *fiber.Ctx) error {
	var logs []models.ActivityLog
	config.DB.Preload("User").Preload("Report").
		Where("type_log = ?", "create report").
		Order("timestamp DESC").
		Limit(15).
		Find(&logs)

	return c.JSON(logs)
}

func GetUpdateReportLogs(c *fiber.Ctx) error {
	var logs []models.ActivityLog
	config.DB.Preload("User").Preload("Report").
		Where("type_log = ?", "update report").
		Order("timestamp DESC").
		Limit(15).
		Find(&logs)

	return c.JSON(logs)
}

func GetActivityLogByID(c *fiber.Ctx) error {
	id := c.Params("id")
	var log models.ActivityLog
	result := config.DB.Preload("User").Preload("Report").First(&log, id)
	if result.Error != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Activity log not found"})
	}
	return c.JSON(log)
}

func CreateActivityLog(c *fiber.Ctx) error {
	var log models.ActivityLog

	// Ambil user_id dari context dengan type assertion
	userID, ok := c.Locals("user_id").(uint)

	// Parse request body ke struct
	if err := c.BodyParser(&log); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	// Jika userID tidak tersedia, set ke nil untuk menghindari foreign key error
	if ok {
		log.UserID = &userID
	} else {
		log.UserID = nil // Pastikan nil agar tidak memicu error FK
	}

	// Set timestamp
	log.Timestamp = time.Now().UTC()

	// Simpan log ke database
	result := config.DB.Create(&log)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create activity log", "details": result.Error.Error()})
	}

	activitySeen := models.ActivitySeen{
		UserID:     *log.UserID,          // Pastikan UserID tersedia
		ActivityID: log.ID,               // Menggunakan ID ActivityLog yang baru dibuat
		IsRead:     false,                // Nilai default
		CreatedAt:  time.Now().UTC(),     // Waktu saat ini
	}

	// Simpan entri ActivitySeen
	seenResult := config.DB.Create(&activitySeen)
	if seenResult.Error != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create activity seen", "details": seenResult.Error.Error()})
	}

	return c.Status(201).JSON(log)
}

func UpdateActivityLog(c *fiber.Ctx) error {
	id := c.Params("id")
	var log models.ActivityLog

	result := config.DB.First(&log, id)
	if result.Error != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Activity log not found"})
	}

	if err := c.BodyParser(&log); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	config.DB.Save(&log)
	return c.JSON(log)
}

func DeleteActivityLog(c *fiber.Ctx) error {
	id := c.Params("id")
	result := config.DB.Delete(&models.ActivityLog{}, id)

	if result.RowsAffected == 0 {
		return c.Status(404).JSON(fiber.Map{"error": "Activity log not found"})
	}

	return c.JSON(fiber.Map{"message": "Activity log deleted successfully"})
}
