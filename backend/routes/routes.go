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
	api.Post("/login/user", handlers.LoginUser)

	client := api.Group("/client", middlewares.AuthMiddleware)
	client.Get("/campuses", handlers.GetCampuses)
	client.Post("/logs", handlers.CreateActivityLog)
	client.Get("/create-report", handlers.GetCreateReportLogs)
	client.Get("/update-report", handlers.GetUpdateReportLogs)
	client.Post("/summary", handlers.SaveReportSummary)
	client.Get("/summary", handlers.GetReportSummary)

	user := client.Group("/user")
	user.Get("/profile", handlers.GetProfile)

	// Public access reports
	reports := client.Group("/reports")
	reports.Get("/", handlers.GetReports)
	reports.Get("/search", handlers.SearchReportByToken)
	reports.Post("/", handlers.CreateReport)

	// Admin access requires authentication
	admin := api.Group("/admin", middlewares.AdminMiddleware)

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
	adminSummary.Get("/", handlers.GetSummarys)
	adminSummary.Get("/:reportId", handlers.GetReportSummary)
	adminSummary.Delete("/:reportId", handlers.DeleteReportSummary)

	adminUsers := admin.Group("/users")
	adminUsers.Get("/", handlers.GetAdmins)
	adminUsers.Post("/", handlers.CreateAdmin)
	adminUsers.Put("/:id", handlers.UpdateAdmin)
	adminUsers.Delete("/:id", handlers.DeleteAdmin)
}
