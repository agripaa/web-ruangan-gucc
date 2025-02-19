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

func setupTestAppActivityLog() *fiber.App {
	app := fiber.New()

	config.ConnectDB()
	models.MigrateActivityLogs(config.DB)

	config.DB.Exec("DELETE FROM activity_logs")
	config.DB.Exec("DELETE FROM reports")

	app.Post("/api/login", handlers.Login)

	activityLogs := app.Group("/api/activity-logs", middlewares.AuthMiddleware)
	activityLogs.Get("/", handlers.GetActivityLogs)
	activityLogs.Get("/:id", handlers.GetActivityLogByID)
	activityLogs.Post("/", handlers.CreateActivityLog)
	activityLogs.Put("/:id", handlers.UpdateActivityLog)
	activityLogs.Delete("/:id", handlers.DeleteActivityLog)

	return app
}

func TestCreateActivityLog(t *testing.T) {
	app := setupTestAppActivityLog()

	room := models.Room{NameRoom: "Test Room", NumberRoom: "001"}
	config.DB.Create(&room)

	report := models.Report{Username: "testuser", PhoneNumber: "123456789", RoomID: room.ID, Constraint: "AC rusak"}
	config.DB.Create(&report)

	var latestReport models.Report
	if err := config.DB.Order("id desc").First(&latestReport).Error; err != nil {
		t.Fatalf("Failed to find latest report: %v", err)
	}
	reportID := latestReport.ID

	token := getAuthToken(t, app)

	requestBody := fmt.Sprintf(`{"action":"Create Report","detail_action":"User created a report","target_report_id":%d}`, reportID)
	req := httptest.NewRequest("POST", "/api/activity-logs", strings.NewReader(requestBody))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+token)
	resp, _ := app.Test(req, -1)

	assert.Equal(t, 201, resp.StatusCode)
}

func TestGetActivityLogs(t *testing.T) {
	app := setupTestAppActivityLog()

	token := getAuthToken(t, app)

	req := httptest.NewRequest("GET", "/api/activity-logs", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	resp, _ := app.Test(req, -1)

	assert.Equal(t, 200, resp.StatusCode)
}

func TestGetActivityLogByID(t *testing.T) {
	app := setupTestAppActivityLog()

	room := models.Room{NameRoom: "Test Room", NumberRoom: "002"}
	config.DB.Create(&room)

	report := models.Report{Username: "testuser", PhoneNumber: "123456789", RoomID: room.ID, Constraint: "Lampu mati"}
	config.DB.Create(&report)

	var latestReport models.Report
	if err := config.DB.Order("id desc").First(&latestReport).Error; err != nil {
		t.Fatalf("Failed to find latest report: %v", err)
	}
	reportID := latestReport.ID

	log := models.ActivityLog{Action: "View Report", DetailAction: "User viewed a report", TargetReportID: reportID}
	config.DB.Create(&log)

	var latestLog models.ActivityLog
	if err := config.DB.Order("id desc").First(&latestLog).Error; err != nil {
		t.Fatalf("Failed to find latest activity log: %v", err)
	}
	logID := latestLog.ID

	token := getAuthToken(t, app)

	req := httptest.NewRequest("GET", fmt.Sprintf("/api/activity-logs/%d", logID), nil)
	req.Header.Set("Authorization", "Bearer "+token)
	resp, _ := app.Test(req, -1)

	assert.Equal(t, 200, resp.StatusCode)
}

func TestUpdateActivityLog(t *testing.T) {
	app := setupTestAppActivityLog()

	room := models.Room{NameRoom: "Test Room", NumberRoom: "003"}
	config.DB.Create(&room)

	report := models.Report{Username: "testuser", PhoneNumber: "123456789", RoomID: room.ID, Constraint: "Lampu redup"}
	config.DB.Create(&report)

	var latestReport models.Report
	if err := config.DB.Order("id desc").First(&latestReport).Error; err != nil {
		t.Fatalf("Failed to find latest report: %v", err)
	}
	reportID := latestReport.ID

	log := models.ActivityLog{Action: "Edit Report", DetailAction: "User edited a report", TargetReportID: reportID}
	config.DB.Create(&log)

	var latestLog models.ActivityLog
	if err := config.DB.Order("id desc").First(&latestLog).Error; err != nil {
		t.Fatalf("Failed to find latest activity log: %v", err)
	}
	logID := latestLog.ID

	token := getAuthToken(t, app)

	requestBody := `{"detail_action":"User changed report status"}`
	req := httptest.NewRequest("PUT", fmt.Sprintf("/api/activity-logs/%d", logID), strings.NewReader(requestBody))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+token)
	resp, _ := app.Test(req, -1)

	assert.Equal(t, 200, resp.StatusCode)
}

func TestDeleteActivityLog(t *testing.T) {
	app := setupTestAppActivityLog()

	room := models.Room{NameRoom: "Test Room", NumberRoom: "004"}
	config.DB.Create(&room)

	report := models.Report{Username: "testuser", PhoneNumber: "123456789", RoomID: room.ID, Constraint: "AC bocor"}
	config.DB.Create(&report)

	var latestReport models.Report
	if err := config.DB.Order("id desc").First(&latestReport).Error; err != nil {
		t.Fatalf("Failed to find latest report: %v", err)
	}
	reportID := latestReport.ID

	log := models.ActivityLog{Action: "Delete Report", DetailAction: "User deleted a report", TargetReportID: reportID}
	config.DB.Create(&log)

	var latestLog models.ActivityLog
	if err := config.DB.Order("id desc").First(&latestLog).Error; err != nil {
		t.Fatalf("Failed to find latest activity log: %v", err)
	}
	logID := latestLog.ID

	token := getAuthToken(t, app)

	req := httptest.NewRequest("DELETE", fmt.Sprintf("/api/activity-logs/%d", logID), nil)
	req.Header.Set("Authorization", "Bearer "+token)
	resp, _ := app.Test(req, -1)

	assert.Equal(t, 200, resp.StatusCode)
}
