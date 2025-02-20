package tests

import (
	"backend/config"
	"backend/handlers"
	"backend/middlewares"
	"backend/models"
	"testing"

	"encoding/json"
	"io/ioutil"
	"net/http"
	"net/http/httptest"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/stretchr/testify/assert"
	"golang.org/x/crypto/bcrypt"
)

func setupTestApp() *fiber.App {
	app := fiber.New()

	config.ConnectDB()
	models.MigrateUsers(config.DB)

	config.DB.Where("username = ?", "testuser").Delete(&models.User{})

	app.Post("/api/register", handlers.Register)
	app.Post("/api/login", handlers.Login)

	app.Get("/api/protected", middlewares.AuthMiddleware, func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"message": "Protected route accessed"})
	})

	return app
}

func TestGetProfile(t *testing.T) {
	app := setupTestAppReport()
	token := getAuthToken(t, app) // Pastikan fungsi ini sudah tersedia

	req := httptest.NewRequest("GET", "/api/user/profile", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	resp, _ := app.Test(req, -1)

	assert.Equal(t, http.StatusOK, resp.StatusCode)

	var response map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&response)

	assert.NotNil(t, response["username"])
	assert.NotNil(t, response["phone_number"])
	assert.NotNil(t, response["role"])
}

func TestRegister(t *testing.T) {
	app := setupTestApp()

	requestBody := `{"username":"testuser","password":"password123"}`
	req := httptest.NewRequest("POST", "/api/register", strings.NewReader(requestBody))
	req.Header.Set("Content-Type", "application/json")
	resp, _ := app.Test(req, -1)

	assert.Equal(t, 200, resp.StatusCode)
}

func TestLogin(t *testing.T) {
	app := setupTestApp()

	config.DB.Where("username = ?", "testuser").Delete(&models.User{})

	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
	user := models.User{Username: "testuser", Password: string(hashedPassword)}
	config.DB.Create(&user)

	requestBody := `{"username":"testuser","password":"password123"}`
	req := httptest.NewRequest("POST", "/api/login", strings.NewReader(requestBody))
	req.Header.Set("Content-Type", "application/json")
	resp, _ := app.Test(req, -1)

	assert.Equal(t, 200, resp.StatusCode)
}

func TestProtectedRouteWithoutToken(t *testing.T) {
	app := setupTestApp()

	req := httptest.NewRequest("GET", "/api/protected", nil)
	resp, _ := app.Test(req, -1)

	assert.Equal(t, 401, resp.StatusCode)
}

func TestProtectedRouteWithToken(t *testing.T) {
	app := setupTestApp()

	config.DB.Where("username = ?", "testuser").Delete(&models.User{})

	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
	user := models.User{Username: "testuser", Password: string(hashedPassword)}
	config.DB.Create(&user)

	loginRequest := `{"username":"testuser","password":"password123"}`
	req := httptest.NewRequest("POST", "/api/login", strings.NewReader(loginRequest))
	req.Header.Set("Content-Type", "application/json")
	resp, _ := app.Test(req, -1)

	token := extractTokenFromResponse(resp)
	assert.NotEmpty(t, token)

	t.Logf("Received Token: %s", token)

	protectedReq := httptest.NewRequest("GET", "/api/protected", nil)
	protectedReq.Header.Set("Authorization", "Bearer "+token)
	protectedResp, _ := app.Test(protectedReq, -1)

	t.Logf("Protected Route Response Status: %d", protectedResp.StatusCode)

	assert.Equal(t, 200, protectedResp.StatusCode)
}

func extractTokenFromResponse(resp *http.Response) string {
	bodyBytes, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return ""
	}
	defer resp.Body.Close()

	var responseMap map[string]interface{}
	err = json.Unmarshal(bodyBytes, &responseMap)
	if err != nil {
		return ""
	}

	token, exists := responseMap["token"].(string)
	if !exists {
		return ""
	}
	return token
}

func getAuthToken(t *testing.T, app *fiber.App) string {
	// Hapus user sebelumnya
	config.DB.Where("username = ?", "testuser").Delete(&models.User{})

	// Hash password "password123" dengan bcrypt
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
	user := models.User{Username: "testuser", Password: string(hashedPassword)}
	config.DB.Create(&user)

	// Request login
	loginRequest := `{"username":"testuser","password":"password123"}`
	req := httptest.NewRequest("POST", "/api/login", strings.NewReader(loginRequest))
	req.Header.Set("Content-Type", "application/json")
	resp, _ := app.Test(req, -1)

	// Baca response body
	bodyBytes, _ := ioutil.ReadAll(resp.Body)
	defer resp.Body.Close()

	// Debug: Tampilkan response body jika login gagal
	t.Logf("Login Response: %s", string(bodyBytes))

	// Parse JSON response
	var responseMap map[string]interface{}
	err := json.Unmarshal(bodyBytes, &responseMap)
	assert.Nil(t, err)

	token, exists := responseMap["token"].(string)
	assert.True(t, exists, "Token should exist in response")
	assert.NotEmpty(t, token, "Token should not be empty")

	// Debug: Pastikan token tidak kosong
	t.Logf("Received Token: %s", token)

	return token
}
