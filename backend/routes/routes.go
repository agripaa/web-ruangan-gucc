package routes

import (
	"backend/handlers"
	"backend/middlewares"

	"github.com/gofiber/fiber/v2"
)

func SetupRoutes(app *fiber.App) {
	api := app.Group("/api")

	api.Post("/register", handlers.Register)
	api.Post("/login", handlers.Login)

	reports := api.Group("/reports", middlewares.AuthMiddleware)
	reports.Get("/", handlers.GetReports)
	reports.Get("/:id", handlers.GetReportByID)
	reports.Post("/", handlers.CreateReport)
	reports.Put("/:id", handlers.UpdateReport)
	reports.Delete("/:id", handlers.DeleteReport)

	rooms := api.Group("/rooms", middlewares.AuthMiddleware)
	rooms.Get("/", handlers.GetRooms)
	rooms.Get("/:id", handlers.GetRoomByID)
	rooms.Post("/", handlers.CreateRoom)
	rooms.Put("/:id", handlers.UpdateRoom)
	rooms.Delete("/:id", handlers.DeleteRoom)
}
