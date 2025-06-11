"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, AlertTriangle, CheckCircle } from "lucide-react"

export function OAuthDebug() {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const collectDebugInfo = () => {
    setLoading(true)

    const info = {
      currentUrl: typeof window !== "undefined" ? window.location.href : "N/A",
      origin: typeof window !== "undefined" ? window.location.origin : "N/A",
      userAgent: typeof window !== "undefined" ? navigator.userAgent : "N/A",
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV,
        googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? "Set" : "Missing",
        vercelUrl: process.env.NEXT_PUBLIC_VERCEL_URL || "Not set",
      },
    }

    setDebugInfo(info)
    setLoading(false)
  }

  useEffect(() => {
    collectDebugInfo()
  }, [])

  const getStatusIcon = (condition: boolean) => {
    return condition ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <AlertTriangle className="h-4 w-4 text-red-600" />
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          OAuth Debug Information
          <Button variant="outline" size="sm" onClick={collectDebugInfo} disabled={loading}>
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Refresh
          </Button>
        </CardTitle>
        <CardDescription>Debug information for troubleshooting OAuth issues</CardDescription>
      </CardHeader>
      <CardContent>
        {debugInfo && (
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Current Environment</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm">Current URL</span>
                  <code className="text-xs bg-muted px-2 py-1 rounded max-w-48 truncate">{debugInfo.currentUrl}</code>
                </div>
                <div className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm">Origin</span>
                  <code className="text-xs bg-muted px-2 py-1 rounded">{debugInfo.origin}</code>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Environment Variables</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm">NODE_ENV</span>
                  <Badge variant="outline">{debugInfo.environment.nodeEnv}</Badge>
                </div>
                <div className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm">Google Client ID</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(debugInfo.environment.googleClientId === "Set")}
                    <Badge variant={debugInfo.environment.googleClientId === "Set" ? "default" : "destructive"}>
                      {debugInfo.environment.googleClientId}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm">Vercel URL</span>
                  <code className="text-xs bg-muted px-2 py-1 rounded">{debugInfo.environment.vercelUrl}</code>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">Expected Redirect URI</h4>
              <code className="text-sm bg-blue-100 px-2 py-1 rounded text-blue-800">{debugInfo.origin}</code>
              <p className="text-xs text-blue-700 mt-2">
                This should be added to your Google Cloud Console OAuth configuration
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
