package middlewares

import (
	"os"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

var jwtSecret = []byte(getSecretKey())

func getSecretKey() string {
	secret := os.Getenv("SECRET_KEY")
	if secret == "" {
		secret = "gucc2025"
	}
	return secret
}

func AuthMiddleware(c *fiber.Ctx) error {
	authHeader := c.Get("Authorization")
	if authHeader == "" {
		return c.Status(401).JSON(fiber.Map{"status": 401, "error": "Unauthorized - No Token Provided"})
	}

	parts := strings.Split(authHeader, " ")
	if len(parts) != 2 || parts[0] != "Bearer" {
		return c.Status(401).JSON(fiber.Map{"status": 401, "error": "Unauthorized - Invalid Token Format"})
	}
	tokenString := parts[1]

	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return jwtSecret, nil
	})

	if err != nil || !token.Valid {
		return c.Status(401).JSON(fiber.Map{"status": 401, "error": "Unauthorized - Invalid Token"})
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok || !token.Valid {
		return c.Status(401).JSON(fiber.Map{"status": 401, "error": "Unauthorized - Invalid Token Claims"})
	}

	userID, ok := claims["user_id"].(float64)
	if !ok {
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized - Missing User ID"})
	}

	c.Locals("user_id", uint(userID))
	return c.Next()
}

func AdminMiddleware(c *fiber.Ctx) error {
	authHeader := c.Get("Authorization")
	if authHeader == "" {
		return c.Status(401).JSON(fiber.Map{"status": 401, "error": "Unauthorized - No Token Provided"})
	}

	parts := strings.Split(authHeader, " ")
	if len(parts) != 2 || parts[0] != "Bearer" {
		return c.Status(401).JSON(fiber.Map{"status": 401, "error": "Unauthorized - Invalid Token Format"})
	}
	tokenString := parts[1]

	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return jwtSecret, nil
	})

	if err != nil || !token.Valid {
		return c.Status(401).JSON(fiber.Map{"status": 401, "error": "Unauthorized - Invalid Token"})
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok || !token.Valid {
		return c.Status(401).JSON(fiber.Map{"status": 401, "error": "Unauthorized - Invalid Token Claims"})
	}

	userID, ok := claims["user_id"].(float64)
	role, roleOk := claims["role"].(string)

	if !ok || !roleOk {
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized - Missing User ID or Role"})
	}

	// Cek apakah user adalah admin
	if role != "admin" {
		return c.Status(403).JSON(fiber.Map{"error": "Forbidden - Admin Only"})
	}

	c.Locals("user_id", uint(userID))
	c.Locals("role", role)

	return c.Next()
}
