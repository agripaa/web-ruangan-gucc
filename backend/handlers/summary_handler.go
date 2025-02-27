package handlers

import (
	"backend/config"
	"backend/models"
	"log"
	"fmt"
	"database/sql"
	"errors"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

type SummaryRequest struct {
	AdminID uint   `json:"admin_id"`
	Summary string `json:"summary"`
}

func SaveReportSummary(c *fiber.Ctx) error {
	reportIDStr := c.Params("reportId")
	reportID, err := strconv.ParseUint(reportIDStr, 10, 32) // Konversi ke integer
	if err != nil {
		log.Println("Error parsing report ID:", err)

		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid report ID"})
	}

	// Parse request body dengan error handling yang benar
	var req SummaryRequest
	if err := c.BodyParser(&req); err != nil { 
		log.Println("Error parsing request body:", err)

		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	// Validasi summary tidak boleh kosong
	if req.Summary == "" {
		log.Println("Error: Summary is empty")
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Summary cannot be empty"})
	}

	// Cek apakah summary sudah ada untuk reportId
	var existingSummary models.Summary
	result := config.DB.Table("report_summaries").Where("report_id = ?", uint(reportID)).First(&existingSummary)

	if result.RowsAffected > 0 {
		// Jika summary sudah ada, lakukan update
		existingSummary.Summary = req.Summary
		existingSummary.AdminID = uint(req.AdminID)
		if err := config.DB.Save(&existingSummary).Error; err != nil {
			log.Println("Error updating summary:", err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update summary"})
		}
	} else {
		// Jika belum ada, lakukan insert
		newSummary := models.Summary{
			ReportID: uint(reportID), 
			AdminID:  uint(req.AdminID),
			Summary:  req.Summary,
		}
		fmt.Println("Inserting new summary:", newSummary)
		if err := config.DB.Create(&newSummary).Error; err != nil {
			log.Println("Error saving summary:", err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to save summary"})
		}
		fmt.Println("Summary successfully saved:", newSummary) // Debug setelah insert
	}

	return c.JSON(fiber.Map{"message": "Summary saved successfully"})
}

// GetReportSummary mengambil summary laporan berdasarkan reportId
func GetReportSummary(c *fiber.Ctx) error {
	reportIDStr := c.Params("reportId")
	reportID, err := strconv.ParseUint(reportIDStr, 10, 32)
	if err != nil {
		log.Println("Error parsing report ID:", err)

		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid report ID"})
	}

	var summary models.Summary
	result := config.DB.Table("report_summaries").Where("report_id = ?", uint(reportID)).First(&summary)

	// Perbaikan error handling
	if result.Error != nil {
		if errors.Is(result.Error, sql.ErrNoRows) {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Summary not found"})
		}
		log.Println("Error fetching summary:", result.Error)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch summary"})
	}

	var savedSummary models.Summary
	config.DB.Table("report_summaries").Where("report_id = ?", uint(reportID)).First(&savedSummary)


	return c.JSON(summary)
}
