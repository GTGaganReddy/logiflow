import React, { useState, useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";
import { Truck, Package, MapPin, DollarSign, Clock, Route, AlertCircle, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CustomerLoad } from "@shared/schema";

const BackhaulOptimizer = () => {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [acceptedPickups, setAcceptedPickups] = useState<Set<string>>(new Set());

  // Get current customer loads to use as delivery data
  const { data: loads = [] } = useQuery<CustomerLoad[]>({
    queryKey: ["/api/customer-loads"],
  });

  // Comprehensive Austrian/German pickup opportunities
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
    },
    {
      id: 'P006',
      location: 'Klagenfurt, Kärnten',
      coordinates: { lat: 46.6247, lng: 14.3051 },
      pickupWindow: '2025-07-13T07:30:00',
      weight: 5400,
      revenue: 1020,
      destination: 'Ljubljana, Slowenien',
      priority: 'High',
      commodityType: 'Holzprodukte'
    },
    {
      id: 'P007',
      location: 'St. Pölten, Niederösterreich',
      coordinates: { lat: 48.2058, lng: 15.6232 },
      pickupWindow: '2025-07-13T11:00:00',
      weight: 6800,
      revenue: 1240,
      destination: 'Bratislava, Slowakei',
      priority: 'Medium',
      commodityType: 'Chemikalien'
    },
    {
      id: 'P008',
      location: 'Wels, Oberösterreich',
      coordinates: { lat: 48.1597, lng: 14.0253 },
      pickupWindow: '2025-07-13T13:45:00',
      weight: 7200,
      revenue: 1380,
      destination: 'Passau, Deutschland',
      priority: 'High',
      commodityType: 'Elektronik'
    },
    {
      id: 'P009',
      location: 'Villach, Kärnten',
      coordinates: { lat: 46.6111, lng: 13.8558 },
      pickupWindow: '2025-07-14T08:15:00',
      weight: 4900,
      revenue: 950,
      destination: 'Udine, Italien',
      priority: 'Medium',
      commodityType: 'Lebensmittel'
    },
    {
      id: 'P010',
      location: 'Steyr, Oberösterreich',
      coordinates: { lat: 48.0318, lng: 14.4213 },
      pickupWindow: '2025-07-14T10:00:00',
      weight: 8100,
      revenue: 1590,
      destination: 'Regensburg, Deutschland',
      priority: 'High',
      commodityType: 'Fahrzeugteile'
    },
    {
      id: 'P011',
      location: 'Dornbirn, Vorarlberg',
      coordinates: { lat: 47.4125, lng: 9.7417 },
      pickupWindow: '2025-07-15T09:30:00',
      weight: 5600,
      revenue: 1080,
      destination: 'Konstanz, Deutschland',
      priority: 'Medium',
      commodityType: 'Textilmaschinen'
    },
    {
      id: 'P012',
      location: 'Wiener Neustadt, Niederösterreich',
      coordinates: { lat: 47.8167, lng: 16.2426 },
      pickupWindow: '2025-07-15T14:20:00',
      weight: 6300,
      revenue: 1190,
      destination: 'Budapest, Ungarn',
      priority: 'High',
      commodityType: 'Metallwaren'
    },
    {
      id: 'P013',
      location: 'Amstetten, Niederösterreich',
      coordinates: { lat: 48.1225, lng: 14.8722 },
      pickupWindow: '2025-07-16T07:00:00',
      weight: 7800,
      revenue: 1450,
      destination: 'Linz, Österreich',
      priority: 'Medium',
      commodityType: 'Baumaterialien'
    },
    {
      id: 'P014',
      location: 'Leoben, Steiermark',
      coordinates: { lat: 47.3783, lng: 15.0961 },
      pickupWindow: '2025-07-16T11:45:00',
      weight: 9200,
      revenue: 1720,
      destination: 'Graz, Österreich',
      priority: 'High',
      commodityType: 'Stahlprodukte'
    },
    {
      id: 'P015',
      location: 'Feldkirch, Vorarlberg',
      coordinates: { lat: 47.2333, lng: 9.6000 },
      pickupWindow: '2025-07-17T08:30:00',
      weight: 4500,
      revenue: 840,
      destination: 'Zürich, Schweiz',
      priority: 'Low',
      commodityType: 'Pharmazeutika'
    },
    {
      id: 'P016',
      location: 'Kapfenberg, Steiermark',
      coordinates: { lat: 47.4444, lng: 15.2914 },
      pickupWindow: '2025-07-17T13:00:00',
      weight: 6700,
      revenue: 1250,
      destination: 'Maribor, Slowenien',
      priority: 'Medium',
      commodityType: 'Industrieanlagen'
    },
    {
      id: 'P017',
      location: 'Krems, Niederösterreich',
      coordinates: { lat: 48.4097, lng: 15.6142 },
      pickupWindow: '2025-07-18T09:15:00',
      weight: 5800,
      revenue: 1110,
      destination: 'Krems, Österreich',
      priority: 'High',
      commodityType: 'Weinprodukte'
    },
    {
      id: 'P018',
      location: 'Wolfsberg, Kärnten',
      coordinates: { lat: 46.8378, lng: 14.8439 },
      pickupWindow: '2025-07-18T15:30:00',
      weight: 7400,
      revenue: 1390,
      destination: 'Klagenfurt, Österreich',
      priority: 'Medium',
      commodityType: 'Holzverarbeitung'
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

  const handleTogglePickup = (pickupId: string) => {
    setAcceptedPickups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(pickupId)) {
        newSet.delete(pickupId);
      } else {
        newSet.add(pickupId);
      }
      return newSet;
    });
  };

  const isPickupAccepted = (pickupId: string) => {
    return acceptedPickups.has(pickupId);
  };

  const activeDeliveries = loads.filter(load => load.deliveryStatus === 'assigned').length;
  const viableMatches = recommendations.reduce((acc, rec) => acc + rec.recommendations.length, 0);
  const potentialRevenue = recommendations.reduce((acc, rec) => acc + (rec.recommendations[0]?.revenue || 0), 0);

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="bg-gray-50 px-6 py-4 border-b">
        <div className="flex items-center">
          <Route className="h-6 w-6 text-blue-600 mr-3" />
          <div>
            <h2 className="text-xl font-bold text-gray-900">Backhaul Optimization System</h2>
            <p className="text-sm text-gray-600">Optimize return trips by identifying profitable pickup opportunities within 24 hours of delivery</p>
          </div>
        </div>
      </div>
      
      <div className="p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-md border">
            <div className="flex items-center">
              <Truck className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Active Deliveries</p>
                <p className="text-2xl font-bold text-gray-900">{activeDeliveries}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Available Pickups</p>
                <p className="text-2xl font-bold text-gray-900">{availablePickups.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border">
            <div className="flex items-center">
              <Route className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Viable Matches</p>
                <p className="text-2xl font-bold text-gray-900">{viableMatches}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-yellow-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Potential Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(potentialRevenue)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {recommendations.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">No viable backhaul opportunities found for current deliveries.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {recommendations.map((rec) => (
              <div key={rec.deliveryId} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-blue-50 px-6 py-4 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Truck className="h-5 w-5 text-blue-600 mr-2" />
                      <span className="font-semibold text-gray-900">
                        Delivery to {rec.delivery.customerName}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <Clock className="h-4 w-4 inline mr-1" />
                      {rec.delivery.deliveryEndDate && rec.delivery.deliveryEndTime && 
                        formatTime(`${rec.delivery.deliveryEndDate}T${rec.delivery.deliveryEndTime}`)
                      }
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Available Capacity:</span>
                      <span className="ml-2 font-medium">8,000 kg</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Truck Type:</span>
                      <span className="ml-2 font-medium">Full Truck Load</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Resource:</span>
                      <span className="ml-2 font-medium">{rec.delivery.algoAssignedResource || rec.delivery.humanReservedResource || 'TBD'}</span>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {rec.recommendations.length > 0 ? (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Recommended Backhaul Opportunities
                      </h3>
                      {rec.recommendations.map((pickup: any, index: number) => (
                        <div key={pickup.id} className={`border rounded-lg p-4 ${index === 0 ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                                <span className="font-medium text-gray-900">{pickup.location}</span>
                                {index === 0 && (
                                  <span className="ml-2 px-2 py-1 text-xs bg-green-600 text-white rounded-full">
                                    Best Match
                                  </span>
                                )}
                                <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getPriorityColor(pickup.priority)}`}>
                                  {pickup.priority} Priority
                                </span>
                              </div>
                              
                              <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-600">Weight:</span>
                                  <span className="ml-2 font-medium">{pickup.weight.toLocaleString()} kg</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Revenue:</span>
                                  <span className="ml-2 font-medium text-green-600">{formatCurrency(pickup.revenue)}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Distance:</span>
                                  <span className="ml-2 font-medium">{Math.round(pickup.distance)} km</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Pickup:</span>
                                  <span className="ml-2 font-medium">{formatTime(pickup.pickupWindow)}</span>
                                </div>
                              </div>
                              
                              <div className="mt-2 text-sm">
                                <span className="text-gray-600">Commodity:</span>
                                <span className="ml-2 font-medium">{pickup.commodityType}</span>
                                <span className="ml-4 text-gray-600">To:</span>
                                <span className="ml-2 font-medium">{pickup.destination}</span>
                              </div>
                            </div>
                            
                            <div className="ml-4">
                              {isPickupAccepted(pickup.id) ? (
                                <button
                                  onClick={() => handleTogglePickup(pickup.id)}
                                  className="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 text-white rounded-md flex items-center"
                                >
                                  <Check className="h-4 w-4 mr-1" />
                                  Accepted
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleTogglePickup(pickup.id)}
                                  className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center"
                                >
                                  <Check className="h-4 w-4 mr-1" />
                                  Accept
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No viable pickup opportunities found.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BackhaulOptimizer;