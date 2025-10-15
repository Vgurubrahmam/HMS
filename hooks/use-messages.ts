import { useState, useEffect, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"

interface Message {
  _id: string
  sender: {
    _id: string
    username: string
    email: string
    image?: string
    role: string
    department?: string
  }
  recipient: {
    _id: string
    username: string
    email: string
    image?: string
    role: string
  }
  team?: {
    _id: string
    name: string
    projectTitle: string
    hackathon?: {
      _id: string
      title: string
    }
  }
  subject: string
  content: string
  messageType: "direct" | "team_update" | "announcement" | "question" | "feedback_request" | "urgent"
  priority: "low" | "normal" | "high" | "urgent"
  isRead: boolean
  readAt?: string
  metadata?: {
    teamProgress?: number
    milestone?: string
    deadline?: string
    tags?: string[]
  }
  createdAt: string
  updatedAt: string
}

interface UseMessagesOptions {
  userId?: string
  messageType?: string
  unreadOnly?: boolean
  autoRefresh?: boolean
  refreshInterval?: number
}

interface UseMessagesReturn {
  messages: Message[]
  unreadCount: number
  loading: boolean
  error: string | null
  refreshMessages: () => Promise<void>
  markAsRead: (messageIds: string[]) => Promise<void>
  markAsUnread: (messageIds: string[]) => Promise<void>
  sendMessage: (messageData: {
    recipientId: string
    teamId?: string
    hackathonId?: string
    subject: string
    content: string
    messageType?: string
    priority?: string
    metadata?: any
  }) => Promise<boolean>
}

export function useMessages(options: UseMessagesOptions = {}): UseMessagesReturn {
  const {
    userId,
    messageType,
    unreadOnly = false,
    autoRefresh = true,
    refreshInterval = 30000 // 30 seconds
  } = options

  const [messages, setMessages] = useState<Message[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchMessages = useCallback(async () => {
    if (!userId) {
      setLoading(false)
      return
    }

    try {
      setError(null)
      
      const params = new URLSearchParams()
      if (messageType) params.append('type', messageType)
      if (unreadOnly) params.append('unread', 'true')
      params.append('limit', '20')

      const response = await fetch(`/api/mentors/${userId}/messages?${params}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.status}`)
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || "Failed to fetch messages")
      }

      setMessages(data.data.messages || [])
      setUnreadCount(data.data.unreadCount || 0)
    } catch (err) {
      console.error("Error fetching messages:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch messages"
      setError(errorMessage)
      setMessages([])
      setUnreadCount(0)
    } finally {
      setLoading(false)
    }
  }, [userId, messageType, unreadOnly])

  const refreshMessages = useCallback(async () => {
    await fetchMessages()
  }, [fetchMessages])

  const markAsRead = useCallback(async (messageIds: string[]) => {
    if (!userId || messageIds.length === 0) return

    try {
      const response = await fetch(`/api/mentors/${userId}/messages`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messageIds,
          markAsRead: true
        })
      })

      if (!response.ok) {
        throw new Error('Failed to mark messages as read')
      }

      const data = await response.json()
      
      if (data.success) {
        // Update local state
        setMessages(prev => prev.map(msg => 
          messageIds.includes(msg._id) 
            ? { ...msg, isRead: true, readAt: new Date().toISOString() }
            : msg
        ))
        
        // Update unread count
        setUnreadCount(prev => Math.max(0, prev - messageIds.length))
        
        toast({
          title: "Success",
          description: `${data.data.modifiedCount} messages marked as read`
        })
      }
    } catch (err) {
      console.error("Error marking messages as read:", err)
      toast({
        title: "Error",
        description: "Failed to mark messages as read",
        variant: "destructive"
      })
    }
  }, [userId, toast])

  const markAsUnread = useCallback(async (messageIds: string[]) => {
    if (!userId || messageIds.length === 0) return

    try {
      const response = await fetch(`/api/mentors/${userId}/messages`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messageIds,
          markAsRead: false
        })
      })

      if (!response.ok) {
        throw new Error('Failed to mark messages as unread')
      }

      const data = await response.json()
      
      if (data.success) {
        // Update local state
        setMessages(prev => prev.map(msg => 
          messageIds.includes(msg._id) 
            ? { ...msg, isRead: false, readAt: undefined }
            : msg
        ))
        
        // Update unread count
        setUnreadCount(prev => prev + messageIds.length)
        
        toast({
          title: "Success",
          description: `${data.data.modifiedCount} messages marked as unread`
        })
      }
    } catch (err) {
      console.error("Error marking messages as unread:", err)
      toast({
        title: "Error",
        description: "Failed to mark messages as unread",
        variant: "destructive"
      })
    }
  }, [userId, toast])

  const sendMessage = useCallback(async (messageData: {
    recipientId: string
    teamId?: string
    hackathonId?: string
    subject: string
    content: string
    messageType?: string
    priority?: string
    metadata?: any
  }) => {
    if (!userId) return false

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          senderId: userId,
          ...messageData
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "Success",
          description: "Message sent successfully"
        })
        return true
      }
      
      return false
    } catch (err) {
      console.error("Error sending message:", err)
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      })
      return false
    }
  }, [userId, toast])

  // Initial fetch
  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || !userId) return

    const interval = setInterval(fetchMessages, refreshInterval)
    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, fetchMessages, userId])

  return {
    messages,
    unreadCount,
    loading,
    error,
    refreshMessages,
    markAsRead,
    markAsUnread,
    sendMessage
  }
}