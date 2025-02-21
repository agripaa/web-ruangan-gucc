package handlers

import (
	"backend/config"
	"backend/models"
	"fmt"
	"math/rand"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/jung-kurt/gofpdf"
	"github.com/xuri/excelize/v2"
)

const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

type UpdateStatusRequest struct {
	Status string `json:"status"`
}

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

func ExportReportsToPDF(c *fiber.Ctx) error {
	var reports []models.Report
	config.DB.Preload("Campus").Find(&reports)

	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.AddPage()
	pdf.SetFont("Arial", "B", 12)
	pdf.Cell(40, 10, "Report Data")
	pdf.Ln(10)

	pdf.SetFont("Arial", "", 10)
	for _, report := range reports {
		pdf.Cell(40, 10, fmt.Sprintf("Username: %s", report.Username))
		pdf.Ln(5)
		pdf.Cell(40, 10, fmt.Sprintf("Phone Number: %s", report.PhoneNumber))
		pdf.Ln(5)
		pdf.Cell(40, 10, fmt.Sprintf("Room: %s", report.Room))
		pdf.Ln(5)
		pdf.Cell(40, 10, fmt.Sprintf("Campus: %s, %s", report.Campus.CampusName, report.Campus.CampusLocation))
		pdf.Ln(5)
		pdf.Cell(40, 10, fmt.Sprintf("Status: %s", report.Status))
		pdf.Ln(10)
	}

	pdfPath := "reports.pdf"
	err := pdf.OutputFileAndClose(pdfPath)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to generate PDF"})
	}

	return c.Download(pdfPath)
}

func ExportReportsToExcel(c *fiber.Ctx) error {
	var reports []models.Report
	config.DB.Preload("Campus").Find(&reports)

	xlsx := excelize.NewFile()
	sheet := "Reports"
	xlsx.SetSheetName("Sheet1", sheet)

	headers := []string{"Username", "Phone Number", "Room", "Campus Name", "Campus Location", "Status", "Description"}
	for col, header := range headers {
		colLetter, _ := excelize.ColumnNumberToName(col + 1)
		xlsx.SetCellValue(sheet, fmt.Sprintf("%s1", colLetter), header)
	}

	for rowIdx, report := range reports {
		row := rowIdx + 2
		xlsx.SetCellValue(sheet, fmt.Sprintf("A%d", row), report.Username)
		xlsx.SetCellValue(sheet, fmt.Sprintf("B%d", row), report.PhoneNumber)
		xlsx.SetCellValue(sheet, fmt.Sprintf("C%d", row), report.Room)
		xlsx.SetCellValue(sheet, fmt.Sprintf("D%d", row), report.Campus.CampusName)
		xlsx.SetCellValue(sheet, fmt.Sprintf("E%d", row), report.Campus.CampusLocation)
		xlsx.SetCellValue(sheet, fmt.Sprintf("F%d", row), report.Status)
		xlsx.SetCellValue(sheet, fmt.Sprintf("G%d", row), report.Description)
	}

	excelPath := "reports.xlsx"
	if err := xlsx.SaveAs(excelPath); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to generate Excel file"})
	}

	return c.Download(excelPath)
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

func UpdateReportStatus(c *fiber.Ctx) error {
	id := c.Params("id")
	var report models.Report

	if err := config.DB.First(&report, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Report not found"})
	}

	// Ambil data dari request body
	type UpdateStatusRequest struct {
		Status string `json:"status"`
	}
	var req UpdateStatusRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	// Pastikan status valid
	switch req.Status {
	case "on the way":
		if report.Status != "pending" {
			return c.Status(400).JSON(fiber.Map{"error": "Report must be pending to be assigned"})
		}
		// Ambil user_id dari token yang sudah di-authenticate
		userID, ok := c.Locals("user_id").(uint)
		if !ok {
			return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
		}
		report.WorkerID = &userID
	case "in progress":
		if report.Status != "on the way" {
			return c.Status(400).JSON(fiber.Map{"error": "Report must be on the way to be in progress"})
		}
	case "done":
		if report.Status != "in progress" {
			return c.Status(400).JSON(fiber.Map{"error": "Report must be in progress to be marked as done"})
		}
	default:
		return c.Status(400).JSON(fiber.Map{"error": "Invalid status update"})
	}

	report.Status = req.Status
	report.UpdatedAt = time.Now()

	config.DB.Save(&report)

	return c.JSON(report)
}

func DeleteReport(c *fiber.Ctx) error {
	id := c.Params("id")
	if result := config.DB.Delete(&models.Report{}, id); result.RowsAffected == 0 {
		return c.Status(404).JSON(fiber.Map{"error": "Report not found"})
	}
	return c.JSON(fiber.Map{"message": "Report deleted successfully"})
}
