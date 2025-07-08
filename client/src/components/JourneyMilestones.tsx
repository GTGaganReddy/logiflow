import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { JourneyMilestone } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Coffee, CheckCircle, Circle, XCircle, Edit2, Save, X } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface JourneyMilestonesProps {
  customerLoadId: number;
}

export default function JourneyMilestones({ customerLoadId }: JourneyMilestonesProps) {
  const [editingNote, setEditingNote] = useState<number | null>(null);
  const [noteValue, setNoteValue] = useState("");
  const { toast } = useToast();

  const { data: milestones = [], isLoading, error } = useQuery<JourneyMilestone[]>({
    queryKey: ["/api/journey-milestones", customerLoadId],
    queryFn: async () => {
      const response = await fetch(`/api/journey-milestones/${customerLoadId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: number; notes: string }) => {
      await apiRequest("PUT", `/api/journey-milestones/${id}`, { notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journey-milestones", customerLoadId] });
      setEditingNote(null);
      setNoteValue("");
      toast({
        title: "Success",
        description: "Milestone note updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update milestone note",
        variant: "destructive",
      });
    },
  });

  const startEditing = (milestoneId: number, currentNote: string | null) => {
    setEditingNote(milestoneId);
    setNoteValue(currentNote || "");
  };

  const saveNote = (milestoneId: number) => {
    updateNoteMutation.mutate({ id: milestoneId, notes: noteValue.trim() });
  };

  const cancelEditing = () => {
    setEditingNote(null);
    setNoteValue("");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "in-progress":
        return <Circle className="h-4 w-4 text-blue-600 animate-pulse" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "in-progress": return "bg-blue-100 text-blue-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    // Parse the date string safely to avoid timezone issues
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month is 0-indexed
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatBreakTime = (breakTime: string | null) => {
    if (!breakTime) return "None";
    const minutes = parseInt(breakTime);
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    }
    return `${minutes}m`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Journey Milestones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Journey Milestones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-600">
            Error loading journey milestones
          </div>
        </CardContent>
      </Card>
    );
  }

  if (milestones.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Journey Milestones</CardTitle>
          <CardDescription>No journey milestones have been created for this load yet.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Journey Milestones
        </CardTitle>
        <CardDescription>
          Track the progress of this delivery through various checkpoints
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Step</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Schedule</TableHead>
              <TableHead className="w-20">Break</TableHead>
              <TableHead className="w-20">Status</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {milestones
              .sort((a, b) => a.sequenceNumber - b.sequenceNumber)
              .map((milestone) => (
                <TableRow key={milestone.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(milestone.status)}
                      {milestone.sequenceNumber}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm font-medium">{milestone.startingPoint}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <span>→</span>
                        <span>{milestone.endingPoint}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm">
                        <span className="font-medium">{formatDate(milestone.startDate)}</span>
                        <span className="text-gray-500"> at </span>
                        <span>{milestone.startTime}</span>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">{formatDate(milestone.endDate)}</span>
                        <span className="text-gray-500"> at </span>
                        <span>{milestone.endTime}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Coffee className="h-3 w-3 text-gray-400" />
                      {formatBreakTime(milestone.breakTime)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(milestone.status)}>
                      {milestone.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {editingNote === milestone.id ? (
                      <div className="flex items-center gap-2 max-w-xs">
                        <Input
                          value={noteValue}
                          onChange={(e) => setNoteValue(e.target.value)}
                          placeholder="Add a note..."
                          className="text-sm"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              saveNote(milestone.id);
                            } else if (e.key === "Escape") {
                              cancelEditing();
                            }
                          }}
                          autoFocus
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => saveNote(milestone.id)}
                          disabled={updateNoteMutation.isPending}
                          className="h-8 w-8 p-0"
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={cancelEditing}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 group max-w-xs">
                        <div className="text-sm text-gray-600 flex-1">
                          {milestone.notes || "No notes"}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEditing(milestone.id, milestone.notes)}
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}