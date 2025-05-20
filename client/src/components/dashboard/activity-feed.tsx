import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Truck, AlertTriangle, CheckCircle, FileSignature } from "lucide-react";

type Activity = {
  id: number;
  type: string;
  description: string;
  userId: number;
  timestamp: string;
  relatedEntityId?: number;
  relatedEntityType?: string;
  userName?: string;
};

type ActivityFeedProps = {
  activities: Activity[];
  onViewAll: () => void;
};

export default function ActivityFeed({ activities, onViewAll }: ActivityFeedProps) {
  // Get icon and styling based on activity type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'operation_created':
      case 'operation_updated':
        return { 
          icon: <Truck />, 
          bg: 'bg-blue-100 dark:bg-blue-900',
          color: 'text-blue-500'
        };
      case 'safety_incident_reported':
        return { 
          icon: <AlertTriangle />, 
          bg: 'bg-red-100 dark:bg-red-900',
          color: 'text-red-500'
        };
      case 'safety_audit_completed':
        return { 
          icon: <CheckCircle />, 
          bg: 'bg-green-100 dark:bg-green-900',
          color: 'text-green-500'
        };
      case 'planning_created':
        return { 
          icon: <FileSignature />, 
          bg: 'bg-purple-100 dark:bg-purple-900',
          color: 'text-purple-500'
        };
      default:
        return { 
          icon: <Truck />, 
          bg: 'bg-gray-100 dark:bg-gray-900',
          color: 'text-gray-500'
        };
    }
  };
  
  // Format relative time
  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true,
        locale: fr
      });
    } catch (error) {
      return dateString;
    }
  };
  
  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white">Activités Récentes</CardTitle>
          <Button variant="link" size="sm" onClick={onViewAll}>
            Voir tout
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Aucune activité récente
            </div>
          )}
          
          {activities.map((activity) => {
            const { icon, bg, color } = getActivityIcon(activity.type);
            
            return (
              <div key={activity.id} className="flex items-start pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className={`h-10 w-10 rounded-full ${bg} flex items-center justify-center ${color} mr-3`}>
                  {icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-800 dark:text-white">
                    {activity.description}
                  </p>
                  <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
                    <span>{formatTime(activity.timestamp)}</span>
                    <span className="mx-2">•</span>
                    <span>Par: {activity.userName || `User #${activity.userId}`}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
