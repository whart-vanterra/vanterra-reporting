import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MetricCardProps {
  title: string
  value: string | number
  trend?: number
  description?: string
  icon?: React.ReactNode
  className?: string
}

export function MetricCard({
  title,
  value,
  trend,
  description,
  icon,
  className,
}: MetricCardProps) {
  const getTrendIcon = () => {
    if (trend === undefined || trend === null) return null
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-500" />
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-red-500" />
    return <Minus className="h-4 w-4 text-gray-500" />
  }

  const getTrendColor = () => {
    if (trend === undefined || trend === null) return ''
    if (trend > 0) return 'text-green-500'
    if (trend < 0) return 'text-red-500'
    return 'text-gray-500'
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(trend !== undefined || description) && (
          <div className="flex items-center gap-2 mt-1">
            {trend !== undefined && (
              <div className={cn('flex items-center gap-1 text-xs', getTrendColor())}>
                {getTrendIcon()}
                <span>{Math.abs(trend).toFixed(1)}%</span>
              </div>
            )}
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
