import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Info } from "lucide-react";

type MachineCardProps = {
  machine: {
    id: number;
    name: string;
    type: string;
    decapingMethod: string;
    specifications: string;
    currentState: string;
    isActive: boolean;
  };
  onViewDetails: (machineId: number) => void;
};

export default function MachineCard({ machine, onViewDetails }: MachineCardProps) {
  // Parse specifications JSON
  const specs = JSON.parse(machine.specifications || '{}');
  
  // Map decaping method to French
  const methodMap: Record<string, string> = {
    'transport': 'Transport',
    'poussage': 'Poussage',
    'casement': 'Casement'
  };
  
  // Get images based on machine type
  const getImageUrl = (type: string) => {
    switch (type) {
      case 'd11':
        return "https://pixabay.com/get/gb5d6e758cebb68b6db6d95433d82db953fa983bcd50b5114e2c56f72b324ec07aa30ac6b989bbe403cb711b249313ded_1280.jpg";
      case 'ph1':
      case 'ph2':
        return "https://images.unsplash.com/photo-1566041510639-8d95a2490bfb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400";
      case 'transwine':
      case 'procaneq':
        return "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400";
      default:
        return "https://images.unsplash.com/photo-1630883874152-98601fc6c66b?w=800&auto=format&fit=crop";
    }
  };
  
  return (
    <Card className="hover:shadow-lg transition-shadow bg-gray-50 dark:bg-gray-700 rounded-lg">
      <CardContent className="p-4">
        <img 
          src={getImageUrl(machine.type)} 
          alt={machine.name} 
          className="w-full h-48 object-cover rounded-lg mb-3"
        />
        <h3 className="font-bold text-lg text-gray-800 dark:text-white">{machine.name}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
          Utilisé pour le <span className="font-medium text-primary">{methodMap[machine.decapingMethod]}</span>
        </p>
        
        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
          {Object.entries(specs).map(([key, value]) => (
            <div key={key}>
              <span className="text-gray-500 dark:text-gray-400">{key.charAt(0).toUpperCase() + key.slice(1)}:</span>
              <span className="font-medium dark:text-white"> {value as string}</span>
            </div>
          ))}
          <div>
            <span className="text-gray-500 dark:text-gray-400">État:</span>
            <span className={`font-medium ${
              machine.currentState === 'running' 
                ? 'text-green-500' 
                : 'text-orange-500'
            }`}>
              {machine.currentState === 'running' ? 'Opérationnel' : 'À l\'arrêt'}
            </span>
          </div>
        </div>
        
        <div className="flex justify-between">
          <Button 
            variant="link" 
            size="sm" 
            className="text-primary text-sm hover:underline flex items-center p-0"
          >
            <FileText className="h-4 w-4 mr-1" /> Fiche technique
          </Button>
          <Button 
            variant="link" 
            size="sm" 
            className="text-primary text-sm hover:underline flex items-center p-0"
            onClick={() => onViewDetails(machine.id)}
          >
            <Info className="h-4 w-4 mr-1" /> Détails
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
