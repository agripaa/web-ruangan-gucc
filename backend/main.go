package main

import (
	"os"

	"backend/config"
	"backend/models"
	"backend/routes"

	"github.com/gofiber/fiber/v2"
)

func main() {
	app := fiber.New()

	config.ConnectDB()

	models.MigrateUsers(config.DB)
	models.MigrateReports(config.DB)
	models.MigrateRooms(config.DB)
	models.MigrateActivityLogs(config.DB)
	models.MigrateCampus(config.DB)
	models.MigrateRoles(config.DB)

	routes.SetupRoutes(app)

	app.Listen(os.Getenv("PORT_SERVER"))
}
