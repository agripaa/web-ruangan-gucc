package handlers

import (
	"backend/config"
	"backend/models"

	"github.com/gofiber/fiber/v2"
)

func GetReports(c *fiber.Ctx) error {
	var reports []models.Report
	config.DB.Preload("Room").Find(&reports)
	return c.JSON(reports)
}

func GetReportByID(c *fiber.Ctx) error {
	id := c.Params("id")
	var report models.Report
	result := config.DB.Preload("Room").First(&report, id)
	if result.Error != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Report not found"})
	}
	return c.JSON(report)
}

func CreateReport(c *fiber.Ctx) error {
	var report models.Report
	if err := c.BodyParser(&report); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	result := config.DB.Create(&report)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create report"})
	}

	return c.Status(201).JSON(report)
}

func UpdateReport(c *fiber.Ctx) error {
	id := c.Params("id")
	var report models.Report

	result := config.DB.First(&report, id)
	if result.Error != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Report not found"})
	}

	if err := c.BodyParser(&report); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	config.DB.Save(&report)
	return c.JSON(report)
}

func DeleteReport(c *fiber.Ctx) error {
	id := c.Params("id")
	result := config.DB.Delete(&models.Report{}, id)

	if result.RowsAffected == 0 {
		return c.Status(404).JSON(fiber.Map{"error": "Report not found"})
	}

	return c.JSON(fiber.Map{"message": "Report deleted successfully"})
}
