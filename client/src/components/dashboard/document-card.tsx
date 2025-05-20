import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, File } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

type DocumentCardProps = {
  document: {
    id: number;
    title: string;
    description: string;
    fileType: string;
    fileSize: number;
    lastUpdated: string;
    downloadUrl: string;
    category: string;
  };
};

export default function DocumentCard({ document }: DocumentCardProps) {
  // Get icon and background color based on document category
  const getIconColorByCategory = (category: string) => {
    switch (category) {
      case 'procedures':
        return { bg: 'bg-red-50 dark:bg-red-900', icon: 'text-red-500' };
      case 'safety':
        return { bg: 'bg-green-50 dark:bg-green-900', icon: 'text-green-500' };
      case 'equipment':
        return { bg: 'bg-blue-50 dark:bg-blue-900', icon: 'text-blue-500' };
      default:
        return { bg: 'bg-gray-50 dark:bg-gray-900', icon: 'text-gray-500' };
    }
  };
  
  // Format date nicely
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: fr });
  };
  
  const { bg, icon } = getIconColorByCategory(document.category);
  
  return (
    <Card className="border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start">
          <div className={`p-2 ${bg} rounded-lg`}>
            <File className={`text-xl ${icon}`} />
          </div>
          <div className="ml-4">
            <h3 className="font-semibold text-gray-800 dark:text-white">
              {document.title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              {document.description}
            </p>
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <span>{document.fileSize} MB</span>
              <span className="mx-2">•</span>
              <span>Mis à jour: {formatDate(document.lastUpdated)}</span>
            </div>
            <Button 
              variant="link" 
              size="sm"
              className="mt-2 text-primary text-sm hover:underline flex items-center p-0" 
              onClick={() => window.open(document.downloadUrl, '_blank')}
            >
              <Download className="h-4 w-4 mr-1" /> Télécharger
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
