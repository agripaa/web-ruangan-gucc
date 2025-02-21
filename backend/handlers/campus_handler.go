package handlers

import (
	"backend/config"
	"backend/models"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

func GetCampuses(c *fiber.Ctx) error {
	var campuses []models.Campus
	config.DB.Find(&campuses)
	return c.JSON(campuses)
}

func GetCampusesPaginate(c *fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "10"))
	offset := (page - 1) * limit

	var campuses []models.Campus
	var total int64

	query := config.DB.Model(&models.Campus{})
	query.Count(&total)
	query.Offset(offset).Limit(limit).Find(&campuses)

	return c.JSON(fiber.Map{
		"data":        campuses,
		"total":       total,
		"page":        page,
		"limit":       limit,
		"total_pages": (total + int64(limit) - 1) / int64(limit),
	})
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
	if campus.CampusName == "" || campus.CampusLocation == "" {
		return c.Status(400).JSON(fiber.Map{"message": "All fields are required"})
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

	var updateData models.Campus
	if err := c.BodyParser(&updateData); err != nil {
		return c.Status(400).JSON(fiber.Map{"message": "Invalid input"})
	}

	config.DB.Model(&campus).Updates(updateData)
	return c.JSON(campus)
}

func DeleteCampus(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := config.DB.Delete(&models.Campus{}, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"message": "Campus not found"})
	}
	return c.JSON(fiber.Map{"message": "Campus deleted"})
}
