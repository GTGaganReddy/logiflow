import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Truck, Search, Filter, ArrowUpDown, Download, Calendar, Clock, ChevronDown, ChevronRight, Check, Undo2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { CustomerLoad } from "@shared/schema";
import JourneyMilestones from "./JourneyMilestones";

export default function CustomerLoadTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const { toast } = useToast();

  const toggleRowExpansion = (loadId: number) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(loadId)) {
        newSet.delete(loadId);
      } else {
        newSet.add(loadId);
      }
      return newSet;
    });
  };

  const { data: loads = [], isLoading } = useQuery<CustomerLoad[]>({
    queryKey: ["/api/customer-loads"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/customer-loads/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customer-loads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Success",
        description: "Customer load deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete customer load",
        variant: "destructive",
      });
    },
  });

  const acceptResourceMutation = useMutation({
    mutationFn: async (load: CustomerLoad) => {
      // Only proceed if human resource is assigned
      if (!load.humanReservedResource || !load.algoAssignedResource) {
        throw new Error("Cannot accept - both AI and human resources must be assigned");
      }
      
      // Store original algo assignment in remark for revert capability
      const originalRemark = load.remark || '';
      const remarkWithOriginal = originalRemark ? 
        `${originalRemark} [Original algo: ${load.algoAssignedResource}]` : 
        `[Original algo: ${load.algoAssignedResource}]`;
      
      // Update the customer load to remove algo assigned resource but keep human
      await apiRequest("PUT", `/api/customer-loads/${load.id}`, {
        algoAssignedResource: null,
        remark: remarkWithOriginal,
        // Keep human reserved resource as is
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customer-loads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Success",
        description: "Assignment accepted - Algorithm resource cleared",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error", 
        description: error.message || "Failed to accept assignment",
        variant: "destructive",
      });
    },
  });

  const revertResourceMutation = useMutation({
    mutationFn: async (load: CustomerLoad) => {
      // Extract original algo assignment from remark
      const remarkMatch = load.remark?.match(/\[Original algo: ([^\]]+)\]/);
      if (!remarkMatch) {
        throw new Error("Cannot revert - original algorithm assignment not found");
      }
      
      const originalAlgo = remarkMatch[1];
      
      // Clean the remark by removing the original algo notation
      const cleanedRemark = load.remark?.replace(/\s*\[Original algo: [^\]]+\]/, '') || '';
      
      // Restore the algorithm assignment and keep human assignment
      await apiRequest("PUT", `/api/customer-loads/${load.id}`, {
        algoAssignedResource: originalAlgo,
        remark: cleanedRemark,
        // Keep human reserved resource as is
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customer-loads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Success",
        description: "Assignment reverted - Restored original AI suggestion",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error", 
        description: error.message || "Failed to revert assignment",
        variant: "destructive",
      });
    },
  });

  const acceptPriorityMutation = useMutation({
    mutationFn: async (load: CustomerLoad) => {
      // Only proceed if AI suggested priority is available
      if (!load.remarkPriority) {
        throw new Error("No AI suggested priority available");
      }
      
      // Store original priority in remark for revert capability
      const originalPriority = load.priority;
      
      // Update the customer load to change priority and clear AI suggestion
      await apiRequest("PUT", `/api/customer-loads/${load.id}`, {
        priority: load.remarkPriority,
        remarkPriority: null,
        remark: load.remark ? `${load.remark} [Original priority: ${originalPriority}]` : `[Original priority: ${originalPriority}]`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customer-loads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Success",
        description: "Priority change accepted - AI suggestion applied",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error", 
        description: error.message || "Failed to accept priority change",
        variant: "destructive",
      });
    },
  });

  const revertPriorityMutation = useMutation({
    mutationFn: async (load: CustomerLoad) => {
      // Extract original priority from remark
      const remarkMatch = load.remark?.match(/\[Original priority: (high|medium|low)\]/);
      if (!remarkMatch) {
        throw new Error("Cannot revert - original priority not found");
      }
      
      const originalPriority = remarkMatch[1];
      const currentPriority = load.priority;
      
      // Clean the remark by removing the original priority notation
      const cleanedRemark = load.remark?.replace(/\s*\[Original priority: (high|medium|low)\]/, '') || '';
      
      // Update the customer load to revert priority and restore AI suggestion
      await apiRequest("PUT", `/api/customer-loads/${load.id}`, {
        priority: originalPriority,
        remarkPriority: currentPriority, // Current becomes the AI suggestion
        remark: cleanedRemark,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customer-loads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Success",
        description: "Priority change reverted - Restored original priority",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error", 
        description: error.message || "Failed to revert priority change",
        variant: "destructive",
      });
    },
  });

  const filteredLoads = loads.filter((load) => {
    const matchesSearch = load.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         load.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = priorityFilter === "all" || load.priority?.toLowerCase() === priorityFilter.toLowerCase();
    return matchesSearch && matchesPriority;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "high": return "bg-red-500 text-white";
      case "medium": return "bg-yellow-500 text-white";
      case "low": return "bg-green-500 text-white";
      default: return "bg-neutral-200 text-neutral-700";
    }
  };

  const getResourceBadge = (resource: string | null, load: CustomerLoad) => {
    if (!resource) return <Badge variant="secondary">-</Badge>;
    
    const deliveryInfo = (
      <div className="space-y-1">
        <div className="flex items-center space-x-2">
          <Calendar className="h-3 w-3" />
          <span className="text-xs">{load.deliveryDate ? new Date(load.deliveryDate).toLocaleDateString() : "Not set"}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Clock className="h-3 w-3" />
          <span className="text-xs">
            {load.startTime && load.endTime 
              ? `${load.startTime} - ${load.endTime}`
              : "Time not set"
            }
          </span>
        </div>
        <div className="text-xs">
          Status: <span className="font-medium">{load.deliveryStatus}</span>
        </div>
      </div>
    );

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="cursor-pointer">
            <Badge className="bg-success text-white">{resource}</Badge>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="p-2">
            <p className="font-medium mb-2">Delivery Journey</p>
            {deliveryInfo}
          </div>
        </TooltipContent>
      </Tooltip>
    );
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Filter and Search */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center space-x-4 w-full md:w-auto">
              <div className="relative flex-1 md:flex-none">
                <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                <Input
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full md:w-80"
                />
              </div>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Filter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <ArrowUpDown className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Load Management Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Load Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Sl. No</TableHead>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Algo Assigned Resource</TableHead>
                  <TableHead>Human Reserved Resource</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Delivery Schedule</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Remark</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLoads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-neutral-500">
                      No customer loads found. Add your first load to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLoads.map((load) => {
                    // Check if this load has AI suggestions
                    const hasAISuggestions = load.remarkPriority || load.humanReservedResource;
                    
                    return (
                    <React.Fragment key={load.id}>
                      <TableRow className={`hover:bg-neutral-50 ${hasAISuggestions ? 'bg-blue-50 border-l-4 border-l-blue-400' : ''}`}>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => toggleRowExpansion(load.id)}
                            className="h-8 w-8 p-0"
                          >
                            {expandedRows.has(load.id) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell>{filteredLoads.indexOf(load) + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {getInitials(load.customerName)}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <p className="text-sm font-medium text-neutral-900">{load.customerName}</p>
                              {(load.remarkPriority || load.humanReservedResource) && (
                                <Badge variant="outline" className="text-xs text-blue-600 border-blue-600 bg-blue-50">
                                  AI
                                </Badge>
                              )}
                            </div>
                            {load.location && <p className="text-xs text-neutral-500">{load.location}</p>}
                            <p className="text-xs text-neutral-400">
                              Created: {new Date(load.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getResourceBadge(load.algoAssignedResource, load)}
                          {load.algoAssignedResource && <Truck className="h-4 w-4 text-success" />}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getResourceBadge(load.humanReservedResource, load)}
                          {load.humanReservedResource && <Truck className="h-4 w-4 text-primary" />}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Badge className={getPriorityColor(load.priority)}>
                            {load.priority?.charAt(0).toUpperCase() + load.priority?.slice(1).toLowerCase()}
                          </Badge>
                          {load.remarkPriority && (
                            <div className="flex items-center space-x-1">
                              <span className="text-xs text-blue-600 font-medium">AI suggests:</span>
                              <Badge variant="outline" className="text-blue-600 border-blue-600">
                                {load.remarkPriority?.charAt(0).toUpperCase() + load.remarkPriority?.slice(1).toLowerCase()}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {load.deliveryDate ? (
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3 text-neutral-500" />
                              <span>{new Date(load.deliveryDate).toLocaleDateString()}</span>
                            </div>
                          ) : (
                            <span className="text-neutral-400">Not set</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={
                            load.deliveryStatus === "completed" ? "bg-success text-white" :
                            load.deliveryStatus === "in-progress" ? "bg-warning text-white" :
                            load.deliveryStatus === "cancelled" ? "bg-error text-white" :
                            "bg-neutral-400 text-white"
                          }
                        >
                          {load.deliveryStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-neutral-600">{load.remark || "-"}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {/* Resource Assignment Accept/Revert buttons */}
                          {load.humanReservedResource && load.algoAssignedResource && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="p-1 text-success hover:bg-success hover:text-white"
                                  onClick={() => acceptResourceMutation.mutate(load)}
                                  disabled={acceptResourceMutation.isPending}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Accept human resource assignment</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                          {load.humanReservedResource && !load.algoAssignedResource && load.remark?.includes('[Original algo:') && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="p-1 text-orange-600 hover:bg-orange-100"
                                  onClick={() => revertResourceMutation.mutate(load)}
                                  disabled={revertResourceMutation.isPending}
                                >
                                  <Undo2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Revert resource assignment</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                          
                          {/* Priority Accept/Revert buttons */}
                          {load.remarkPriority && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="p-1 text-blue-600 hover:bg-blue-100"
                                  onClick={() => acceptPriorityMutation.mutate(load)}
                                  disabled={acceptPriorityMutation.isPending}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Accept AI priority suggestion</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                          {!load.remarkPriority && load.remark?.includes('[Original priority:') && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="p-1 text-orange-600 hover:bg-orange-100"
                                  onClick={() => revertPriorityMutation.mutate(load)}
                                  disabled={revertPriorityMutation.isPending}
                                >
                                  <Undo2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Revert priority change</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-1 text-primary hover:bg-primary hover:text-white"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-1 text-warning hover:bg-warning hover:text-white"
                          >
                            <Truck className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-1 text-error hover:bg-error hover:text-white"
                            onClick={() => deleteMutation.mutate(load.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    {expandedRows.has(load.id) && (
                      <TableRow>
                        <TableCell colSpan={10} className="p-0">
                          <div className="p-4 bg-gray-50 border-t">
                            <JourneyMilestones customerLoadId={load.id} />
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
          {filteredLoads.length > 0 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <p className="text-sm text-neutral-700">
                Showing <span className="font-medium">{filteredLoads.length}</span> of{" "}
                <span className="font-medium">{loads.length}</span> results
              </p>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="default" size="sm">
                  1
                </Button>
                <Button variant="ghost" size="sm" disabled>
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
