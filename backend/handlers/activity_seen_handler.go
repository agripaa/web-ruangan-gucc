package handlers

import (
	"backend/config"
	"backend/models"

	"time"

	"github.com/gofiber/fiber/v2"
)

// GetUnreadNotifications mengambil jumlah notifikasi yang belum dibaca
func GetUnreadNotifications(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)

	// Ambil semua activity_id yang sudah pernah dilihat oleh user ini
	var seenActivityIDs []uint
	if err := config.DB.Model(&models.ActivitySeen{}).
		Where("user_id = ?", userID).
		Pluck("activity_id", &seenActivityIDs).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch seen activity ids"})
	}

	// Ambil hanya activity log yang ditujukan ke user ini dan belum dilihat
	var unreadLogs []models.ActivityLog
	query := config.DB.Preload("User").Preload("Report").
		Model(&models.ActivityLog{}).
		Where("target_user_id = ?", userID) // Pastikan log ini memang untuk user ini

	if len(seenActivityIDs) > 0 {
		query = query.Where("id NOT IN ?", seenActivityIDs)
	}

	if err := query.Order("timestamp DESC").Find(&unreadLogs).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch unread logs"})
	}

	unreadCount := len(unreadLogs)

	return c.JSON(fiber.Map{
		"unread_count": unreadCount,
		"unread_logs":  unreadLogs,
	})
}

func GetUnreadActivityLogs(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)

	// Ambil semua activity log
	var allLogs []models.ActivityLog
	if err := config.DB.Order("timestamp DESC").Limit(15).Find(&allLogs).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch activity logs"})
	}

	// Ambil semua ActivitySeen untuk user ini
	var seenLogs []models.ActivitySeen
	if err := config.DB.Where("user_id = ?", userID).Find(&seenLogs).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch seen logs"})
	}

	seenMap := make(map[uint]bool)
	for _, s := range seenLogs {
		seenMap[s.ActivityID] = true
	}

	var newSeenEntries []models.ActivitySeen
	for _, log := range allLogs {
		if _, alreadySeen := seenMap[log.ID]; !alreadySeen {
			newSeenEntries = append(newSeenEntries, models.ActivitySeen{
				UserID:     userID,
				ActivityID: log.ID,
				IsRead:     false,
				CreatedAt:  time.Now(),
			})
		}
	}

	// Insert semua yang belum ada di seen
	if len(newSeenEntries) > 0 {
		if err := config.DB.Create(&newSeenEntries).Error; err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Failed to create seen logs"})
		}
	}

	// Ambil ulang seen dengan info is_read setelah insert
	var finalSeen []models.ActivitySeen
	if err := config.DB.Where("user_id = ?", userID).Find(&finalSeen).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to re-fetch seen logs"})
	}

	readMap := make(map[uint]bool)
	for _, s := range finalSeen {
		readMap[s.ActivityID] = s.IsRead
	}

	// Gabungkan info log + is_read
	type LogWithSeen struct {
		models.ActivityLog
		IsRead bool `json:"is_read"`
	}

	var result []LogWithSeen
	for _, log := range allLogs {
		result = append(result, LogWithSeen{
			ActivityLog: log,
			IsRead:      readMap[log.ID],
		})
	}

	return c.JSON(result)
}

func MarkAllNotificationsAsRead(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)

	if err := config.DB.Model(&models.ActivitySeen{}).
		Where("user_id = ? AND is_read = ?", userID, false).
		Update("is_read", true).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to mark notifications as read"})
	}

	return c.JSON(fiber.Map{
		"message": "All notifications marked as read",
	})
}

// MarkNotificationAsRead mengubah status notifikasi menjadi terbaca
func MarkNotificationAsRead(c *fiber.Ctx) error {
	id := c.Locals("user_id")

	config.DB.Model(&models.ActivitySeen{}).
		Where("user_id = ? AND is_read = ?", id, false).
		Update("is_read", true)

	return c.JSON(fiber.Map{
		"message": "Notifications marked as read",
	})
}

// CheckNewNotifications mengecek apakah ada notifikasi baru
func CheckNewNotifications(c *fiber.Ctx) error {
	id := c.Locals("user_id")
	var count int64

	config.DB.Model(&models.ActivitySeen{}).
		Where("user_id = ? AND is_read = ?", id, false).
		Count(&count)

	return c.JSON(fiber.Map{
		"has_new": count > 0,
	})
}

func CreateActivitySeen(c *fiber.Ctx) error {
	var activitySeen models.ActivitySeen
	userID, ok := c.Locals("user_id").(uint)

	if err := c.BodyParser(&activitySeen); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	if ok {
		activitySeen.UserID = userID
	} else {
		return c.Status(400).JSON(fiber.Map{"error": "Missing or invalid user_id"})
	}

	result := config.DB.Create(&activitySeen)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create activity log", "details": result.Error.Error()})
	}

	var users []models.User
	if err := config.DB.Select("id").Find(&users).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch users", "details": err.Error()})
	}

	return c.Status(201).JSON(activitySeen)

}
