package tests

import (
	"backend/config"
	"backend/handlers"
	"backend/middlewares"
	"backend/models"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http/httptest"
	"strings"
	"testing"

	"golang.org/x/crypto/bcrypt"

	"github.com/gofiber/fiber/v2"
	"github.com/stretchr/testify/assert"
)

func setupTestAppRoom() *fiber.App {
	app := fiber.New()

	config.ConnectDB()
	models.MigrateRooms(config.DB)

	config.DB.Exec("DELETE FROM reports")
	config.DB.Exec("DELETE FROM rooms")

	app.Post("/api/login", handlers.Login)

	rooms := app.Group("/api/rooms", middlewares.AuthMiddleware)
	rooms.Get("/", handlers.GetRooms)
	rooms.Get("/:id", handlers.GetRoomByID)
	rooms.Post("/", handlers.CreateRoom)
	rooms.Put("/:id", handlers.UpdateRoom)
	rooms.Delete("/:id", handlers.DeleteRoom)

	return app
}

func TestCreateRoom(t *testing.T) {
	app := setupTestAppRoom()

	token := getAuthToken(t, app)

	requestBody := `{"name_room":"Conference Room","number_room":"101","is_ready":true}`
	req := httptest.NewRequest("POST", "/api/rooms", strings.NewReader(requestBody))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+token)
	resp, _ := app.Test(req, -1)

	assert.Equal(t, 201, resp.StatusCode)
}

func TestGetRooms(t *testing.T) {
	app := setupTestAppRoom()

	token := getAuthToken(t, app)

	req := httptest.NewRequest("GET", "/api/rooms", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	resp, _ := app.Test(req, -1)

	assert.Equal(t, 200, resp.StatusCode)
}

func TestGetRoomByID(t *testing.T) {
	app := setupTestAppRoom()

	// Buat room agar ada yang bisa diambil
	room := models.Room{NameRoom: "Meeting Room", NumberRoom: "102", IsReady: true}
	config.DB.Create(&room)

	// Cari ID room terbaru
	var latestRoom models.Room
	config.DB.Order("id desc").First(&latestRoom)
	roomID := latestRoom.ID

	token := getAuthToken(t, app)

	req := httptest.NewRequest("GET", fmt.Sprintf("/api/rooms/%d", roomID), nil)
	req.Header.Set("Authorization", "Bearer "+token)
	resp, _ := app.Test(req, -1)

	assert.Equal(t, 200, resp.StatusCode)
}

func TestUpdateRoom(t *testing.T) {
	app := setupTestAppRoom()

	// Buat room untuk diupdate
	room := models.Room{NameRoom: "Training Room", NumberRoom: "103", IsReady: true}
	config.DB.Create(&room)

	// Cari ID terbaru
	var latestRoom models.Room
	config.DB.Order("id desc").First(&latestRoom)
	roomID := latestRoom.ID

	token := getAuthToken(t, app)

	requestBody := `{"name_room":"Updated Room","number_room":"105","is_ready":false}`
	req := httptest.NewRequest("PUT", fmt.Sprintf("/api/rooms/%d", roomID), strings.NewReader(requestBody))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+token)
	resp, _ := app.Test(req, -1)

	assert.Equal(t, 200, resp.StatusCode)
}

func TestDeleteRoom(t *testing.T) {
	app := setupTestAppRoom()

	// Buat room untuk dihapus
	room := models.Room{NameRoom: "To Be Deleted", NumberRoom: "104", IsReady: true}
	config.DB.Create(&room)

	// Cari ID terbaru
	var latestRoom models.Room
	config.DB.Order("id desc").First(&latestRoom)
	roomID := latestRoom.ID

	token := getAuthToken(t, app)

	req := httptest.NewRequest("DELETE", fmt.Sprintf("/api/rooms/%d", roomID), nil)
	req.Header.Set("Authorization", "Bearer "+token)
	resp, _ := app.Test(req, -1)

	assert.Equal(t, 200, resp.StatusCode)
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
