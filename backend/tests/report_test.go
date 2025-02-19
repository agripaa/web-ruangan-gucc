package tests

import (
	"backend/config"
	"backend/models"
	"encoding/json"
	"fmt"
	"net/http"
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
	return app
}

func TestCreateReport(t *testing.T) {
	app := setupTestAppReport()

	requestBody := `{"username":"testuser","phone_number":"123456789","room":"D423","campus_id":1,"description":"AC rusak"}`
	req := httptest.NewRequest("POST", "/api/reports", strings.NewReader(requestBody))
	req.Header.Set("Content-Type", "application/json")

	resp, _ := app.Test(req, -1)
	assert.Equal(t, http.StatusCreated, resp.StatusCode)
}

func TestGetReports(t *testing.T) {
	app := setupTestAppReport()
	req := httptest.NewRequest("GET", "/api/reports", nil)
	resp, _ := app.Test(req, -1)
	assert.Equal(t, http.StatusOK, resp.StatusCode)
}

func TestGetReportByID(t *testing.T) {
	app := setupTestAppReport()
	report := models.Report{Token: "TOKEN123", Username: "testuser", PhoneNumber: "123456789", Room: "D423", CampusID: 1, Description: "Lampu mati"}
	config.DB.Create(&report)

	var latestReport models.Report
	config.DB.Order("id desc").First(&latestReport)
	reportID := latestReport.ID

	req := httptest.NewRequest("GET", fmt.Sprintf("/api/reports/%d", reportID), nil)
	resp, _ := app.Test(req, -1)
	assert.Equal(t, http.StatusOK, resp.StatusCode)
}

func TestGetReportPagination(t *testing.T) {
	app := setupTestAppReport()
	req := httptest.NewRequest("GET", "/api/reports?page=1&limit=10", nil)
	resp, _ := app.Test(req, -1)
	assert.Equal(t, http.StatusOK, resp.StatusCode)
}

func TestSearchReportByToken(t *testing.T) {
	app := setupTestAppReport()
	report := models.Report{Token: "TOKEN123", Username: "testuser", PhoneNumber: "123456789", Room: "D423", CampusID: 1, Description: "Testing token search"}
	config.DB.Create(&report)

	req := httptest.NewRequest("GET", "/api/reports/search?token=TOKEN123", nil)
	resp, _ := app.Test(req, -1)
	assert.Equal(t, http.StatusOK, resp.StatusCode)

	var body map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&body)
	assert.Greater(t, len(body), 0, "Should return at least one report")
}

func TestCreateActivityLogWithValidReport(t *testing.T) {
	app := setupTestAppReport()
	report := models.Report{Token: "TOKEN123", Username: "testuser", PhoneNumber: "123456789", Room: "D423", CampusID: 1, Description: "AC rusak"}
	config.DB.Create(&report)

	var latestReport models.Report
	config.DB.Order("id desc").First(&latestReport)
	reportID := latestReport.ID

	requestBody := fmt.Sprintf(`{"action":"Create Report","detail_action":"User created a report","target_report_id":%d}`, reportID)
	req := httptest.NewRequest("POST", "/api/activity-logs", strings.NewReader(requestBody))
	req.Header.Set("Content-Type", "application/json")

	resp, _ := app.Test(req, -1)
	assert.Equal(t, http.StatusCreated, resp.StatusCode)
}
