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
	userID := c.Locals("user_id").(uint)

	var log models.ActivityLog
	if err := c.BodyParser(&log); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	log.UserID = &userID
	log.Timestamp = time.Now()

	result := config.DB.Create(&log)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create activity log"})
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
