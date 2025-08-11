package handlers

import (
	"backend/config"
	"backend/models"
	"fmt"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

var validTypes = map[string]bool{"qty": true, "meter": true}
var validStatuses = map[string]bool{"rusak": true, "normal": true}

func GetInventories(c *fiber.Ctx) error {
	var inventories []models.Inventory
	config.DB.Preload("Usages").Find(&inventories)
	return c.JSON(inventories)
}

func GetInventoryPaginated(c *fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "10"))
	search := c.Query("search", "")
	sort := c.Query("sort", "id")
	order := c.Query("order", "asc")
	statusFilter := c.Query("status", "")

	if page < 1 {
		page = 1
	}
	offset := (page - 1) * limit

	var inventories []models.Inventory
	var total int64

	query := config.DB.Model(&models.Inventory{}).Preload("Usages")

	if search != "" {
		query = query.Where("name ILIKE ?", "%"+search+"%")
	}

	if statusFilter != "" {
		query = query.Where("status = ?", statusFilter)
	}

	query.Count(&total)

	if order != "asc" && order != "desc" {
		order = "asc"
	}
	query = query.Order(fmt.Sprintf("%s %s", sort, order))

	query.Offset(offset).Limit(limit).Find(&inventories)

	return c.JSON(fiber.Map{
		"data":        inventories,
		"total":       total,
		"page":        page,
		"limit":       limit,
		"total_pages": (total + int64(limit) - 1) / int64(limit),
	})
}

func GetInventoryByID(c *fiber.Ctx) error {
	id := c.Params("id")
	var inventory models.Inventory
	if err := config.DB.Preload("Usages").First(&inventory, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Inventory not found"})
	}
	return c.JSON(inventory)
}

func CreateInventory(c *fiber.Ctx) error {
	var inventory models.Inventory
	if err := c.BodyParser(&inventory); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	if !validTypes[inventory.Type] {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid inventory type"})
	}
	if !validStatuses[inventory.Status] {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid inventory status"})
	}

	if err := config.DB.Create(&inventory).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create inventory"})
	}
	return c.Status(201).JSON(inventory)
}

func UpdateInventory(c *fiber.Ctx) error {
	id := c.Params("id")
	var inventory models.Inventory
	if err := config.DB.First(&inventory, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Inventory not found"})
	}

	if err := c.BodyParser(&inventory); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	if !validTypes[inventory.Type] {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid inventory type"})
	}
	if !validStatuses[inventory.Status] {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid inventory status"})
	}

	config.DB.Save(&inventory)
	return c.JSON(inventory)
}

func DeleteInventory(c *fiber.Ctx) error {
	id := c.Params("id")
	if result := config.DB.Delete(&models.Inventory{}, id); result.RowsAffected == 0 {
		return c.Status(404).JSON(fiber.Map{"error": "Inventory not found"})
	}
	return c.JSON(fiber.Map{"message": "Inventory deleted successfully"})
}
