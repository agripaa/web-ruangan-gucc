package handlers

import (
	"backend/config"
	"backend/models"

	"github.com/gofiber/fiber/v2"
)

func GetRooms(c *fiber.Ctx) error {
	var rooms []models.Room
	config.DB.Find(&rooms)
	return c.JSON(rooms)
}

func GetRoomByID(c *fiber.Ctx) error {
	id := c.Params("id")
	var room models.Room
	result := config.DB.First(&room, id)
	if result.Error != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Room not found"})
	}
	return c.JSON(room)
}

func CreateRoom(c *fiber.Ctx) error {
	var room models.Room
	if err := c.BodyParser(&room); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	result := config.DB.Create(&room)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create room"})
	}

	return c.Status(201).JSON(room)
}

func UpdateRoom(c *fiber.Ctx) error {
	id := c.Params("id")
	var room models.Room

	result := config.DB.First(&room, id)
	if result.Error != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Room not found"})
	}

	if err := c.BodyParser(&room); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	config.DB.Save(&room)
	return c.JSON(room)
}

func DeleteRoom(c *fiber.Ctx) error {
	id := c.Params("id")
	result := config.DB.Delete(&models.Room{}, id)

	if result.RowsAffected == 0 {
		return c.Status(404).JSON(fiber.Map{"error": "Room not found"})
	}

	return c.JSON(fiber.Map{"message": "Room deleted successfully"})
}
