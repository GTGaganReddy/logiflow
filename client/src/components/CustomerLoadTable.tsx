import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Truck, Search, Filter, ArrowUpDown, Download, Calendar, Clock, ChevronDown, ChevronRight, Check, Undo2, MessageCircle } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { CustomerLoad } from "@shared/schema";
import JourneyMilestones from "./JourneyMilestones";
import AIChatbot from "./AIChatbot";

export default function CustomerLoadTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [aiChatbot, setAiChatbot] = useState<{ isOpen: boolean; customerLoad: CustomerLoad | null }>({
    isOpen: false,
    customerLoad: null
  });
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
        aiAcceptanceCount: (load.aiAcceptanceCount || 0) + 1,
        incentivePoints: (load.incentivePoints || 0) + 2,
        // Keep human reserved resource as is
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customer-loads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Success",
        description: "Assignment accepted! +2 incentive points earned",
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
        aiAcceptanceCount: Math.max((load.aiAcceptanceCount || 0) - 1, 0),
        incentivePoints: Math.max((load.incentivePoints || 0) - 2, 0),
        // Keep human reserved resource as is
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customer-loads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Success",
        description: "Assignment reverted - Incentive points deducted",
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
        aiAcceptanceCount: (load.aiAcceptanceCount || 0) + 1,
        incentivePoints: (load.incentivePoints || 0) + 2,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customer-loads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Success",
        description: "Priority change accepted! +2 incentive points earned",
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
        aiAcceptanceCount: Math.max((load.aiAcceptanceCount || 0) - 1, 0),
        incentivePoints: Math.max((load.incentivePoints || 0) - 2, 0),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customer-loads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Success",
        description: "Priority change reverted - Incentive points deducted",
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
    <TooltipProvider>
      {/* Filter and Search */}
      <Card className="mb-4">
        <CardContent className="p-3">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="flex items-center space-x-3 w-full md:w-auto">
              <div className="relative flex-1 md:flex-none">
                <Search className="absolute left-2 top-2 h-3 w-3 text-neutral-400" />
                <Input
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-7 h-8 w-full md:w-60 text-sm"
                />
              </div>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[140px] h-8 text-sm">
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
            <div className="flex items-center space-x-1">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Filter className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <ArrowUpDown className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Download className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Load Management Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Customer Load Management</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="overflow-x-auto">
            <Table className="text-sm">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8 p-2"></TableHead>
                  <TableHead className="w-16 p-2">Sl. No</TableHead>
                  <TableHead className="min-w-[160px] p-2">Customer</TableHead>
                  <TableHead className="w-24 p-2">Algorithm</TableHead>
                  <TableHead className="w-24 p-2">Human Res.</TableHead>
                  <TableHead className="w-28 p-2">Priority</TableHead>
                  <TableHead className="w-20 p-2">Status</TableHead>
                  <TableHead className="w-40 p-2">Remark</TableHead>
                  <TableHead className="w-24 p-2">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLoads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-neutral-500">
                      No customer loads found. Add your first load to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLoads.map((load) => {
                    // Check if this load has AI suggestions (pending or accepted)
                    const hasPendingAISuggestions = Boolean(load.remarkPriority || (load.humanReservedResource && load.algoAssignedResource));
                    const hasAcceptedAISuggestions = Boolean(
                      (load.aiAcceptanceCount && load.aiAcceptanceCount > 0) || 
                      (load.remark && (load.remark.includes('[Original priority:') || load.remark.includes('[Original algo:'))) ||
                      (load.humanReservedResource && !load.algoAssignedResource && load.remark && load.remark.includes('[Original algo:'))
                    );
                    const hasAnyAISuggestions = hasPendingAISuggestions || hasAcceptedAISuggestions;
                    
                    return (
                    <React.Fragment key={load.id}>
                      <TableRow className={`hover:bg-neutral-50 ${hasPendingAISuggestions ? 'bg-blue-50 border-l-4 border-l-blue-400' : hasAcceptedAISuggestions ? 'bg-green-50 border-l-4 border-l-green-400' : ''}`}>
                        <TableCell className="p-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => toggleRowExpansion(load.id)}
                            className="h-6 w-6 p-0"
                          >
                            {expandedRows.has(load.id) ? (
                              <ChevronDown className="h-3 w-3" />
                            ) : (
                              <ChevronRight className="h-3 w-3" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell className="p-2 text-xs font-medium">{filteredLoads.indexOf(load) + 1}</TableCell>
                      <TableCell className="p-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-medium">
                            {getInitials(load.customerName)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center space-x-1">
                              <p className="text-sm font-medium text-neutral-900 truncate">{load.customerName}</p>
                              {hasAnyAISuggestions && (
                                <Badge variant="outline" className={`text-xs px-1.5 py-0.5 whitespace-nowrap ${
                                  hasPendingAISuggestions 
                                    ? 'text-blue-600 border-blue-600 bg-blue-50' 
                                    : 'text-green-600 border-green-600 bg-green-50'
                                }`}>
                                  {hasPendingAISuggestions ? 'AI' : 'AI ✓'}
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-neutral-500 truncate">{load.location || "No location"}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="p-2">
                        <div className="text-xs">
                          {load.aiSuggestionResource ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge 
                                  className="bg-blue-500 text-white text-xs px-2 py-1 cursor-pointer hover:bg-blue-600"
                                  onClick={() => setAiChatbot({ isOpen: true, customerLoad: load })}
                                >
                                  {load.aiSuggestionResource}
                                  <MessageCircle className="h-3 w-3 ml-1 inline" />
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>AI suggested resource - Click to chat about this assignment</p>
                              </TooltipContent>
                            </Tooltip>
                          ) : load.algoAssignedResource ? (
                            <Badge className="bg-success text-white text-xs px-2 py-1">{load.algoAssignedResource}</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs px-2 py-1">-</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="p-2">
                        <div className="text-xs">
                          {load.humanReservedResource ? (
                            <Badge className="bg-primary text-white text-xs px-2 py-1">{load.humanReservedResource}</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs px-2 py-1">-</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="p-2">
                        <div className="space-y-1">
                          <Badge className={getPriorityColor(load.priority) + " text-xs px-2 py-1"}>
                            {load.priority?.charAt(0).toUpperCase() + load.priority?.slice(1).toLowerCase()}
                          </Badge>
                          {load.remarkPriority && (
                            <div className="text-xs text-blue-600">
                              AI: <Badge variant="outline" className="text-blue-600 border-blue-600 text-xs px-1">
                                {load.remarkPriority?.charAt(0).toUpperCase() + load.remarkPriority?.slice(1).toLowerCase()}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="p-2">
                        <Badge 
                          className={
                            load.deliveryStatus === "completed" ? "bg-success text-white text-xs px-2 py-1" :
                            load.deliveryStatus === "in-progress" ? "bg-warning text-white text-xs px-2 py-1" :
                            load.deliveryStatus === "cancelled" ? "bg-error text-white text-xs px-2 py-1" :
                            "bg-neutral-400 text-white text-xs px-2 py-1"
                          }
                        >
                          {load.deliveryStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="p-2">
                        <div className="text-xs text-neutral-600 cursor-help" title={load.remark || "-"}>
                          {load.remark || "-"}
                        </div>
                      </TableCell>
                      <TableCell className="p-2">
                        <div className="flex items-center space-x-1">
                          {/* Resource Assignment Accept/Revert buttons */}
                          {load.humanReservedResource && load.algoAssignedResource && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="p-1 h-6 w-6 text-success hover:bg-success hover:text-white"
                                  onClick={() => acceptResourceMutation.mutate(load)}
                                  disabled={acceptResourceMutation.isPending}
                                >
                                  <Check className="h-3 w-3" />
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
                                  className="p-1 h-6 w-6 text-orange-600 hover:bg-orange-100"
                                  onClick={() => revertResourceMutation.mutate(load)}
                                  disabled={revertResourceMutation.isPending}
                                >
                                  <Undo2 className="h-3 w-3" />
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
                                  className="p-1 h-6 w-6 text-blue-600 hover:bg-blue-100"
                                  onClick={() => acceptPriorityMutation.mutate(load)}
                                  disabled={acceptPriorityMutation.isPending}
                                >
                                  <Check className="h-3 w-3" />
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
                                  className="p-1 h-6 w-6 text-orange-600 hover:bg-orange-100"
                                  onClick={() => revertPriorityMutation.mutate(load)}
                                  disabled={revertPriorityMutation.isPending}
                                >
                                  <Undo2 className="h-3 w-3" />
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
      
      {/* AI Chatbot */}
      {aiChatbot.customerLoad && (
        <AIChatbot
          isOpen={aiChatbot.isOpen}
          onClose={() => setAiChatbot({ isOpen: false, customerLoad: null })}
          customerLoad={aiChatbot.customerLoad}
          assistantId={aiChatbot.customerLoad.aiAssistantId}
        />
      )}
    </TooltipProvider>
  );
}
