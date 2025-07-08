import { useQuery } from "@tanstack/react-query";
import { CustomerLoad } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, TruckIcon, MapPin } from "lucide-react";

interface DeliveryRangeDisplayProps {
  customerLoad: CustomerLoad;
}

export default function DeliveryRangeDisplay({ customerLoad }: DeliveryRangeDisplayProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not set";
    // Parse the date string safely to avoid timezone issues
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month is 0-indexed
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return "Not set";
    return timeString;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "in-progress": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const calculateDuration = () => {
    if (!customerLoad.deliveryStartDate || !customerLoad.deliveryEndDate) return "Unknown";
    
    // Parse dates safely to avoid timezone issues
    const [startYear, startMonth, startDay] = customerLoad.deliveryStartDate.split('-').map(Number);
    const [endYear, endMonth, endDay] = customerLoad.deliveryEndDate.split('-').map(Number);
    
    const start = new Date(startYear, startMonth - 1, startDay);
    const end = new Date(endYear, endMonth - 1, endDay);
    
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Same day";
    if (diffDays === 1) return "1 day";
    return `${diffDays} days`;
  };

  const assignedTruck = customerLoad.algoAssignedResource || customerLoad.humanReservedResource;

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TruckIcon className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">
              {customerLoad.customerName} - Load #{customerLoad.slNo}
            </CardTitle>
          </div>
          <Badge className={getStatusColor(customerLoad.deliveryStatus)}>
            {customerLoad.deliveryStatus}
          </Badge>
        </div>
        <CardDescription className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          {customerLoad.location || "Location not specified"}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">Delivery Period</span>
            </div>
            <div className="space-y-1">
              <div className="text-sm">
                <span className="font-medium">Start:</span> {formatDate(customerLoad.deliveryStartDate)}
              </div>
              <div className="text-sm">
                <span className="font-medium">End:</span> {formatDate(customerLoad.deliveryEndDate)}
              </div>
              <div className="text-xs text-gray-500">
                Duration: {calculateDuration()}
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span className="font-medium">Time Window</span>
            </div>
            <div className="space-y-1">
              <div className="text-sm">
                <span className="font-medium">Start:</span> {formatTime(customerLoad.deliveryStartTime)}
              </div>
              <div className="text-sm">
                <span className="font-medium">End:</span> {formatTime(customerLoad.deliveryEndTime)}
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <TruckIcon className="h-4 w-4" />
              <span className="font-medium">Assignment</span>
            </div>
            <div className="space-y-1">
              <div className="text-sm">
                <span className="font-medium">Truck:</span> {assignedTruck || "Not assigned"}
              </div>
              <div className="text-sm">
                <span className="font-medium">Priority:</span> 
                <Badge variant="outline" className="ml-2">
                  {customerLoad.priority}
                </Badge>
              </div>
            </div>
          </div>
        </div>
        
        {customerLoad.remark && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 font-medium">Remarks:</div>
            <div className="text-sm text-gray-800 mt-1">{customerLoad.remark}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}