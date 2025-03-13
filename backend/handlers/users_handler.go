package handlers

import (
	"backend/config"
	"backend/models"
	"bytes"
	"encoding/json"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

var jwtSecret = []byte(getSecretKey())

func getSecretKey() string {
	secret := os.Getenv("SECRET_KEY")
	if secret == "" {
		secret = "gucc2025"
	}
	return secret
}

type AuthRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type RegisterRequest struct {
	AuthRequest
	PhoneNumber string `json:"phone_number"`
}

type LoginRequest struct {
	Token    string `json:"token"`
	ClientID string `json:"client_id"`
}

func Register(c *fiber.Ctx) error {
	var request RegisterRequest
	if err := c.BodyParser(&request); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(request.Password), bcrypt.DefaultCost)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to hash password"})
	}

	user := models.User{
		Username:    request.Username,
		Password:    string(hashedPassword),
		PhoneNumber: request.PhoneNumber,
		Role:        "user",
	}

	result := config.DB.Create(&user)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create user"})
	}

	return c.JSON(fiber.Map{"message": "User registered successfully"})
}

func Login(c *fiber.Ctx) error {
	var request LoginRequest
	if err := c.BodyParser(&request); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Field Cannot Be null!"})
	}

	if request.Token == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Token is required!"})
	}

	data := map[string]string{
		"client_id":     os.Getenv("CLIENT_ID"),
		"client_secret": os.Getenv("CLIENT_SECRET_KEY"),
		"token":         request.Token,
	}
	jsonData, err := json.Marshal(data)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to encode JSON"})
	}

	req, err := http.NewRequest("POST", os.Getenv("HTTP_API_LOGIN_ADMIN"), bytes.NewBuffer(jsonData))
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create request"})
	}

	req.Header.Add("Content-Type", "application/json")

	client := &http.Client{Timeout: 10 * time.Second}
	res, err := client.Do(req)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to verify token"})
	}
	defer res.Body.Close()

	if res.StatusCode == http.StatusNotFound {
		return c.Status(404).JSON(fiber.Map{"error": "Endpoint not found, check the URL"})
	}

	var apiResponse map[string]interface{}
	if err := json.NewDecoder(res.Body).Decode(&apiResponse); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to parse response"})
	}

	userData, ok := apiResponse["user"].(map[string]interface{})
	if !ok {
		return c.Status(500).JSON(fiber.Map{"error": "Invalid response format"})
	}

	var user models.User

	adminID, _ := userData["id"].(float64)
	username, _ := userData["username"].(string)

	result := config.DB.Where("admin_id = ?", uint(adminID)).First(&user)

	if result.Error != nil {
		newUser := models.User{
			Username: username,
			AdminID:  uint(adminID),
			Role:     "admin",
		}

		if err := config.DB.Create(&newUser).Error; err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Failed to create new user"})
		}

		user = newUser
	}

	token := jwt.New(jwt.SigningMethodHS256)
	claims := token.Claims.(jwt.MapClaims)
	claims["user_id"] = user.ID
	claims["username"] = user.Username
	claims["role"] = user.Role
	claims["exp"] = time.Now().Add(time.Hour * 24).Unix()

	tokenString, err := token.SignedString(jwtSecret)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to generate token"})
	}

	return c.JSON(fiber.Map{"token": tokenString})
}

func LoginUser(c *fiber.Ctx) error {
	var request AuthRequest
	if err := c.BodyParser(&request); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	var user models.User
	result := config.DB.Where("username = ?", request.Username).First(&user)
	if result.Error != nil {
		return c.Status(401).JSON(fiber.Map{"error": "Invalid credentials"})
	}

	err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(request.Password))
	if err != nil {
		return c.Status(401).JSON(fiber.Map{"error": "Invalid credentials"})
	}

	token := jwt.New(jwt.SigningMethodHS256)
	claims := token.Claims.(jwt.MapClaims)
	claims["user_id"] = user.ID
	claims["username"] = user.Username
	claims["exp"] = time.Now().Add(time.Hour * 24).Unix()

	tokenString, err := token.SignedString(jwtSecret)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to generate token"})
	}

	return c.JSON(fiber.Map{"token": tokenString})
}

func GetProfile(c *fiber.Ctx) error {
	userID := c.Locals("user_id")
	if userID == nil {
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized - No User Found"})
	}

	var user models.User
	if err := config.DB.First(&user, userID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "User not found"})
	}

	return c.JSON(fiber.Map{
		"id":           user.ID,
		"username":     user.Username,
		"phone_number": user.PhoneNumber,
		"role":         user.Role,
	})
}

func GetAdmins(c *fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "10"))
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	}
	offset := (page - 1) * limit

	var admins []models.User
	var total int64

	config.DB.Where("role = ?", "admin").Offset(offset).Limit(limit).Find(&admins)
	config.DB.Model(&models.User{}).Where("role = ?", "admin").Count(&total)

	return c.JSON(fiber.Map{
		"data":  admins,
		"page":  page,
		"limit": limit,
		"total": total,
	})
}

func CreateAdmin(c *fiber.Ctx) error {
	var request RegisterRequest
	if err := c.BodyParser(&request); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(request.Password), bcrypt.DefaultCost)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to hash password"})
	}

	admin := models.User{
		Username:    request.Username,
		Password:    string(hashedPassword),
		PhoneNumber: request.PhoneNumber,
		Role:        "admin",
	}

	result := config.DB.Create(&admin)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create admin"})
	}

	return c.JSON(fiber.Map{"message": "Admin created successfully", "admin": admin})
}

func UpdateAdmin(c *fiber.Ctx) error {
	id := c.Params("id")
	var admin models.User

	if err := config.DB.First(&admin, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Admin not found"})
	}

	var request RegisterRequest
	if err := c.BodyParser(&request); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	admin.Username = request.Username
	admin.PhoneNumber = request.PhoneNumber

	if request.Password != "" {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(request.Password), bcrypt.DefaultCost)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Failed to hash password"})
		}
		admin.Password = string(hashedPassword)
	}

	config.DB.Save(&admin)
	return c.JSON(fiber.Map{"message": "Admin updated successfully", "admin": admin})
}

func DeleteAdmin(c *fiber.Ctx) error {
	id := c.Params("id")
	var admin models.User

	if err := config.DB.First(&admin, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Admin not found"})
	}

	config.DB.Delete(&admin)
	return c.JSON(fiber.Map{"message": "Admin deleted successfully"})
}
