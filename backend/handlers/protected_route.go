package handlers

import (
	"github.com/gofiber/fiber/v2"
)

// Endpoint contoh untuk endpoint yang butuh autentikasi
func ProtectedRoute(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{"message": "You have accessed a protected route!"})
}
