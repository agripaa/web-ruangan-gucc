package main

import (
	"os"

	"backend/config"
	"backend/models"
	"backend/routes"
	"backend/seeders"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

func main() {
	app := fiber.New()

	config.ConnectDB()

	models.MigrateUsers(config.DB)
	models.MigrateReports(config.DB)
	models.MigrateActivityLogs(config.DB)
	models.MigrateCampus(config.DB)
	models.MigrateRoles(config.DB)
	models.MigrateSummary(config.DB)

	seeders.SeedUsers(config.DB)

	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowMethods: "GET,POST,PUT,DELETE,OPTIONS",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
	}))

	routes.SetupRoutes(app)

	app.Listen(os.Getenv("PORT_SERVER"))
}
