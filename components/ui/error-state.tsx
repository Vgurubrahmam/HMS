import { AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ErrorStateProps {
  error?: Error | string | null
  onRetry?: () => void
  title?: string
  description?: string
  className?: string
}

export function ErrorState({ 
  error, 
  onRetry, 
  title = "Something went wrong",
  description = "An error occurred while loading the data.",
  className 
}: ErrorStateProps) {
  const errorMessage = error 
    ? typeof error === 'string' 
      ? error 
      : error.message
    : description

  return (
    <Card className={className}>
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <AlertTriangle className="h-12 w-12 text-destructive" />
        </div>
        <CardTitle className="text-destructive">{title}</CardTitle>
        <CardDescription>{errorMessage}</CardDescription>
      </CardHeader>
      {onRetry && (
        <CardContent className="text-center">
          <Button onClick={onRetry} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      )}
    </Card>
  )
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  onError?: (error: Error) => void
}

export function ErrorBoundary({ children, fallback, onError }: ErrorBoundaryProps) {
  try {
    return <>{children}</>
  } catch (error) {
    const err = error as Error
    onError?.(err)
    
    return fallback || <ErrorState error={err} />
  }
}