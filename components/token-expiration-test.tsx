"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Clock, AlertTriangle, CheckCircle } from "lucide-react"
import { isTokenExpired, getTokenPayload } from "@/lib/auth-utils"

export function TokenExpirationTest() {
  const [tokenInfo, setTokenInfo] = useState<any>(null)
  const [timeRemaining, setTimeRemaining] = useState<string>("N/A")
  const [isExpired, setIsExpired] = useState(false)
  const [lastCheck, setLastCheck] = useState<string>("Never")

  const updateTokenInfo = () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setTokenInfo({ status: "No token found" })
        setTimeRemaining("N/A")
        setIsExpired(false)
        setLastCheck(new Date().toLocaleTimeString())
        return
      }

      const payload = getTokenPayload(token)
      const expired = isTokenExpired(token)
      
      if (payload && payload.exp) {
        const expiresAt = payload.exp * 1000
        const now = Date.now()
        const remaining = expiresAt - now
        
        if (remaining > 0) {
          const minutes = Math.floor(remaining / 60000)
          const seconds = Math.floor((remaining % 60000) / 1000)
          setTimeRemaining(`${minutes}m ${seconds}s`)
        } else {
          setTimeRemaining("Expired")
        }
      }

      setTokenInfo({
        status: "Token found",
        username: payload?.username,
        role: payload?.role,
        exp: payload?.exp ? new Date(payload.exp * 1000).toLocaleString() : "Unknown",
        issuedAt: payload?.iat ? new Date(payload.iat * 1000).toLocaleString() : "Unknown"
      })
      setIsExpired(expired)
      setLastCheck(new Date().toLocaleTimeString())
    } catch (error) {
      setTokenInfo({ status: "Error reading token", error: String(error) })
      setLastCheck(new Date().toLocaleTimeString())
    }
  }

  useEffect(() => {
    updateTokenInfo()
    
    // Update every second to show live countdown
    const interval = setInterval(updateTokenInfo, 1000)
    
    return () => clearInterval(interval)
  }, [])

  const getStatusIcon = () => {
    if (!tokenInfo || tokenInfo.status === "No token found") {
      return <AlertTriangle className="h-4 w-4 text-yellow-600" />
    }
    if (isExpired) {
      return <AlertTriangle className="h-4 w-4 text-red-600" />
    }
    return <CheckCircle className="h-4 w-4 text-green-600" />
  }

  const getStatusColor = () => {
    if (!tokenInfo || tokenInfo.status === "No token found") return "yellow"
    if (isExpired) return "red"
    return "green"
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Token Expiration Monitor
        </CardTitle>
        <CardDescription>
          Real-time monitoring of JWT token expiration status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-medium">Status:</span>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <Badge variant={getStatusColor() === "green" ? "default" : getStatusColor() === "red" ? "destructive" : "secondary"}>
              {isExpired ? "Expired" : tokenInfo?.status === "No token found" ? "No Token" : "Valid"}
            </Badge>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-medium">Time Remaining:</span>
          <span className={`font-mono ${isExpired ? "text-red-600" : "text-green-600"}`}>
            {timeRemaining}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-medium">Last Check:</span>
          <span className="text-sm text-gray-600">{lastCheck}</span>
        </div>

        {tokenInfo && tokenInfo.status !== "No token found" && (
          <div className="space-y-2 pt-4 border-t">
            <h4 className="font-medium">Token Details:</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-600">Username:</span>
                <div className="font-mono">{tokenInfo.username || "N/A"}</div>
              </div>
              <div>
                <span className="text-gray-600">Role:</span>
                <div className="font-mono">{tokenInfo.role || "N/A"}</div>
              </div>
              <div>
                <span className="text-gray-600">Expires At:</span>
                <div className="font-mono text-xs">{tokenInfo.exp}</div>
              </div>
              <div>
                <span className="text-gray-600">Issued At:</span>
                <div className="font-mono text-xs">{tokenInfo.issuedAt}</div>
              </div>
            </div>
          </div>
        )}

        <div className="pt-4 border-t">
          <div className="grid grid-cols-2 gap-2">
            <Button 
              onClick={updateTokenInfo} 
              variant="outline" 
              size="sm"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button 
              onClick={() => {
                // For testing: create an expired token
                const expiredToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMyIsInVzZXJuYW1lIjoidGVzdCIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsInJvbGUiOiJjb29yZGluYXRvciIsImV4cCI6MTYwMDAwMDAwMCwiaWF0IjoxNjAwMDAwMDAwfQ.invalid"
                localStorage.setItem("token", expiredToken)
                updateTokenInfo()
              }}
              variant="destructive" 
              size="sm"
            >
              Force Expire (Test)
            </Button>
          </div>
        </div>

        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
          <strong>How it works:</strong> The global TokenExpirationGuard checks every 30 seconds for token expiration. 
          When expired, it automatically clears localStorage and redirects to the home page. 
          This monitor shows the real-time token status.
        </div>
      </CardContent>
    </Card>
  )
}