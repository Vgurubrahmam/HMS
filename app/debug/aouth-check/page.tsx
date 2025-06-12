"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy } from "lucide-react"

export default function OAuthDebugPage() {
  const [currentUrl, setCurrentUrl] = useState("")
  const [clientId, setClientId] = useState("")

  useEffect(() => {
    setCurrentUrl(window.location.origin)
    setClientId(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "NOT SET")
  }, [])

  const copyUrl = () => {
    navigator.clipboard.writeText(currentUrl)
    alert("URL copied! Add this to Google Cloud Console")
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>OAuth Debug Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold">Current URL (Add this to Google Console):</h3>
            <div className="flex items-center gap-2">
              <code className="bg-gray-100 p-2 rounded flex-1">{currentUrl}</code>
              <Button onClick={copyUrl} size="sm">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold">Google Client ID:</h3>
            <code className="bg-gray-100 p-2 rounded block">{clientId}</code>
          </div>

          <div className="bg-yellow-50 p-4 rounded">
            <h4 className="font-semibold text-yellow-800">Steps to Fix:</h4>
            <ol className="list-decimal list-inside text-sm text-yellow-700 mt-2">
              <li>Copy the URL above</li>
              <li>Go to Google Cloud Console → APIs & Services → Credentials</li>
              <li>Edit your OAuth 2.0 Client ID</li>
              <li>Add the copied URL to "Authorized redirect URIs"</li>
              <li>Save and wait 5-10 minutes</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
