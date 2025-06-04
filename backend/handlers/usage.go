package handlers

import (
	"backend/config"
	"backend/models"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
)

func GetUsages(c *fiber.Ctx) error {
	var usages []models.Usage
	config.DB.Preload("Inventory").Preload("Campus").Find(&usages)
	return c.JSON(usages)
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
