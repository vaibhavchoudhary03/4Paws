import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "./card";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  trend?: {
    value: string;
    positive?: boolean;
  };
  testId?: string;
}

export function MetricCard({ title, value, icon: Icon, iconColor = "text-primary", trend, testId }: MetricCardProps) {
  return (
    <Card data-testid={testId}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-muted-foreground" data-testid={`text-metric-title-${testId}`}>{title}</p>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <p className="text-3xl font-bold text-foreground" data-testid={`text-metric-value-${testId}`}>{value}</p>
        {trend && (
          <p className={`text-xs mt-2 ${trend.positive ? 'text-success' : 'text-destructive'}`} data-testid={`text-metric-trend-${testId}`}>
            {trend.value}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
