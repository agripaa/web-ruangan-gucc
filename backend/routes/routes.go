package routes

import (
	"backend/handlers"
	"backend/middlewares"
	"fmt"

	"github.com/gofiber/fiber/v2"
)

func SetupRoutes(app *fiber.App) {
	api := app.Group("/api")

	api.Get("/campuses", handlers.GetCampuses)

	api.Post("/register", handlers.Register)
	api.Post("/login", handlers.Login)

	api.Post("/logs", handlers.CreateActivityLog)
	api.Get("/create-report", handlers.GetCreateReportLogs)
	api.Get("/update-report", handlers.GetUpdateReportLogs)
	api.Post("/summary", handlers.SaveReportSummary)
	api.Get("/summary", handlers.GetReportSummary)

	// Public access reports
	reports := api.Group("/reports")
	reports.Get("/", handlers.GetReports)
	reports.Get("/search", handlers.SearchReportByToken)
	reports.Post("/", handlers.CreateReport)

	summary := api.Group("/summary")
	summary.Post("/:reportId", func(c *fiber.Ctx) error {
		fmt.Println("POST request masuk ke /summary/:reportId")
		return handlers.SaveReportSummary(c)
	})
	summary.Get("/:reportId", handlers.GetReportSummary)

	// Admin access requires authentication
	admin := api.Group("/admin", middlewares.AuthMiddleware)

	user := admin.Group("/user")
	user.Get("/profile", handlers.GetProfile)

	adminReports := admin.Group("/reports")
	adminReports.Get("/status/count", handlers.GetReportStatusCounts)
	adminReports.Get("/:id", handlers.GetReportByID)
	adminReports.Get("/paginate/datum", handlers.GetReportPagination)
	adminReports.Put("/:id", handlers.UpdateReport)
	adminReports.Put("/:id/status", handlers.UpdateReportStatus)
	adminReports.Delete("/:id", handlers.DeleteReport)
	adminReports.Get("/export/pdf", handlers.ExportReportsToPDF)
	adminReports.Get("/export/excel", handlers.ExportReportsToExcel)

	activityLogs := admin.Group("/activity-logs")
	activityLogs.Get("/", handlers.GetActivityLogs)
	activityLogs.Get("/:id", handlers.GetActivityLogByID)
	activityLogs.Put("/:id", handlers.UpdateActivityLog)
	activityLogs.Delete("/:id", handlers.DeleteActivityLog)

	campus := admin.Group("/campus")
	campus.Get("/", handlers.GetCampusesPaginate)
	campus.Get("/:id", handlers.GetCampusByID)
	campus.Post("/", handlers.CreateCampus)
	campus.Put("/:id", handlers.UpdateCampus)
	campus.Patch("/:id", handlers.UpdateCampus)
	campus.Delete("/:id", handlers.DeleteCampus)

	adminSummary := admin.Group("/summary")
	adminSummary.Post("/:reportId", handlers.SaveReportSummary)
	adminSummary.Get("/:reportId", handlers.GetReportSummary)
}