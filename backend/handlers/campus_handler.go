package handlers

import (
	"backend/config"
	"backend/models"

	"github.com/gofiber/fiber/v2"
)

func GetCampuses(c *fiber.Ctx) error {
    var campuses []models.Campus
    config.DB.Find(&campuses)
    return c.JSON(campuses)
}

func GetCampusByID(c *fiber.Ctx) error {
	id := c.Params("id")
	var campus models.Campus
	if err := config.DB.First(&campus, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"message": "Campus not found"})
	}
	return c.JSON(campus)
}

func CreateCampus(c *fiber.Ctx) error {
	var campus models.Campus
	if err := c.BodyParser(&campus); err != nil {
		return c.Status(400).JSON(fiber.Map{"message": "Invalid input"})
	}
	config.DB.Create(&campus)
	return c.JSON(campus)
}

func UpdateCampus(c *fiber.Ctx) error {
	id := c.Params("id")
	var campus models.Campus
	if err := config.DB.First(&campus, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"message": "Campus not found"})
	}

	if err := c.BodyParser(&campus); err != nil {
		return c.Status(400).JSON(fiber.Map{"message": "Invalid input"})
	}

	config.DB.Save(&campus)
	return c.JSON(campus)
}

func DeleteCampus(c *fiber.Ctx) error {
	id := c.Params("id")
	config.DB.Delete(&models.Campus{}, id)
	return c.JSON(fiber.Map{"message": "Campus deleted"})
}
