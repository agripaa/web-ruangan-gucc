package handlers

import (
	"backend/config"
	"backend/models"

	"github.com/gofiber/fiber/v2"
)

var validTypes = map[string]bool{"qty": true, "meter": true}
var validStatuses = map[string]bool{"rusak": true, "normal": true}

func GetInventories(c *fiber.Ctx) error {
	var inventories []models.Inventory
	config.DB.Preload("Usages").Find(&inventories)
	return c.JSON(inventories)
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
