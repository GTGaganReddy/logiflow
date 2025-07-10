import React, { useState, useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";
import { Truck, Package, MapPin, Euro, Clock, Route, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CustomerLoad } from "@shared/schema";

const BackhaulOptimizer = () => {
  const [recommendations, setRecommendations] = useState<any[]>([]);

  // Get current customer loads to use as delivery data
  const { data: loads = [] } = useQuery<CustomerLoad[]>({
    queryKey: ["/api/customer-loads"],
  });

  // Sample Austrian/German pickup opportunities matching your region
  const availablePickups = [
    {
      id: 'P001',
      location: 'Linz, Oberösterreich',
      coordinates: { lat: 48.3069, lng: 14.2858 },
      pickupWindow: '2025-07-12T08:00:00',
      weight: 7500,
      revenue: 1350,
      destination: 'München, Deutschland',
      priority: 'High',
      commodityType: 'Maschinen'
    },
    {
      id: 'P002',
      location: 'Graz, Steiermark',
      coordinates: { lat: 47.0707, lng: 15.4395 },
      pickupWindow: '2025-07-12T12:00:00',
      weight: 4200,
      revenue: 890,
      destination: 'Salzburg, Österreich',
      priority: 'Medium',
      commodityType: 'Textilien'
    },
    {
      id: 'P003',
      location: 'Innsbruck, Tirol',
      coordinates: { lat: 47.2692, lng: 11.4041 },
      pickupWindow: '2025-07-12T10:30:00',
      weight: 6100,
      revenue: 1150,
      destination: 'Zürich, Schweiz',
      priority: 'High',
      commodityType: 'Bergbau Equipment'
    },
    {
      id: 'P004',
      location: 'Eisenstadt, Burgenland',
      coordinates: { lat: 47.8459, lng: 16.5200 },
      pickupWindow: '2025-07-12T14:00:00',
      weight: 8900,
      revenue: 1680,
      destination: 'Wien, Österreich',
      priority: 'Medium',
      commodityType: 'Landtechnik'
    },
    {
      id: 'P005',
      location: 'Bregenz, Vorarlberg',
      coordinates: { lat: 47.5031, lng: 9.7471 },
      pickupWindow: '2025-07-12T09:00:00',
      weight: 3800,
      revenue: 920,
      destination: 'Stuttgart, Deutschland',
      priority: 'Low',
      commodityType: 'Textil Export'
    }
  ];

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (coord1: any, coord2: any) => {
    const R = 6371; // Earth's radius in km
    const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
    const dLon = (coord2.lng - coord1.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Convert Austrian cities to coordinates for distance calculation
  const getCityCoordinates = (customerName: string) => {
    const cityMap: { [key: string]: { lat: number, lng: number } } = {
      'Blautal Maschinenbau AG': { lat: 48.2082, lng: 16.3738 }, // Vienna area
      'Wiener Stahlwerk GmbH': { lat: 48.2082, lng: 16.3738 }, // Vienna
      'Salzburger Logistik Service': { lat: 47.8095, lng: 13.0550 }, // Salzburg
      'Oberösterreichische Bau GmbH': { lat: 48.3069, lng: 14.2858 }, // Linz
      'Tiroler Bergbau Industrie': { lat: 47.2692, lng: 11.4041 }, // Innsbruck
      'Burgenländische Landtechnik': { lat: 47.8459, lng: 16.5200 }, // Eisenstadt
      'Vorarlberger Textil Export': { lat: 47.5031, lng: 9.7471 } // Bregenz
    };
    return cityMap[customerName] || { lat: 48.2082, lng: 16.3738 }; // Default to Vienna
  };

  // Calculate profit score based on distance, revenue, and capacity utilization
  const calculateProfitScore = (delivery: any, pickup: any) => {
    const deliveryCoords = getCityCoordinates(delivery.customerName);
    const distance = calculateDistance(deliveryCoords, pickup.coordinates);
    const fuelCost = distance * 0.18; // €0.18 per km (higher European fuel costs)
    const driverCost = distance * 0.12; // €0.12 per km
    const totalCost = fuelCost + driverCost;
    const profit = pickup.revenue - totalCost;
    
    // Assume 26,000kg truck capacity with current load of 18,000kg = 8,000kg available
    const availableCapacity = 8000;
    const capacityUtilization = pickup.weight / availableCapacity;
    const utilizationBonus = capacityUtilization * 0.25;
    
    // Priority multiplier
    const priorityMultiplier = pickup.priority === 'High' ? 1.4 : pickup.priority === 'Medium' ? 1.2 : 1.0;
    
    return (profit + utilizationBonus * pickup.revenue) * priorityMultiplier;
  };

  // Check if pickup is viable (within 24 hours and capacity allows)
  const isPickupViable = (delivery: any, pickup: any) => {
    if (!delivery.deliveryEndDate || !delivery.deliveryEndTime) return false;
    
    const deliveryEnd = new Date(`${delivery.deliveryEndDate}T${delivery.deliveryEndTime}`);
    const pickupTime = new Date(pickup.pickupWindow);
    const timeDiff = (pickupTime.getTime() - deliveryEnd.getTime()) / (1000 * 60 * 60); // hours
    
    // Assume 8000kg available capacity for all trucks
    return timeDiff > 0 && timeDiff <= 24 && pickup.weight <= 8000;
  };

  // Generate recommendations based on current loads
  useEffect(() => {
    if (loads.length === 0) return;

    const recs = loads
      .filter(load => load.deliveryStatus === 'assigned' && load.deliveryEndDate)
      .map(delivery => {
        const viablePickups = availablePickups
          .filter(pickup => isPickupViable(delivery, pickup))
          .map(pickup => {
            const deliveryCoords = getCityCoordinates(delivery.customerName);
            return {
              ...pickup,
              distance: calculateDistance(deliveryCoords, pickup.coordinates),
              profitScore: calculateProfitScore(delivery, pickup),
              timeDiff: delivery.deliveryEndDate && delivery.deliveryEndTime ? 
                (new Date(pickup.pickupWindow).getTime() - new Date(`${delivery.deliveryEndDate}T${delivery.deliveryEndTime}`).getTime()) / (1000 * 60 * 60) : 0
            };
          })
          .sort((a, b) => b.profitScore - a.profitScore);

        return {
          deliveryId: delivery.id,
          delivery: delivery,
          recommendations: viablePickups.slice(0, 3) // Top 3 recommendations
        };
      })
      .filter(rec => rec.recommendations.length > 0);

    setRecommendations(recs);
  }, [loads]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-AT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('de-AT', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-600 bg-red-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const activeDeliveries = loads.filter(load => load.deliveryStatus === 'assigned').length;
  const viableMatches = recommendations.reduce((acc, rec) => acc + rec.recommendations.length, 0);
  const potentialRevenue = recommendations.reduce((acc, rec) => acc + (rec.recommendations[0]?.revenue || 0), 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <Route className="h-5 w-5 mr-2" />
          Backhaul Optimization
        </CardTitle>
        <p className="text-sm text-neutral-600">
          Optimize return trips by identifying profitable pickup opportunities within 24 hours of delivery
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Truck className="h-6 w-6 text-blue-600 mr-2" />
              <div>
                <p className="text-xs text-gray-600">Active Deliveries</p>
                <p className="text-lg font-bold text-gray-900">{activeDeliveries}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Package className="h-6 w-6 text-green-600 mr-2" />
              <div>
                <p className="text-xs text-gray-600">Available Pickups</p>
                <p className="text-lg font-bold text-gray-900">{availablePickups.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Route className="h-6 w-6 text-purple-600 mr-2" />
              <div>
                <p className="text-xs text-gray-600">Viable Matches</p>
                <p className="text-lg font-bold text-gray-900">{viableMatches}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Euro className="h-6 w-6 text-yellow-600 mr-2" />
              <div>
                <p className="text-xs text-gray-600">Potential Revenue</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(potentialRevenue)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {recommendations.length === 0 ? (
          <div className="text-center py-8 text-neutral-500">
            <Package className="h-12 w-12 mx-auto mb-3 text-neutral-300" />
            <p>No viable backhaul opportunities found for current deliveries.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Recommended Backhaul Opportunities</h3>
            
            {recommendations.map((rec) => (
              <div key={rec.deliveryId} className="border rounded-lg overflow-hidden">
                <div className="bg-blue-50 px-4 py-3 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Truck className="h-4 w-4 text-blue-600 mr-2" />
                      <span className="font-medium text-gray-900">
                        {rec.delivery.customerName}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <Clock className="h-3 w-3 inline mr-1" />
                      {rec.delivery.deliveryEndDate && rec.delivery.deliveryEndTime && 
                        formatTime(`${rec.delivery.deliveryEndDate}T${rec.delivery.deliveryEndTime}`)
                      }
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  {rec.recommendations.map((pickup: any, index: number) => (
                    <div key={pickup.id} className={`border rounded-lg p-3 ${index === 0 ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center flex-wrap gap-2">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span className="font-medium text-gray-900">{pickup.location}</span>
                            {index === 0 && (
                              <Badge className="bg-green-600 text-white text-xs">
                                Best Match
                              </Badge>
                            )}
                            <Badge variant="outline" className={`text-xs ${getPriorityColor(pickup.priority)}`}>
                              {pickup.priority}
                            </Badge>
                          </div>
                          
                          <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div>
                              <span className="text-gray-600">Weight:</span>
                              <span className="ml-1 font-medium">{pickup.weight.toLocaleString()} kg</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Revenue:</span>
                              <span className="ml-1 font-medium text-green-600">{formatCurrency(pickup.revenue)}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Distance:</span>
                              <span className="ml-1 font-medium">{Math.round(pickup.distance)} km</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Pickup:</span>
                              <span className="ml-1 font-medium">{formatTime(pickup.pickupWindow)}</span>
                            </div>
                          </div>
                          
                          <div className="mt-2 text-sm">
                            <span className="text-gray-600">Commodity:</span>
                            <span className="ml-1 font-medium">{pickup.commodityType}</span>
                            <span className="ml-3 text-gray-600">To:</span>
                            <span className="ml-1 font-medium">{pickup.destination}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BackhaulOptimizer;