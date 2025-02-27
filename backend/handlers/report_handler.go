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

func getLastDayOfMonth(year int, month int) int {
	return time.Date(year, time.Month(month+1), 0, 0, 0, 0, 0, time.UTC).Day()
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
			break
		}
	}
	return token
}

func ExportReportsToPDF(c *fiber.Ctx) error {
	month := c.Query("month")
	year := c.Query("year")

	if month == "" || year == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Month and year parameters are required"})
	}

	monthInt, err := strconv.Atoi(month)
	yearInt, err := strconv.Atoi(year)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid month or year format"})
	}

	lastDay := getLastDayOfMonth(yearInt, monthInt)

	period := fmt.Sprintf("Periode: %s-%s", month, year)

	var reports []models.Report
	startDate := fmt.Sprintf("%s-%02d-01", year, monthInt)
	endDate := fmt.Sprintf("%s-%02d-%02d", year, monthInt, lastDay)

	config.DB.Preload("Campus").Where("DATE(reported_at) BETWEEN ? AND ?", startDate, endDate).Find(&reports)

	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.AddPage()

	pdf.SetFont("Arial", "B", 14)
	pdf.Cell(190, 10, "Laporan Pengaduan")
	pdf.Ln(10)
	pdf.SetFont("Arial", "", 12)
	pdf.Cell(190, 10, period)
	pdf.Ln(15)

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

	pdfPath := fmt.Sprintf("reports_%s_%02d.pdf", year, monthInt)
	err = pdf.OutputFileAndClose(pdfPath)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to generate PDF"})
	}

	return c.Download(pdfPath)
}

func ExportReportsToExcel(c *fiber.Ctx) error {
	month := c.Query("month")
	year := c.Query("year")

	if month == "" || year == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Month and year parameters are required"})
	}

	monthInt, err := strconv.Atoi(month)
	yearInt, err := strconv.Atoi(year)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid month or year format"})
	}

	lastDay := getLastDayOfMonth(yearInt, monthInt)

	period := fmt.Sprintf("Periode: %s-%02d", year, monthInt)

	var reports []models.Report
	startDate := fmt.Sprintf("%s-%02d-01", year, monthInt)
	endDate := fmt.Sprintf("%s-%02d-%02d", year, monthInt, lastDay)

	config.DB.Preload("Campus").Where("DATE(reported_at) BETWEEN ? AND ?", startDate, endDate).Find(&reports)

	xlsx := excelize.NewFile()
	sheet := "Reports"
	xlsx.SetSheetName("Sheet1", sheet)

	xlsx.SetCellValue(sheet, "A1", "Laporan Pengaduan")
	xlsx.MergeCell(sheet, "A1", "G1")
	xlsx.SetCellValue(sheet, "A2", period)
	xlsx.MergeCell(sheet, "A2", "G2")

	headers := []string{"Username", "Phone Number", "Room", "Campus Name", "Campus Location", "Status", "Description"}
	for col, header := range headers {
		colLetter, _ := excelize.ColumnNumberToName(col + 1)
		xlsx.SetCellValue(sheet, fmt.Sprintf("%s3", colLetter), header)
	}

	for rowIdx, report := range reports {
		row := rowIdx + 4
		xlsx.SetCellValue(sheet, fmt.Sprintf("A%d", row), report.Username)
		xlsx.SetCellValue(sheet, fmt.Sprintf("B%d", row), report.PhoneNumber)
		xlsx.SetCellValue(sheet, fmt.Sprintf("C%d", row), report.Room)
		xlsx.SetCellValue(sheet, fmt.Sprintf("D%d", row), report.Campus.CampusName)
		xlsx.SetCellValue(sheet, fmt.Sprintf("E%d", row), report.Campus.CampusLocation)
		xlsx.SetCellValue(sheet, fmt.Sprintf("F%d", row), report.Status)
		xlsx.SetCellValue(sheet, fmt.Sprintf("G%d", row), report.Description)
	}

	excelPath := fmt.Sprintf("reports_%s_%02d.xlsx", year, monthInt)
	if err := xlsx.SaveAs(excelPath); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to generate Excel file"})
	}

	return c.Download(excelPath)
}

func GetReportStatusCounts(c *fiber.Ctx) error {
	type StatusCount struct {
		Status string `json:"status"`
		Count  int    `json:"count"`
	}

	var counts []StatusCount
	config.DB.Raw(`
		SELECT status, COUNT(*) as count 
		FROM reports 
		GROUP BY status
	`).Scan(&counts)

	return c.JSON(counts)
}

func GetReports(c *fiber.Ctx) error {
	var reports []models.Report
	currentDate := time.Now().Format("2006-01-02")

	config.DB.Preload("Campus").Preload("Worker").Where(
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
	sortBy := c.Query("sort", "reported_at")
	order := c.Query("order", "desc")

	selectedMonth := c.Query("month", "")
	selectedYear := c.Query("year", "")
	searchQuery := c.Query("search", "")
	statusFilter := c.Query("status", "")

	var reports []models.Report
	var total int64

	query := config.DB.Preload("Campus").Preload("Worker")

	if statusFilter != "" {
		query = query.Where("status = ?", statusFilter)
	}

	if searchQuery != "" {
		query = query.Joins("LEFT JOIN users ON users.id = reports.worker_id").
			Where("reports.token LIKE ? OR reports.room LIKE ? OR users.username LIKE ?", "%"+searchQuery+"%", "%"+searchQuery+"%", "%"+searchQuery+"%")
	}

	if selectedMonth != "" && selectedYear != "" {
		query = query.Where("EXTRACT(YEAR FROM reported_at) = ? AND EXTRACT(MONTH FROM reported_at) = ?", selectedYear, selectedMonth)
	}

	query = query.Order(`
		CASE 
			WHEN status = 'pending' THEN 1
			WHEN status = 'on the way' THEN 2
			WHEN status = 'in progress' THEN 3
			WHEN status = 'done' THEN 4
		END ASC
	`)

	if order == "asc" {
		query = query.Order(fmt.Sprintf("%s ASC", sortBy))
	} else {
		query = query.Order(fmt.Sprintf("%s DESC", sortBy))
	}

	offset := (page - 1) * limit
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
	if err := config.DB.Preload("Campus").Preload("Worker").First(&report, id).Error; err != nil {
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

	type UpdateStatusRequest struct {
		Status string `json:"status"`
	}
	var req UpdateStatusRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	switch req.Status {
	case "on the way":
		if report.Status != "pending" {
			return c.Status(400).JSON(fiber.Map{"error": "Report must be pending to be assigned"})
		}

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
