import { apiClient } from '../lib/apiClient'
import { config } from '../lib/config'
import type { Notification } from '../types'
import { delay, getDb, saveDb } from './mock/mockDb'

export const notificationService = {
  async getNotifications(): Promise<Notification[]> {
    if (!config.useMockApi) return apiClient.get<Notification[]>('/api/notifications')
    await delay()
    return [...getDb().notifications].sort(
      (a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime(),
    )
  },

  async getUnreadCount(): Promise<number> {
    const notifications = await notificationService.getNotifications()
    return notifications.filter((notification) => !notification.isRead).length
  },

  async markAsRead(notificationId: string): Promise<void> {
    if (!config.useMockApi) return apiClient.post<void>(`/api/notifications/${notificationId}/read`)
    await delay(150)
    const notification = getDb().notifications.find(
      (candidate) => candidate.notificationId === notificationId,
    )
    if (notification) notification.isRead = true
    saveDb()
  },

  async markAllAsRead(): Promise<void> {
    if (!config.useMockApi) return apiClient.post<void>('/api/notifications/read-all')
    await delay(200)
    for (const notification of getDb().notifications) notification.isRead = true
    saveDb()
  },
}
