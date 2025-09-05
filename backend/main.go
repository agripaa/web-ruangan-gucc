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

// --- Middleware: tolak cookie header terlalu besar (biar cepat ketahuan) ---
func RejectHugeCookie(max int) fiber.Handler {
	return func(c *fiber.Ctx) error {
		ck := c.Get("cookie") // header Cookie mentah
		if len(ck) > max {
			return c.Status(fiber.StatusRequestHeaderFieldsTooLarge).JSON(fiber.Map{
				"error": "cookie too large",
				"len":   len(ck),
			})
		}
		return c.Next()
	}
}

func main() {
	godotenv.Load()

	app := fiber.New()

	// CORS untuk FE di app.local:3000
	app.Use(cors.New(cors.Config{
		AllowOrigins:     "*", // jangan "*" kalau butuh credentials
		AllowMethods:     "GET,POST,PUT,DELETE,OPTIONS",
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization",
		AllowCredentials: false, // diperlukan kalau mau kirim cookie cross-site (include)
	}))

	// Tolak cookie header yang terlalu besar (mis. > 8KB)
	app.Use(RejectHugeCookie(8 * 1024))

	// ---- koneksi DB & migrasi (punyamu) ----
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
	seeders.SeedAdmin(config.DB)
	seeders.SeedCampuses(config.DB)

	// ---- route aplikasi (punyamu) ----
	routes.SetupRoutes(app)

	// ------------------ ADD: route uji cookie ------------------
	// GET /echo -> tampilkan header Cookie apa adanya
	app.Get("/echo", func(c *fiber.Ctx) error {
		ck := c.Get("cookie")
		return c.JSON(fiber.Map{
			"cookie":        ck,
			"cookie_length": len(ck),
			"all_headers":   c.GetReqHeaders(),
		})
	})

	// GET /set-cookie -> set cookie kecil (non-Secure utk HTTP lokal)
	app.Get("/set-cookie", func(c *fiber.Ctx) error {
		c.Cookie(&fiber.Cookie{
			Name:     "apitoken",
			Value:    "abc123",
			Path:     "/",
			HTTPOnly: false, // hanya demo. produksi: true untuk session
			Secure:   false, // lokal HTTP (tanpa TLS) wajib false
			SameSite: "Lax",
			// Domain dikosongkan -> host-only
		})
		return c.SendStatus(fiber.StatusNoContent)
	})
	// -----------------------------------------------------------

	port := os.Getenv("PORT_SERVER")
	if port == "" {
		port = ":3001"
	}
	println("🚀 Server running at http://localhost" + port)
	app.Listen(port)
}
