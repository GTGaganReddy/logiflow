import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Truck, Search, Filter, ArrowUpDown, Download } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { CustomerLoad } from "@shared/schema";

export default function CustomerLoadTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const { toast } = useToast();

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

  const filteredLoads = loads.filter((load) => {
    const matchesSearch = load.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         load.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = priorityFilter === "all" || load.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return "bg-error text-white";
      case "Medium": return "bg-warning text-white";
      case "Low": return "bg-neutral-400 text-white";
      default: return "bg-neutral-200 text-neutral-700";
    }
  };

  const getResourceBadge = (resource: string | null) => {
    if (!resource) return <Badge variant="secondary">-</Badge>;
    return <Badge className="bg-success text-white">{resource}</Badge>;
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
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
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
                  <TableHead>Sl. No</TableHead>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Algo Assigned Resource</TableHead>
                  <TableHead>Human Reserved Resource</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Remark</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLoads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-neutral-500">
                      No customer loads found. Add your first load to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLoads.map((load) => (
                    <TableRow key={load.id} className="hover:bg-neutral-50">
                      <TableCell>{load.slNo}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {getInitials(load.customerName)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-neutral-900">{load.customerName}</p>
                            {load.location && <p className="text-xs text-neutral-500">{load.location}</p>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getResourceBadge(load.algoAssignedResource)}
                          {load.algoAssignedResource && <Truck className="h-4 w-4 text-success" />}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getResourceBadge(load.humanReservedResource)}
                          {load.humanReservedResource && <Truck className="h-4 w-4 text-primary" />}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(load.priority)}>{load.priority}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-neutral-600">{load.remark || "-"}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
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
                  ))
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
