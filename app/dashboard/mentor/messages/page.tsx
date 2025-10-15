"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare, Search, RefreshCw, Eye, EyeOff, Loader2, Filter } from "lucide-react"
import { useCurrentUser } from "@/hooks/use-current-user"
import { useMessages } from "@/hooks/use-messages"
import { useState } from "react"
import Link from "next/link"
import ProtectedRoute from "@/components/protected-route"

function MentorMessagesContent() {
  const { userData } = useCurrentUser()
  const [searchTerm, setSearchTerm] = useState("")
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)
  const [selectedMessageType, setSelectedMessageType] = useState("")

  const {
    messages,
    unreadCount,
    loading,
    error,
    refreshMessages,
    markAsRead,
    markAsUnread
  } = useMessages({
    userId: userData?.id,
    messageType: selectedMessageType || undefined,
    unreadOnly: showUnreadOnly,
    autoRefresh: true
  })

  // Filter messages based on search term
  const filteredMessages = messages.filter(message =>
    message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.sender?.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.team?.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleMarkAsRead = async (messageId: string) => {
    await markAsRead([messageId])
  }

  const handleMarkAsUnread = async (messageId: string) => {
    await markAsUnread([messageId])
  }

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays === 1) return "Yesterday"
    if (diffInDays < 7) return `${diffInDays}d ago`
    return date.toLocaleDateString()
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'normal': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getMessageTypeColor = (messageType: string) => {
    switch (messageType) {
      case 'urgent': return 'bg-red-50 border-red-200'
      case 'question': return 'bg-blue-50 border-blue-200'
      case 'team_update': return 'bg-green-50 border-green-200'
      case 'feedback_request': return 'bg-purple-50 border-purple-200'
      case 'announcement': return 'bg-yellow-50 border-yellow-200'
      default: return 'bg-gray-50 border-gray-200'
    }
  }

  if (loading && messages.length === 0) {
    return (
      <DashboardLayout userRole="mentor">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading messages...</span>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="mentor">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
            <p className="text-gray-600">
              All your messages • {unreadCount} unread • {messages.length} total
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={refreshMessages} 
              variant="outline"
              disabled={loading}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Link href="/dashboard/mentor">
              <Button variant="outline">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <Input
                  placeholder="Search messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <Button
                variant={showUnreadOnly ? "default" : "outline"}
                onClick={() => setShowUnreadOnly(!showUnreadOnly)}
              >
                {showUnreadOnly ? "Show All" : "Unread Only"}
              </Button>
              <select
                value={selectedMessageType}
                onChange={(e) => setSelectedMessageType(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="">All Types</option>
                <option value="urgent">Urgent</option>
                <option value="question">Questions</option>
                <option value="team_update">Team Updates</option>
                <option value="feedback_request">Feedback Requests</option>
                <option value="announcement">Announcements</option>
                <option value="direct">Direct Messages</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Messages List */}
        <div className="space-y-4">
          {error ? (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-6 text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-red-400" />
                <p className="text-red-800 font-medium">Error loading messages</p>
                <p className="text-red-600 text-sm">{error}</p>
                <Button onClick={refreshMessages} variant="outline" className="mt-2">
                  Try Again
                </Button>
              </CardContent>
            </Card>
          ) : filteredMessages.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">
                  {searchTerm ? "No messages match your search" : "No messages found"}
                </p>
                <p className="text-sm text-gray-500">
                  {searchTerm ? "Try a different search term" : "Messages will appear here when received"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredMessages.map((message) => (
              <Card
                key={message._id}
                className={`transition-all hover:shadow-md ${
                  message.isRead ? '' : 'ring-2 ring-blue-100'
                } ${getMessageTypeColor(message.messageType)}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={message.sender?.image} />
                      <AvatarFallback>
                        {message.sender?.username
                          ?.split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-gray-900">
                            {message.sender?.username || "Unknown User"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {message.team?.name || "Direct Message"} • 
                            {message.sender?.role} • 
                            {formatMessageTime(message.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getPriorityColor(message.priority)}>
                            {message.priority}
                          </Badge>
                          <Badge variant="outline">
                            {message.messageType.replace('_', ' ')}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => 
                              message.isRead 
                                ? handleMarkAsUnread(message._id)
                                : handleMarkAsRead(message._id)
                            }
                          >
                            {message.isRead ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      
                      <h3 className="font-semibold text-lg mb-2 text-gray-900">
                        {message.subject}
                      </h3>
                      
                      <p className="text-gray-700 leading-relaxed">
                        {message.content}
                      </p>
                      
                      {message.metadata && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            {message.metadata.teamProgress && (
                              <span>Progress: {message.metadata.teamProgress}%</span>
                            )}
                            {message.metadata.milestone && (
                              <span>Milestone: {message.metadata.milestone}</span>
                            )}
                            {message.metadata.deadline && (
                              <span>Deadline: {new Date(message.metadata.deadline).toLocaleDateString()}</span>
                            )}
                            {message.metadata.tags && message.metadata.tags.length > 0 && (
                              <div className="flex gap-1">
                                {message.metadata.tags.map((tag: string, index: number) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default function MentorMessages() {
  return (
    <ProtectedRoute allowedRoles={["mentor"]}>
      <MentorMessagesContent />
    </ProtectedRoute>
  )
}