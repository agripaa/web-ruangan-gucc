package main

import (
	"os"

	"backend/config"
	"backend/models"
	"backend/routes"
	"backend/seeders"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/joho/godotenv"
)

func main() {
	app := fiber.New()
	godotenv.Load()

	config.ConnectDB()

	models.MigrateUsers(config.DB)
	models.MigrateReports(config.DB)
	models.MigrateActivityLogs(config.DB)
	models.MigrateCampus(config.DB)
	models.MigrateRoles(config.DB)
	models.MigrateSummary(config.DB)
	models.MigrateActivitySeen(config.DB)
	models.MigrateInventory(config.DB)
	models.MigrateUsage(config.DB)

	seeders.SeedUsers(config.DB)
	seeders.SeedCampuses(config.DB)

	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowMethods: "GET,POST,PUT,DELETE,OPTIONS",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
	}))

	routes.SetupRoutes(app)

	port := os.Getenv("PORT_SERVER")
	if port == "" {
		port = ":3001"
	}

	println("🚀 Server running at http://localhost" + port)
	app.Listen(port)
}
