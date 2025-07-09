import { useQuery } from "@tanstack/react-query";
import { Package, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Stats {
  totalLoads: number;
  assigned: number;
  pending: number;
  highPriority: number;
  totalTrucks: number;
  availableTrucks: number;
  busyTrucks: number;
  maintenanceTrucks: number;
}

export default function DashboardStats() {
  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ["/api/stats"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-3">
              <div className="h-12 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
      <Card>
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-500 text-xs">Total Loads</p>
              <p className="text-lg font-bold text-neutral-800">{stats?.totalLoads || 0}</p>
            </div>
            <Package className="text-primary h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-500 text-xs">Assigned</p>
              <p className="text-lg font-bold text-success">{stats?.assigned || 0}</p>
            </div>
            <CheckCircle className="text-success h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-500 text-xs">Pending</p>
              <p className="text-lg font-bold text-warning">{stats?.pending || 0}</p>
            </div>
            <Clock className="text-warning h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-500 text-xs">High Priority</p>
              <p className="text-lg font-bold text-error">{stats?.highPriority || 0}</p>
            </div>
            <AlertTriangle className="text-error h-5 w-5" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
