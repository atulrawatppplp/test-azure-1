import { useState } from 'react'
import { PageHeader } from '../components/layout/PageHeader'
import { Badge } from '../components/ui/Badge'
import type { BadgeTone } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { EmptyState, ErrorState, Loading } from '../components/ui/States'
import { useAsync } from '../hooks/useAsync'
import { useToast } from '../hooks/useToast'
import { cn, relativeTime } from '../lib/format'
import { notificationService } from '../services/notificationService'
import type { Notification } from '../types'

const tones: Record<Notification['type'], BadgeTone> = {
  info: 'info',
  success: 'success',
  warning: 'warning',
  error: 'danger',
}

export default function Notifications() {
  const toast = useToast()
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const { data, isLoading, error, reload } = useAsync(() => notificationService.getNotifications(), [])

  const notifications = (data ?? []).filter(
    (notification) => filter === 'all' || !notification.isRead,
  )
  const unreadCount = (data ?? []).filter((notification) => !notification.isRead).length

  const markRead = async (notificationId: string) => {
    await notificationService.markAsRead(notificationId)
    reload()
  }

  const markAllRead = async () => {
    await notificationService.markAllAsRead()
    toast.success('All notifications marked as read')
    reload()
  }

  return (
    <>
      <PageHeader
        title="Notifications"
        description="Events published by the Notification Service."
        actions={
          <>
            <Button variant="outline" onClick={() => setFilter(filter === 'all' ? 'unread' : 'all')}>
              {filter === 'all' ? 'Show unread' : 'Show all'}
            </Button>
            <Button disabled={unreadCount === 0} onClick={markAllRead}>
              Mark all read
            </Button>
          </>
        }
      />

      <Card bodyClassName="p-0 sm:p-0">
        {isLoading ? (
          <Loading />
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : notifications.length === 0 ? (
          <EmptyState title="Nothing here" description="You are all caught up." />
        ) : (
          <ul className="divide-y divide-slate-100">
            {notifications.map((notification) => (
              <li
                key={notification.notificationId}
                className={cn('flex gap-3 px-4 py-3.5 sm:px-5', !notification.isRead && 'bg-sky-50/50')}
              >
                <span
                  className={cn(
                    'mt-1.5 h-2 w-2 shrink-0 rounded-full',
                    notification.isRead ? 'bg-slate-300' : 'bg-sky-500',
                  )}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900">{notification.title}</p>
                    <Badge tone={tones[notification.type]}>{notification.type}</Badge>
                    <span className="text-xs text-slate-400">{relativeTime(notification.createdDate)}</span>
                  </div>
                  <p className="mt-0.5 text-sm text-slate-600">{notification.message}</p>
                </div>
                {!notification.isRead && (
                  <Button size="sm" variant="ghost" onClick={() => markRead(notification.notificationId)}>
                    Mark read
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  )
}
