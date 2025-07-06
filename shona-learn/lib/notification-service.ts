import { PrismaClient } from '@prisma/client'
import { FlashcardService } from './flashcard-service'

const prisma = new PrismaClient()

export interface NotificationData {
  title: string
  body: string
  data?: Record<string, any>
  badge?: number
  sound?: string
  category?: string
}

export interface PushNotificationPayload {
  to: string
  title: string
  body: string
  data?: Record<string, any>
  badge?: number
  sound?: string
  category?: string
}

export interface NotificationPreferences {
  enabledDays: string[]
  startTime: string
  endTime: string
  maxDailyNotifications: number
  intervalMinutes: number
  enabledTypes: string[]
  timezone: string
  deviceTokens: string[]
}

export class NotificationService {
  private static readonly NOTIFICATION_TYPES = {
    REVIEW_DUE: 'review_due',
    NEW_CARDS: 'new_cards',
    STREAK_REMINDER: 'streak_reminder',
    ACHIEVEMENT: 'achievement',
    STUDY_REMINDER: 'study_reminder'
  }

  /**
   * Schedule notifications for a user based on their flashcard review schedule
   */
  static async scheduleReviewNotifications(userId: string) {
    const preferences = await this.getNotificationPreferences(userId)
    if (!preferences || !preferences.enabledTypes.includes(this.NOTIFICATION_TYPES.REVIEW_DUE)) {
      return
    }

    const stats = await FlashcardService.getFlashcardStats(userId)
    const schedule = await FlashcardService.getStudySchedule(userId, 7)

    // Schedule notifications for the next 7 days
    const notifications = []
    const now = new Date()

    for (let i = 0; i < 7; i++) {
      const reviewDate = new Date(now)
      reviewDate.setDate(now.getDate() + i)
      
      const reviewsForDay = schedule[i] || 0
      
      if (reviewsForDay > 0 && this.isNotificationDay(reviewDate, preferences)) {
        const notificationTime = this.calculateNotificationTime(reviewDate, preferences)
        
        notifications.push({
          userId,
          type: this.NOTIFICATION_TYPES.REVIEW_DUE,
          title: this.getReviewTitle(reviewsForDay),
          body: this.getReviewBody(reviewsForDay),
          scheduledTime: notificationTime,
          data: {
            reviewsCount: reviewsForDay,
            type: 'review_due'
          }
        })
      }
    }

    // Send notifications to push service
    for (const notification of notifications) {
      await this.scheduleNotification(notification)
    }

    return notifications
  }

  /**
   * Send immediate notification for streak reminders
   */
  static async sendStreakReminder(userId: string) {
    const preferences = await this.getNotificationPreferences(userId)
    if (!preferences || !preferences.enabledTypes.includes(this.NOTIFICATION_TYPES.STREAK_REMINDER)) {
      return
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { streak: true, name: true }
    })

    if (!user) return

    const notification = {
      userId,
      type: this.NOTIFICATION_TYPES.STREAK_REMINDER,
      title: "Don't break your streak! 🔥",
      body: `You have a ${user.streak} day streak going. Keep it up!`,
      data: {
        streak: user.streak,
        type: 'streak_reminder'
      }
    }

    await this.sendNotification(notification)
  }

  /**
   * Send achievement notification
   */
  static async sendAchievementNotification(userId: string, achievement: {
    title: string
    description: string
    type: string
  }) {
    const preferences = await this.getNotificationPreferences(userId)
    if (!preferences || !preferences.enabledTypes.includes(this.NOTIFICATION_TYPES.ACHIEVEMENT)) {
      return
    }

    const notification = {
      userId,
      type: this.NOTIFICATION_TYPES.ACHIEVEMENT,
      title: `🎉 ${achievement.title}`,
      body: achievement.description,
      data: {
        achievementType: achievement.type,
        type: 'achievement'
      }
    }

    await this.sendNotification(notification)
  }

  /**
   * Send study reminder notification
   */
  static async sendStudyReminder(userId: string) {
    const preferences = await this.getNotificationPreferences(userId)
    if (!preferences || !preferences.enabledTypes.includes(this.NOTIFICATION_TYPES.STUDY_REMINDER)) {
      return
    }

    const stats = await FlashcardService.getFlashcardStats(userId)
    
    const notification = {
      userId,
      type: this.NOTIFICATION_TYPES.STUDY_REMINDER,
      title: "Time to practice Shona! 📚",
      body: `You have ${stats.dueCards} cards ready for review`,
      data: {
        dueCards: stats.dueCards,
        type: 'study_reminder'
      }
    }

    await this.sendNotification(notification)
  }

  /**
   * Get notification preferences for a user
   */
  static async getNotificationPreferences(userId: string): Promise<NotificationPreferences | null> {
    const prefs = await prisma.notificationPreference.findUnique({
      where: { userId }
    })

    if (!prefs) return null

    return {
      enabledDays: prefs.enabledDays ? JSON.parse(prefs.enabledDays) : [],
      startTime: prefs.startTime,
      endTime: prefs.endTime,
      maxDailyNotifications: prefs.maxDailyNotifications,
      intervalMinutes: prefs.intervalMinutes,
      enabledTypes: prefs.enabledTypes ? JSON.parse(prefs.enabledTypes) : [],
      timezone: prefs.timezone,
      deviceTokens: prefs.deviceTokens ? JSON.parse(prefs.deviceTokens) : []
    }
  }

  /**
   * Update notification preferences
   */
  static async updateNotificationPreferences(userId: string, preferences: Partial<NotificationPreferences>) {
    const updateData: any = {}

    if (preferences.enabledDays) {
      updateData.enabledDays = JSON.stringify(preferences.enabledDays)
    }
    if (preferences.startTime) {
      updateData.startTime = preferences.startTime
    }
    if (preferences.endTime) {
      updateData.endTime = preferences.endTime
    }
    if (preferences.maxDailyNotifications !== undefined) {
      updateData.maxDailyNotifications = preferences.maxDailyNotifications
    }
    if (preferences.intervalMinutes !== undefined) {
      updateData.intervalMinutes = preferences.intervalMinutes
    }
    if (preferences.enabledTypes) {
      updateData.enabledTypes = JSON.stringify(preferences.enabledTypes)
    }
    if (preferences.timezone) {
      updateData.timezone = preferences.timezone
    }
    if (preferences.deviceTokens) {
      updateData.deviceTokens = JSON.stringify(preferences.deviceTokens)
    }

    return prisma.notificationPreference.upsert({
      where: { userId },
      update: updateData,
      create: {
        userId,
        ...updateData
      }
    })
  }

  /**
   * Register device token for push notifications
   */
  static async registerDeviceToken(userId: string, token: string) {
    const preferences = await this.getNotificationPreferences(userId)
    let deviceTokens = preferences?.deviceTokens || []
    
    if (!deviceTokens.includes(token)) {
      deviceTokens.push(token)
      await this.updateNotificationPreferences(userId, { deviceTokens })
    }
  }

  /**
   * Send push notification to all user devices
   */
  private static async sendNotification(notification: {
    userId: string
    type: string
    title: string
    body: string
    data?: Record<string, any>
  }) {
    const preferences = await this.getNotificationPreferences(notification.userId)
    if (!preferences || !preferences.deviceTokens.length) {
      return
    }

    // Log notification
    await prisma.notificationLog.create({
      data: {
        userId: notification.userId,
        type: notification.type,
        title: notification.title,
        body: notification.body,
        data: notification.data ? JSON.stringify(notification.data) : null,
        success: true
      }
    })

    // Send to each device
    const pushPromises = preferences.deviceTokens.map(token => 
      this.sendPushNotification({
        to: token,
        title: notification.title,
        body: notification.body,
        data: notification.data,
        badge: 1,
        sound: 'default',
        category: notification.type
      })
    )

    await Promise.all(pushPromises)
  }

  /**
   * Schedule notification for later delivery
   */
  private static async scheduleNotification(notification: {
    userId: string
    type: string
    title: string
    body: string
    scheduledTime: Date
    data?: Record<string, any>
  }) {
    // In a real implementation, this would integrate with a job queue
    // For now, we'll just log the scheduled notification
    console.log(`Scheduling notification for ${notification.userId} at ${notification.scheduledTime}:`, {
      title: notification.title,
      body: notification.body,
      type: notification.type
    })

    // You would typically use a job queue like Bull, Agenda, or similar
    // to schedule these notifications
  }

  /**
   * Send push notification via push service (Expo, FCM, etc.)
   */
  private static async sendPushNotification(payload: PushNotificationPayload) {
    // This is a placeholder for actual push notification service integration
    // You would integrate with Expo Push Notifications, Firebase Cloud Messaging, etc.
    
    console.log('Sending push notification:', payload)
    
    // Example for Expo Push Notifications:
    // const response = await fetch('https://exp.host/--/api/v2/push/send', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(payload),
    // })
    
    return { success: true }
  }

  /**
   * Check if notification should be sent on this day
   */
  private static isNotificationDay(date: Date, preferences: NotificationPreferences): boolean {
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
    return preferences.enabledDays.includes(dayName)
  }

  /**
   * Calculate notification time based on preferences
   */
  private static calculateNotificationTime(date: Date, preferences: NotificationPreferences): Date {
    const [startHour, startMinute] = preferences.startTime.split(':').map(Number)
    const [endHour, endMinute] = preferences.endTime.split(':').map(Number)
    
    // Calculate a random time within the allowed window
    const startTime = startHour * 60 + startMinute
    const endTime = endHour * 60 + endMinute
    const randomTime = Math.random() * (endTime - startTime) + startTime
    
    const notificationDate = new Date(date)
    notificationDate.setHours(Math.floor(randomTime / 60))
    notificationDate.setMinutes(Math.floor(randomTime % 60))
    notificationDate.setSeconds(0)
    
    return notificationDate
  }

  /**
   * Generate review notification title
   */
  private static getReviewTitle(reviewCount: number): string {
    if (reviewCount === 1) {
      return "Time to review! 📝"
    } else if (reviewCount < 5) {
      return "Cards ready for review! 📚"
    } else {
      return "Lots of cards to review! 🎯"
    }
  }

  /**
   * Generate review notification body
   */
  private static getReviewBody(reviewCount: number): string {
    if (reviewCount === 1) {
      return "You have 1 Shona card ready for review"
    } else {
      return `You have ${reviewCount} Shona cards ready for review`
    }
  }

  /**
   * Process notifications for all users (to be run periodically)
   */
  static async processScheduledNotifications() {
    const users = await prisma.user.findMany({
      where: {
        notificationPreferences: {
          isNot: null
        }
      },
      select: { id: true }
    })

    for (const user of users) {
      await this.scheduleReviewNotifications(user.id)
    }
  }
}

export default NotificationService