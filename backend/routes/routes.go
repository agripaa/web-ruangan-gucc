package routes

import (
	"backend/handlers"

	"github.com/gofiber/fiber/v2"
)

func SetupRoutes(app *fiber.App) {
	api := app.Group("/api")

	api.Get("/", func(c *fiber.Ctx) error {
		return c.SendString("Test Route is Working!")
	})

	api.Post("/register", handlers.Register)
	api.Post("/login", handlers.Login)

	api.Get("/protected", handlers.ProtectedRoute)
}
