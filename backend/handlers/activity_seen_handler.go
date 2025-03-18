package handlers

import (
	"backend/config"
	"backend/models"
	"github.com/gofiber/fiber/v2"
)

// GetUnreadNotifications mengambil jumlah notifikasi yang belum dibaca
func GetUnreadNotifications(c *fiber.Ctx) error {
	id := c.Params("id")
	var count int64

	config.DB.Model(&models.ActivitySeen{}).
		Where("user_id = ? AND is_read = ?", id, false).
		Count(&count)

	return c.JSON(fiber.Map{
		"unread_count": count,
	})
}

// MarkNotificationAsRead mengubah status notifikasi menjadi terbaca
func MarkNotificationAsRead(c *fiber.Ctx) error {
	id := c.Params("id")

	config.DB.Model(&models.ActivitySeen{}).
		Where("user_id = ? AND is_read = ?", id, false).
		Update("is_read", true)

	return c.JSON(fiber.Map{
		"message": "Notifications marked as read",
	})
}

// CheckNewNotifications mengecek apakah ada notifikasi baru
func CheckNewNotifications(c *fiber.Ctx) error {
	id := c.Params("id")
	var count int64

	config.DB.Model(&models.ActivitySeen{}).
		Where("user_id = ? AND is_read = ?", id, false).
		Count(&count)

	return c.JSON(fiber.Map{
		"has_new": count > 0,
	})
}
