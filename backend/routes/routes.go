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

	// Public access reports
	reports := api.Group("/reports")
	reports.Get("/", handlers.GetReports)
	reports.Get("/search", handlers.SearchReportByToken)
	reports.Post("/", handlers.CreateReport)

	// Admin access requires authentication
	admin := api.Group("/admin", middlewares.AuthMiddleware)

	adminReports := admin.Group("/reports")
	adminReports.Get("/:id", handlers.GetReportByID)
	adminReports.Get("/paginate", handlers.GetReportPagination)
	adminReports.Put("/:id", handlers.UpdateReport)
	adminReports.Delete("/:id", handlers.DeleteReport)

	rooms := admin.Group("/rooms")
	rooms.Get("/", handlers.GetRooms)
	rooms.Get("/:id", handlers.GetRoomByID)
	rooms.Post("/", handlers.CreateRoom)
	rooms.Put("/:id", handlers.UpdateRoom)
	rooms.Delete("/:id", handlers.DeleteRoom)

	activityLogs := admin.Group("/activity-logs")
	activityLogs.Get("/", handlers.GetActivityLogs)
	activityLogs.Get("/:id", handlers.GetActivityLogByID)
	activityLogs.Post("/", handlers.CreateActivityLog)
	activityLogs.Put("/:id", handlers.UpdateActivityLog)
	activityLogs.Delete("/:id", handlers.DeleteActivityLog)
}
