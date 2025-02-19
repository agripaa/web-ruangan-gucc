package tests

import (
	"backend/config"
	"backend/handlers"
	"backend/middlewares"
	"backend/models"
	"fmt"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gofiber/fiber/v2"
	"github.com/stretchr/testify/assert"
)

func setupTestAppReport() *fiber.App {
	app := fiber.New()

	config.ConnectDB()
	models.MigrateReports(config.DB)

	config.DB.Exec("DELETE FROM reports")
	config.DB.Exec("DELETE FROM rooms")

	app.Post("/api/login", handlers.Login)

	reports := app.Group("/api/reports", middlewares.AuthMiddleware)
	reports.Get("/", handlers.GetReports)
	reports.Get("/:id", handlers.GetReportByID)
	reports.Post("/", handlers.CreateReport)
	reports.Put("/:id", handlers.UpdateReport)
	reports.Delete("/:id", handlers.DeleteReport)

	return app
}

func TestCreateReport(t *testing.T) {
	app := setupTestAppReport()

	room := models.Room{NameRoom: "Test Room", NumberRoom: "201"}
	config.DB.Create(&room)

	var latestRoom models.Room
	config.DB.Order("id desc").First(&latestRoom)
	roomID := latestRoom.ID

	token := getAuthToken(t, app)

	requestBody := fmt.Sprintf(`{"username":"testuser","phone_number":"123456789","room_id":%d,"constraint":"AC rusak"}`, roomID)
	req := httptest.NewRequest("POST", "/api/reports", strings.NewReader(requestBody))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+token)
	resp, _ := app.Test(req, -1)

	assert.Equal(t, 201, resp.StatusCode)
}

func TestGetReports(t *testing.T) {
	app := setupTestAppReport()

	token := getAuthToken(t, app)

	req := httptest.NewRequest("GET", "/api/reports", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	resp, _ := app.Test(req, -1)

	assert.Equal(t, 200, resp.StatusCode)
}

func TestGetReportByID(t *testing.T) {
	app := setupTestAppReport()

	room := models.Room{NameRoom: "Test Room", NumberRoom: "202"}
	config.DB.Create(&room)

	var latestRoom models.Room
	config.DB.Order("id desc").First(&latestRoom)
	roomID := latestRoom.ID

	report := models.Report{Username: "testuser", PhoneNumber: "123456789", RoomID: roomID, Constraint: "Lampu mati"}
	config.DB.Create(&report)

	var latestReport models.Report
	config.DB.Order("id desc").First(&latestReport)
	reportID := latestReport.ID

	token := getAuthToken(t, app)

	req := httptest.NewRequest("GET", fmt.Sprintf("/api/reports/%d", reportID), nil)
	req.Header.Set("Authorization", "Bearer "+token)
	resp, _ := app.Test(req, -1)

	assert.Equal(t, 200, resp.StatusCode)
}

func TestUpdateReport(t *testing.T) {
	app := setupTestAppReport()

	room := models.Room{NameRoom: "Test Room", NumberRoom: "203"}
	config.DB.Create(&room)

	var latestRoom models.Room
	config.DB.Order("id desc").First(&latestRoom)
	roomID := latestRoom.ID

	report := models.Report{Username: "testuser", PhoneNumber: "123456789", RoomID: roomID, Constraint: "Lampu redup"}
	config.DB.Create(&report)

	var latestReport models.Report
	config.DB.Order("id desc").First(&latestReport)
	reportID := latestReport.ID

	token := getAuthToken(t, app)

	requestBody := `{"status":"in progress"}`
	req := httptest.NewRequest("PUT", fmt.Sprintf("/api/reports/%d", reportID), strings.NewReader(requestBody))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+token)
	resp, _ := app.Test(req, -1)

	assert.Equal(t, 200, resp.StatusCode)
}

func TestDeleteReport(t *testing.T) {
	app := setupTestAppReport()

	room := models.Room{NameRoom: "Test Room", NumberRoom: "204"}
	config.DB.Create(&room)

	var latestRoom models.Room
	config.DB.Order("id desc").First(&latestRoom)
	roomID := latestRoom.ID

	report := models.Report{Username: "testuser", PhoneNumber: "123456789", RoomID: roomID, Constraint: "AC bocor"}
	config.DB.Create(&report)

	var latestReport models.Report
	config.DB.Order("id desc").First(&latestReport)
	reportID := latestReport.ID

	token := getAuthToken(t, app)

	req := httptest.NewRequest("DELETE", fmt.Sprintf("/api/reports/%d", reportID), nil)
	req.Header.Set("Authorization", "Bearer "+token)
	resp, _ := app.Test(req, -1)

	assert.Equal(t, 200, resp.StatusCode)
}
