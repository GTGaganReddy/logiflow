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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-500 text-sm">Total Loads</p>
              <p className="text-2xl font-bold text-neutral-800">{stats?.totalLoads || 0}</p>
            </div>
            <Package className="text-primary text-2xl" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-500 text-sm">Assigned</p>
              <p className="text-2xl font-bold text-success">{stats?.assigned || 0}</p>
            </div>
            <CheckCircle className="text-success text-2xl" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-500 text-sm">Pending</p>
              <p className="text-2xl font-bold text-warning">{stats?.pending || 0}</p>
            </div>
            <Clock className="text-warning text-2xl" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-500 text-sm">High Priority</p>
              <p className="text-2xl font-bold text-error">{stats?.highPriority || 0}</p>
            </div>
            <AlertTriangle className="text-error text-2xl" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
