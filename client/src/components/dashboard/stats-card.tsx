import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatsCardProps = {
  title: string;
  value: string | number;
  change?: {
    value: string;
    positive?: boolean;
  };
  icon: React.ReactNode;
  iconBgColor: string;
  className?: string;
};

export default function StatsCard({
  title,
  value,
  change,
  icon,
  iconBgColor,
  className,
}: StatsCardProps) {
  return (
    <Card className={cn("shadow-md", className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{value}</p>
            {change && (
              <p className={`text-sm flex items-center ${change.positive ? 'text-green-500' : 'text-red-500'}`}>
                {change.positive ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
                <span>{change.value}</span>
              </p>
            )}
          </div>
          <div className={`p-2 ${iconBgColor} rounded-lg`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
