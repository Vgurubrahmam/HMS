"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Copy, ExternalLink, CheckCircle, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getAllRedirectUris } from "@/lib/google-config"

export function GoogleOAuthSetup() {
  const [copiedUri, setCopiedUri] = useState<string | null>(null)
  const { toast } = useToast()

  const redirectUris = getAllRedirectUris()
  const currentDomain = typeof window !== "undefined" ? window.location.origin : "Unknown"

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedUri(text)
      toast({
        title: "Copied!",
        description: "Redirect URI copied to clipboard",
      })
      setTimeout(() => setCopiedUri(null), 2000)
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please copy the URI manually",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Google OAuth Configuration
          </CardTitle>
          <CardDescription>
            Configure these redirect URIs in your Google Cloud Console to fix the "redirect_uri_mismatch" error
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Current Domain</h3>
            <Badge variant="outline" className="font-mono">
              {currentDomain}
            </Badge>
          </div>

          <div>
            <h3 className="font-medium mb-3">Required Redirect URIs</h3>
            <div className="space-y-2">
              {redirectUris.map((uri) => (
                <div key={uri} className="flex items-center justify-between p-3 border rounded-lg">
                  <code className="text-sm font-mono bg-muted px-2 py-1 rounded">{uri}</code>
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(uri)} className="ml-2">
                    {copiedUri === uri ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-yellow-800">Important Setup Steps</h4>
                <ol className="text-sm text-yellow-700 mt-2 space-y-1 list-decimal list-inside">
                  <li>
                    Go to{" "}
                    <a
                      href="https://console.cloud.google.com/apis/credentials"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      Google Cloud Console
                    </a>
                  </li>
                  <li>Select your project or create a new one</li>
                  <li>Go to "Credentials" → "OAuth 2.0 Client IDs"</li>
                  <li>Edit your OAuth client</li>
                  <li>Add ALL the redirect URIs listed above to "Authorized redirect URIs"</li>
                  <li>Save the changes</li>
                  <li>Wait 5-10 minutes for changes to propagate</li>
                </ol>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Environment Variables Check</CardTitle>
          <CardDescription>Verify your environment variables are correctly set</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">NEXT_PUBLIC_GOOGLE_CLIENT_ID</span>
              <Badge variant={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? "default" : "destructive"}>
                {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? "Set" : "Missing"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">NODE_ENV</span>
              <Badge variant="outline">{process.env.NODE_ENV || "development"}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">NEXT_PUBLIC_VERCEL_URL</span>
              <Badge variant={process.env.NEXT_PUBLIC_VERCEL_URL ? "default" : "secondary"}>
                {process.env.NEXT_PUBLIC_VERCEL_URL || "Not set (using fallback)"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
