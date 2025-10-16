"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus, Activity, Users, IndianRupee } from "lucide-react"

interface MetricCardProps {
  title: string
  value: string | number
  description?: string
  trend?: number
  icon?: React.ReactNode
  format?: "number" | "currency" | "percentage"
  color?: "blue" | "green" | "purple" | "yellow" | "red"
}

export function MetricCard({ 
  title, 
  value, 
  description, 
  trend, 
  icon, 
  format = "number",
  color = "blue" 
}: MetricCardProps) {
  const formatValue = (val: string | number) => {
    if (typeof val === "string") return val
    
    switch (format) {
      case "currency":
        return `₹${val.toLocaleString()}`
      case "percentage":
        return `${val}%`
      default:
        return val.toLocaleString()
    }
  }

  const getTrendIcon = () => {
    if (trend === undefined) return null
    if (trend > 0) return <TrendingUp className="h-3 w-3 text-green-500" />
    if (trend < 0) return <TrendingDown className="h-3 w-3 text-red-500" />
    return <Minus className="h-3 w-3 text-gray-500" />
  }

  const getTrendColor = () => {
    if (trend === undefined) return ""
    if (trend > 0) return "text-green-600"
    if (trend < 0) return "text-red-600"
    return "text-gray-600"
  }

  const getColorClasses = () => {
    switch (color) {
      case "green": return "border-l-green-500 bg-green-50"
      case "purple": return "border-l-purple-500 bg-purple-50"
      case "yellow": return "border-l-yellow-500 bg-yellow-50"
      case "red": return "border-l-red-500 bg-red-50"
      default: return "border-l-blue-500 bg-blue-50"
    }
  }

  return (
    <Card className={`transition-all duration-200 hover:shadow-md border-l-4 ${getColorClasses()}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-700">{title}</CardTitle>
        {icon && <div className="text-gray-600">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900 mb-1">
          {formatValue(value)}
        </div>
        {(description || trend !== undefined) && (
          <div className="flex items-center justify-between">
            {description && (
              <p className="text-xs text-gray-600 flex-1">{description}</p>
            )}
            {trend !== undefined && (
              <div className={`flex items-center gap-1 text-xs ${getTrendColor()}`}>
                {getTrendIcon()}
                <span>{Math.abs(trend)}%</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface SimpleBarChartProps {
  data: Array<{
    label: string
    value: number
    color?: string
  }>
  height?: number
  showValues?: boolean
}

export function SimpleBarChart({ data, height = 200, showValues = true }: SimpleBarChartProps) {
  const maxValue = Math.max(...data.map(d => d.value))
  
  return (
    <div className="space-y-3">
      {data.map((item, index) => (
        <div key={index} className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">{item.label}</span>
            {showValues && (
              <span className="text-sm text-gray-600">{item.value.toLocaleString()}</span>
            )}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${item.color || 'bg-blue-500'}`}
              style={{ width: `${(item.value / maxValue) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

interface ProgressRingProps {
  value: number
  size?: number
  strokeWidth?: number
  color?: string
  label?: string
  showPercentage?: boolean
}

export function ProgressRing({ 
  value, 
  size = 120, 
  strokeWidth = 8, 
  color = "#3b82f6",
  label,
  showPercentage = true 
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDashoffset = circumference - (value / 100) * circumference

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="relative">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-gray-900">
            {showPercentage ? `${Math.round(value)}%` : Math.round(value)}
          </span>
        </div>
      </div>
      {label && (
        <p className="text-sm text-gray-600 text-center">{label}</p>
      )}
    </div>
  )
}

interface StatsGridProps {
  stats: Array<{
    label: string
    value: string | number
    icon?: React.ReactNode
    color?: string
  }>
  columns?: number
}

export function StatsGrid({ stats, columns = 2 }: StatsGridProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-4`}>
      {stats.map((stat, index) => (
        <div 
          key={index} 
          className={`text-center p-4 rounded-lg transition-all duration-200 hover:shadow-sm ${stat.color || 'bg-gray-50'}`}
        >
          {stat.icon && (
            <div className="flex justify-center mb-2">
              {stat.icon}
            </div>
          )}
          <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          <p className="text-sm text-gray-600">{stat.label}</p>
        </div>
      ))}
    </div>
  )
}

interface TrendLineProps {
  data: Array<{ label: string; value: number }>
  height?: number
  color?: string
}

export function TrendLine({ data, height = 100, color = "#3b82f6" }: TrendLineProps) {
  if (data.length < 2) return null

  const maxValue = Math.max(...data.map(d => d.value))
  const minValue = Math.min(...data.map(d => d.value))
  const range = maxValue - minValue || 1

  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * 100
    const y = ((maxValue - item.value) / range) * height
    return `${x},${y}`
  }).join(' ')

  return (
    <div className="w-full">
      <svg width="100%" height={height} className="overflow-visible">
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          points={points}
          className="transition-all duration-500"
        />
        {data.map((item, index) => (
          <circle
            key={index}
            cx={(index / (data.length - 1)) * 100 + '%'}
            cy={((maxValue - item.value) / range) * height}
            r="3"
            fill={color}
            className="transition-all duration-500"
          />
        ))}
      </svg>
      <div className="flex justify-between mt-2 text-xs text-gray-600">
        {data.map((item, index) => (
          <span key={index}>{item.label}</span>
        ))}
      </div>
    </div>
  )
}