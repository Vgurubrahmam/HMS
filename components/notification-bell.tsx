"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu"
import { Bell, Calendar, Clock, AlertTriangle, Info, CheckCircle, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useDeadlineAlerts } from "@/hooks/use-live-status"
import { useHackathons } from "@/hooks/use-hackathons"
import { useRegistrations } from "@/hooks/use-registrations"
import { useCurrentUser } from "@/hooks/use-current-user"

interface Notification {
  id: string
  type: 'registration_deadline' | 'payment_deadline' | 'event_ending' | 'event_starting' | 'general'
  title: string
  message: string
  priority: 'high' | 'medium' | 'low'
  timestamp: Date
  read: boolean
  actionUrl?: string
}

interface NotificationBellProps {
  className?: string
}

export function NotificationBell({ className }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  
  const { userData } = useCurrentUser()
  const { hackathons } = useHackathons({ limit: 50 })
  const { registrations } = useRegistrations({ 
    user: userData?.id,
    limit: 20 
  })
  
  // Use the existing deadline alerts hook
  const deadlineAlerts = useDeadlineAlerts(hackathons, registrations)

  // Convert deadline alerts to notifications
  useEffect(() => {
    const notificationList: Notification[] = []

    // Add deadline alerts as notifications
    deadlineAlerts.forEach((alert, index) => {
      notificationList.push({
        id: `alert-${index}`,
        type: alert.type,
        title: getNotificationTitle(alert.type),
        message: alert.message,
        priority: alert.priority,
        timestamp: new Date(),
        read: false,
        actionUrl: getActionUrl(alert.type)
      })
    })

    // Add event ending notifications for events ending today or soon
    hackathons.forEach((hackathon: any) => {
      if (hackathon.endDate) {
        const now = new Date()
        const endDate = new Date(hackathon.endDate)
        const daysUntilEnd = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        
        // Event ending today
        if (daysUntilEnd === 0 && endDate >= now) {
          notificationList.push({
            id: `ending-today-${hackathon._id}`,
            type: 'event_ending',
            title: 'Event Ending Today',
            message: `"${hackathon.title}" ends today`,
            priority: 'high',
            timestamp: new Date(),
            read: false,
            actionUrl: `/dashboard/student/hackathons`
          })
        }
        // Event ending tomorrow
        else if (daysUntilEnd === 1) {
          notificationList.push({
            id: `ending-tomorrow-${hackathon._id}`,
            type: 'event_ending',
            title: 'Event Ending Tomorrow',
            message: `"${hackathon.title}" ends tomorrow`,
            priority: 'medium',
            timestamp: new Date(),
            read: false,
            actionUrl: `/dashboard/student/hackathons`
          })
        }
      }
    })

    // Sort by priority and timestamp
    notificationList.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      }
      return b.timestamp.getTime() - a.timestamp.getTime()
    })

    setNotifications(notificationList)
  }, [deadlineAlerts, hackathons])

  const getNotificationTitle = (type: string): string => {
    switch (type) {
      case 'registration_deadline':
        return 'Registration Deadline'
      case 'payment_deadline':
        return 'Payment Due'
      case 'event_starting':
        return 'Event Starting'
      case 'event_ending':
        return 'Event Ending'
      default:
        return 'Notification'
    }
  }

  const getActionUrl = (type: string): string => {
    switch (type) {
      case 'registration_deadline':
        return '/dashboard/student/hackathons'
      case 'payment_deadline':
        return '/dashboard/student/payments'
      case 'event_starting':
      case 'event_ending':
        return '/dashboard/student/hackathons'
      default:
        return '/dashboard/student'
    }
  }

  const getNotificationIcon = (type: string, priority: string) => {
    if (priority === 'high') {
      return <AlertTriangle className="h-4 w-4 text-red-500" />
    }
    
    switch (type) {
      case 'registration_deadline':
      case 'payment_deadline':
        return <Clock className="h-4 w-4 text-orange-500" />
      case 'event_ending':
      case 'event_starting':
        return <Calendar className="h-4 w-4 text-blue-500" />
      default:
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50'
      case 'medium':
        return 'border-l-orange-500 bg-orange-50'
      case 'low':
        return 'border-l-blue-500 bg-blue-50'
      default:
        return 'border-l-gray-500 bg-gray-50'
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    )
  }

  const dismissNotification = (notificationId: string) => {
    setNotifications(prev => 
      prev.filter(n => n.id !== notificationId)
    )
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("relative", className)}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-80 max-h-96 overflow-y-auto"
      >
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <div className="max-h-64 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No notifications</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  "p-3 border-l-4 cursor-pointer hover:bg-gray-50 transition-colors",
                  getPriorityColor(notification.priority),
                  !notification.read && "bg-opacity-100",
                  notification.read && "bg-opacity-50 opacity-75"
                )}
                onClick={() => {
                  markAsRead(notification.id)
                  if (notification.actionUrl) {
                    window.location.href = notification.actionUrl
                  }
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2 flex-1">
                    {getNotificationIcon(notification.type, notification.priority)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <div className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-1 break-words">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {notification.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      dismissNotification(notification.id)
                    }}
                    className="ml-2 h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
        
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-center text-blue-600 hover:text-blue-800"
                onClick={() => {
                  setIsOpen(false)
                  window.location.href = '/dashboard/student'
                }}
              >
                View all notifications
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}