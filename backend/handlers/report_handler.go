package handlers

import (
	"backend/config"
	"backend/models"
	"math/rand"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
)

const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

func generateUniqueToken(length int) string {
	rand.Seed(time.Now().UnixNano())
	var token string
	for {
		tokenBytes := make([]byte, length)
		for i := range tokenBytes {
			tokenBytes[i] = charset[rand.Intn(len(charset))]
		}
		token = string(tokenBytes)

		var count int64
		config.DB.Model(&models.Report{}).Where("token = ?", token).Count(&count)
		if count == 0 {
			break // Token is unique, exit loop
		}
	}
	return token
}

func GetReports(c *fiber.Ctx) error {
	var reports []models.Report
	currentDate := time.Now().Format("2006-01-02")

	config.DB.Preload("Campus").Where(
		"status IN (?) AND DATE(updated_at) >= ?",
		[]string{"pending", "on the way", "in progress", "done"}, currentDate,
	).Order("updated_at DESC").Limit(15).Find(&reports)

	return c.JSON(reports)
}

func SearchReportByToken(c *fiber.Ctx) error {
	token := c.Query("token")
	if token == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Token parameter is required"})
	}

	var reports []models.Report
	config.DB.Preload("Campus").Where("token LIKE ?", "%"+token+"%").Find(&reports)

	if len(reports) == 0 {
		return c.Status(404).JSON(fiber.Map{"error": "No reports found"})
	}

	return c.JSON(reports)
}

func GetReportPagination(c *fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "10"))
	offset := (page - 1) * limit

	var reports []models.Report
	var total int64

	query := config.DB.Preload("Campus")
	query.Model(&models.Report{}).Count(&total)
	query.Offset(offset).Limit(limit).Find(&reports)

	return c.JSON(fiber.Map{
		"data":        reports,
		"total":       total,
		"page":        page,
		"limit":       limit,
		"total_pages": (total + int64(limit) - 1) / int64(limit),
	})
}

func GetReportByID(c *fiber.Ctx) error {
	id := c.Params("id")
	var report models.Report
	if err := config.DB.Preload("Campus").First(&report, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Report not found"})
	}
	return c.JSON(report)
}

func CreateReport(c *fiber.Ctx) error {
	var report models.Report
	if err := c.BodyParser(&report); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	report.Token = generateUniqueToken(20)
	report.Status = "pending"
	report.ReportedAt = time.Now()
	report.UpdatedAt = time.Now()

	if err := config.DB.Create(&report).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create report"})
	}

	return c.Status(201).JSON(report)
}

func UpdateReport(c *fiber.Ctx) error {
	id := c.Params("id")
	var report models.Report

	if err := config.DB.First(&report, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Report not found"})
	}

	updateData := new(models.Report)
	if err := c.BodyParser(updateData); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	updateData.UpdatedAt = time.Now()

	config.DB.Model(&report).Updates(updateData)
	return c.JSON(report)
}

func DeleteReport(c *fiber.Ctx) error {
	id := c.Params("id")
	if result := config.DB.Delete(&models.Report{}, id); result.RowsAffected == 0 {
		return c.Status(404).JSON(fiber.Map{"error": "Report not found"})
	}
	return c.JSON(fiber.Map{"message": "Report deleted successfully"})
}
