"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Copy, CheckCircle, ExternalLink } from "lucide-react"
import { ClientOnlyGoogleAuth } from "@/components/client-only-google-auth"

function OAuthDebugContent() {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const info = {
      origin: typeof window !== "undefined" ? window.location.origin : "N/A",
      fullUrl: typeof window !== "undefined" ? window.location.href : "N/A",
      protocol: typeof window !== "undefined" ? window.location.protocol : "N/A",
      host: typeof window !== "undefined" ? window.location.host : "N/A",
      hostname: typeof window !== "undefined" ? window.location.hostname : "N/A",
      pathname: typeof window !== "undefined" ? window.location.pathname : "N/A",
      userAgent: typeof window !== "undefined" ? navigator.userAgent : "N/A",
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV,
        googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? "Set" : "Missing",
        vercelUrl: process.env.NEXT_PUBLIC_VERCEL_URL || "Not set",
      },
    }
    setDebugInfo(info)
    console.log("OAuth Debug Info:", info)
  }, [])

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(label)
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      })
      setTimeout(() => setCopied(null), 2000)
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please copy manually",
        variant: "destructive",
      })
    }
  }

  if (!debugInfo) {
    return <div className="p-8 text-center">Loading debug information...</div>
  }

  // Generate the list of redirect URIs that should be added to Google Cloud Console
  const redirectUris = [
    debugInfo.origin,
    `${debugInfo.origin}/`,
    `${debugInfo.origin}/auth/login/google`,
    `${debugInfo.origin}/auth/register/google`,
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Current Environment</CardTitle>
          <CardDescription>Information about your current browser environment</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Origin</Label>
              <div className="flex mt-1">
                <Input value={debugInfo.origin} readOnly className="font-mono text-sm" />
                <Button
                  variant="outline"
                  size="icon"
                  className="ml-2"
                  onClick={() => copyToClipboard(debugInfo.origin, "Origin")}
                >
                  {copied === "Origin" ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div>
              <Label>Full URL</Label>
              <div className="flex mt-1">
                <Input value={debugInfo.fullUrl} readOnly className="font-mono text-sm" />
                <Button
                  variant="outline"
                  size="icon"
                  className="ml-2"
                  onClick={() => copyToClipboard(debugInfo.fullUrl, "Full URL")}
                >
                  {copied === "Full URL" ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Protocol</Label>
              <Input value={debugInfo.protocol} readOnly className="font-mono text-sm mt-1" />
            </div>
            <div>
              <Label>Host</Label>
              <Input value={debugInfo.host} readOnly className="font-mono text-sm mt-1" />
            </div>
            <div>
              <Label>Hostname</Label>
              <Input value={debugInfo.hostname} readOnly className="font-mono text-sm mt-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Required Redirect URIs</CardTitle>
          <CardDescription>Add ALL of these URIs to your Google Cloud Console OAuth configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {redirectUris.map((uri, index) => (
              <div key={index} className="flex items-center">
                <Input value={uri} readOnly className="font-mono text-sm" />
                <Button
                  variant="outline"
                  size="icon"
                  className="ml-2"
                  onClick={() => copyToClipboard(uri, `URI ${index}`)}
                >
                  {copied === `URI ${index}` ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start">
          <p className="text-sm text-muted-foreground mb-2">
            After adding these URIs to Google Cloud Console, wait at least 5-10 minutes before testing again.
          </p>
          <Button variant="outline" asChild>
            <a
              href="https://console.cloud.google.com/apis/credentials"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Open Google Cloud Console
            </a>
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Environment Variables</CardTitle>
          <CardDescription>Current environment configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>NODE_ENV</Label>
                <Input value={debugInfo.environment.nodeEnv} readOnly className="font-mono text-sm mt-1" />
              </div>
              <div>
                <Label>NEXT_PUBLIC_VERCEL_URL</Label>
                <Input value={debugInfo.environment.vercelUrl} readOnly className="font-mono text-sm mt-1" />
              </div>
            </div>
            <div>
              <Label>Google Client ID Status</Label>
              <Input
                value={debugInfo.environment.googleClientId}
                readOnly
                className={`font-mono text-sm mt-1 ${
                  debugInfo.environment.googleClientId === "Missing" ? "text-red-500" : ""
                }`}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Troubleshooting Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2">
            <li>
              Copy <strong>ALL</strong> the redirect URIs above
            </li>
            <li>
              Go to{" "}
              <a
                href="https://console.cloud.google.com/apis/credentials"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                Google Cloud Console
              </a>
            </li>
            <li>Select your project</li>
            <li>Go to "Credentials" → "OAuth 2.0 Client IDs"</li>
            <li>Edit your OAuth client</li>
            <li>Add ALL the redirect URIs to "Authorized redirect URIs"</li>
            <li>Save the changes</li>
            <li>Wait at least 5-10 minutes for changes to propagate</li>
            <li>Clear your browser cache and cookies</li>
            <li>Try logging in again</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}

export default function OAuthDebugPage() {
  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-2">OAuth Debug Tool</h1>
      <p className="text-muted-foreground mb-8">
        Use this page to diagnose and fix Google OAuth redirect_uri_mismatch errors
      </p>

      <ClientOnlyGoogleAuth>
        <OAuthDebugContent />
      </ClientOnlyGoogleAuth>
    </div>
  )
}
