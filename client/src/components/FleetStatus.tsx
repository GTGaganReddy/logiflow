import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck } from "lucide-react";
import type { Truck as TruckType } from "@shared/schema";

export default function FleetStatus() {
  const { data: trucks = [], isLoading } = useQuery<TruckType[]>({
    queryKey: ["/api/trucks"],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available": return "bg-success text-white";
      case "busy": return "bg-warning text-white";
      case "maintenance": return "bg-error text-white";
      default: return "bg-neutral-200 text-neutral-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "available": return "text-success";
      case "busy": return "text-warning";
      case "maintenance": return "text-error";
      default: return "text-neutral-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "available": return "Available";
      case "busy": return "En Route";
      case "maintenance": return "Maintenance";
      default: return status;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "available": return "Active";
      case "busy": return "Busy";
      case "maintenance": return "Offline";
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Fleet Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fleet Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {trucks.length === 0 ? (
            <div className="text-center py-8 text-neutral-500">
              No trucks available. Add trucks to your fleet to get started.
            </div>
          ) : (
            trucks.map((truck) => (
              <div key={truck.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Truck className={`h-5 w-5 ${getStatusIcon(truck.status)}`} />
                  <div>
                    <p className="text-sm font-medium text-neutral-800">{truck.plateNumber}</p>
                    <p className="text-xs text-neutral-500">{getStatusText(truck.status)}</p>
                  </div>
                </div>
                <Badge className={getStatusColor(truck.status)}>
                  {getStatusLabel(truck.status)}
                </Badge>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
