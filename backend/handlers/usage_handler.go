package handlers

import (
	"backend/config"
	"backend/models"
	"fmt"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/jung-kurt/gofpdf"
	"github.com/xuri/excelize/v2"
)

func GetUsages(c *fiber.Ctx) error {
	var usages []models.Usage
	config.DB.Preload("Inventory").Preload("Campus").Find(&usages)
	return c.JSON(usages)
}

func GetUsagePaginated(c *fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "10"))
	sort := c.Query("sort", "installation_date")
	order := c.Query("order", "desc")
	search := c.Query("search", "")
	month := c.Query("month", "")
	year := c.Query("year", "")

	if page < 1 {
		page = 1
	}
	offset := (page - 1) * limit

	var usages []models.Usage
	var total int64

	query := config.DB.
		Model(&models.Usage{}).
		Joins("JOIN inventories ON inventories.id = usages.inventory_id").
		Preload("Inventory").
		Preload("Campus")

	if search != "" {
		query = query.Where("usages.room ILIKE ? OR inventories.name ILIKE ?", "%"+search+"%", "%"+search+"%")
	}

	if month != "" && year != "" {
		query = query.Where(
			"EXTRACT(MONTH FROM installation_date) = ? AND EXTRACT(YEAR FROM installation_date) = ?",
			month, year,
		)
	}

	query.Count(&total)

	if order != "asc" && order != "desc" {
		order = "desc"
	}
	query = query.Order(fmt.Sprintf("usages.%s %s", sort, order))

	query.Offset(offset).Limit(limit).Find(&usages)

	return c.JSON(fiber.Map{
		"data":        usages,
		"total":       total,
		"page":        page,
		"limit":       limit,
		"total_pages": (total + int64(limit) - 1) / int64(limit),
	})
}

func GetUsageByID(c *fiber.Ctx) error {
	id := c.Params("id")
	var usage models.Usage
	if err := config.DB.Preload("Inventory").Preload("Campus").First(&usage, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Usage not found"})
	}
	return c.JSON(usage)
}

func CreateUsage(c *fiber.Ctx) error {
	var usage models.Usage
	if err := c.BodyParser(&usage); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	// Ambil inventory yang terkait
	var inventory models.Inventory
	if err := config.DB.First(&inventory, usage.InventoryID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Inventory not found"})
	}

	// Cek apakah jumlah cukup
	invAmount, err1 := strconv.Atoi(inventory.Amount)
	usedAmount, err2 := strconv.Atoi(usage.Amount)
	if err1 != nil || err2 != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Amount must be a number"})
	}

	if usedAmount > invAmount {
		return c.Status(400).JSON(fiber.Map{
			"warning": "Amount exceeds available inventory",
		})
	}

	// Kurangi stok
	inventory.Amount = strconv.Itoa(invAmount - usedAmount)
	config.DB.Save(&inventory)

	// Simpan usage
	usage.InstallationDate = time.Now()
	if err := config.DB.Create(&usage).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create usage"})
	}

	return c.Status(201).JSON(usage)
}

func ExportUsageToPDF(c *fiber.Ctx) error {
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

	startDate := fmt.Sprintf("%04d-%02d-01", yearInt, monthInt)
	endDate := fmt.Sprintf("%04d-%02d-%02d", yearInt, monthInt, getLastDayOfMonth(yearInt, monthInt))

	var usages []models.Usage
	config.DB.Preload("Inventory").
		Where("installation_date BETWEEN ? AND ?", startDate, endDate).
		Find(&usages)

	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.AddPage()
	pdf.SetFont("Arial", "B", 14)
	pdf.Cell(190, 10, "Laporan Penggunaan Inventaris")
	pdf.Ln(10)

	pdf.SetFont("Arial", "", 12)
	pdf.Cell(190, 10, fmt.Sprintf("Periode: %s-%s", month, year))
	pdf.Ln(15)

	pdf.SetFont("Arial", "", 10)
	for _, usage := range usages {
		pdf.Cell(40, 10, fmt.Sprintf("Nama Inventaris: %s", usage.Inventory.Name))
		pdf.Ln(5)
		pdf.Cell(40, 10, fmt.Sprintf("Jumlah Digunakan: %s", usage.Amount))
		pdf.Ln(5)
		pdf.Cell(40, 10, fmt.Sprintf("Tanggal Pemasangan: %s", usage.InstallationDate.Format("2006-01-02")))
		pdf.Ln(10)
	}

	filename := fmt.Sprintf("usage_%s_%s.pdf", year, month)
	if err := pdf.OutputFileAndClose(filename); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to generate PDF"})
	}
	return c.Download(filename)
}

func ExportUsageToExcel(c *fiber.Ctx) error {
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

	startDate := fmt.Sprintf("%04d-%02d-01", yearInt, monthInt)
	endDate := fmt.Sprintf("%04d-%02d-%02d", yearInt, monthInt, getLastDayOfMonth(yearInt, monthInt))

	var usages []models.Usage
	config.DB.Preload("Inventory").
		Where("installation_date BETWEEN ? AND ?", startDate, endDate).
		Find(&usages)

	xlsx := excelize.NewFile()
	sheet := "Usage"
	xlsx.SetSheetName("Sheet1", sheet)

	xlsx.SetCellValue(sheet, "A1", "Laporan Penggunaan Inventaris")
	xlsx.MergeCell(sheet, "A1", "C1")
	xlsx.SetCellValue(sheet, "A2", fmt.Sprintf("Periode: %s-%02d", year, monthInt))
	xlsx.MergeCell(sheet, "A2", "C2")

	headers := []string{"Nama Inventaris", "Jumlah Digunakan", "Tanggal Pemasangan"}
	for col, header := range headers {
		colLetter, _ := excelize.ColumnNumberToName(col + 1)
		xlsx.SetCellValue(sheet, fmt.Sprintf("%s3", colLetter), header)
	}

	for i, usage := range usages {
		row := i + 4
		xlsx.SetCellValue(sheet, fmt.Sprintf("A%d", row), usage.Inventory.Name)
		xlsx.SetCellValue(sheet, fmt.Sprintf("B%d", row), usage.Amount)
		xlsx.SetCellValue(sheet, fmt.Sprintf("C%d", row), usage.InstallationDate.Format("2006-01-02"))
	}

	filename := fmt.Sprintf("usage_%s_%02d.xlsx", year, monthInt)
	if err := xlsx.SaveAs(filename); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to generate Excel file"})
	}

	return c.Download(filename)
}

func UpdateUsage(c *fiber.Ctx) error {
	id := c.Params("id")
	var usage models.Usage
	if err := config.DB.First(&usage, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Usage not found"})
	}
	if err := c.BodyParser(&usage); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}
	config.DB.Save(&usage)
	return c.JSON(usage)
}

func DeleteUsage(c *fiber.Ctx) error {
	id := c.Params("id")
	if result := config.DB.Delete(&models.Usage{}, id); result.RowsAffected == 0 {
		return c.Status(404).JSON(fiber.Map{"error": "Usage not found"})
	}
	return c.JSON(fiber.Map{"message": "Usage deleted successfully"})
}
