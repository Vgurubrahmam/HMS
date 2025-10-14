"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, AlertCircle, CheckCircle } from 'lucide-react'

interface StatusDebugResult {
  success: boolean
  hackathon?: {
    title: string
    current_status_in_db: string
    calculated_status: string
    should_update: boolean
  }
  dates?: {
    current_time: string
    current_time_readable: string
    registration_deadline: string
    registration_deadline_readable: string
  }
  comparisons?: {
    deadline_passed: boolean
    days_since_deadline: number
    milliseconds_since_deadline: number
  }
  error?: string
}

export function StatusDebugWidget() {
  const [hackathonTitle, setHackathonTitle] = useState('AI THON')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<StatusDebugResult | null>(null)

  const debugStatus = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/debug/status-check?title=${encodeURIComponent(hackathonTitle)}`)
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        error: 'Failed to debug status'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const forceUpdate = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/debug/status-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: hackathonTitle })
      })
      const data = await response.json()
      
      // Refresh the debug info
      await debugStatus()
    } catch (error) {
      console.error('Force update failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-orange-500" />
          Hackathon Status Debugger
        </CardTitle>
        <p className="text-sm text-gray-600">
          Debug why hackathon statuses aren't updating correctly based on dates
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <Label htmlFor="hackathon-title">Hackathon Title</Label>
            <Input
              id="hackathon-title"
              value={hackathonTitle}
              onChange={(e) => setHackathonTitle(e.target.value)}
              placeholder="Enter hackathon title (e.g., AI THON)"
            />
          </div>
          <Button onClick={debugStatus} disabled={isLoading}>
            {isLoading ? 'Checking...' : 'Debug Status'}
          </Button>
          <Button onClick={forceUpdate} disabled={isLoading} variant="destructive">
            Force Update
          </Button>
        </div>

        {result && (
          <div className="space-y-4">
            {result.success ? (
              <>
                <Alert className={result.hackathon?.should_update ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
                  <div className="flex items-center gap-2">
                    {result.hackathon?.should_update ? (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                    <AlertDescription>
                      <strong>{result.hackathon?.title}</strong>: 
                      {result.hackathon?.should_update 
                        ? ` Status needs update from "${result.hackathon.current_status_in_db}" to "${result.hackathon.calculated_status}"`
                        : ` Status is correct: "${result.hackathon?.current_status_in_db}"`
                      }
                    </AlertDescription>
                  </div>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Status Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Current Status:</span>
                        <Badge variant="outline">{result.hackathon?.current_status_in_db}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Calculated Status:</span>
                        <Badge className={
                          result.hackathon?.calculated_status === 'Registration Closed' 
                            ? 'bg-orange-100 text-orange-800'
                            : result.hackathon?.calculated_status === 'Registration Open'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }>
                          {result.hackathon?.calculated_status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Date Comparison
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <p className="text-xs text-gray-500">Current Time:</p>
                        <p className="text-sm">{result.dates?.current_time_readable}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Registration Deadline:</p>
                        <p className="text-sm">{result.dates?.registration_deadline_readable}</p>
                      </div>
                      {result.comparisons && (
                        <div className="pt-2 border-t">
                          <div className="flex justify-between">
                            <span className="text-xs text-gray-500">Deadline Passed:</span>
                            <Badge variant={result.comparisons.deadline_passed ? 'destructive' : 'default'}>
                              {result.comparisons.deadline_passed ? 'Yes' : 'No'}
                            </Badge>
                          </div>
                          {result.comparisons.deadline_passed && (
                            <div className="text-xs text-gray-600 mt-1">
                              {Math.abs(result.comparisons.days_since_deadline).toFixed(1)} days ago
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {result.hackathon?.should_update && (
                  <Alert className="border-yellow-200 bg-yellow-50">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription>
                      <strong>Action Required:</strong> The database status doesn't match the calculated status based on dates. 
                      Click "Force Update" to fix this automatically.
                    </AlertDescription>
                  </Alert>
                )}
              </>
            ) : (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription>
                  <strong>Error:</strong> {result.error}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
          <p><strong>How it works:</strong></p>
          <ul className="list-disc ml-4 mt-1 space-y-1">
            <li>If current date/time is after registration deadline → Status should be "Registration Closed"</li>
            <li>If current date/time is after start date → Status should be "Active"</li>
            <li>If current date/time is after end date → Status should be "Completed"</li>
            <li>If current date/time is before registration deadline → Status should be "Registration Open"</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}