import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Save, Trash2, Brain } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Notepad } from "@shared/schema";

export default function LogisticsNotepad() {
  const [content, setContent] = useState("");
  const [lastSaved, setLastSaved] = useState<string>("");
  const { toast } = useToast();

  const { data: notepad } = useQuery<Notepad>({
    queryKey: ["/api/notepad"],
  });

  const saveMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", "/api/notepad", { content });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/notepad"] });
      setLastSaved(new Date(data.updatedAt).toLocaleString());
      toast({
        title: "Success",
        description: "Notes saved successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save notes",
        variant: "destructive",
      });
    },
  });

  // Auto-save functionality
  useEffect(() => {
    if (content && content !== notepad?.content) {
      const timer = setTimeout(() => {
        saveMutation.mutate(content);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [content, notepad?.content]);

  // Initialize content from server data
  useEffect(() => {
    if (notepad) {
      setContent(notepad.content);
      setLastSaved(new Date(notepad.updatedAt).toLocaleString());
    }
  }, [notepad]);

  const handleSave = () => {
    saveMutation.mutate(content);
  };

  const handleClear = () => {
    setContent("");
    saveMutation.mutate("");
  };

  const handleProcessNotes = () => {
    // TODO: Implement GPT processing
    toast({
      title: "Processing Notes",
      description: "GPT agent integration will be implemented to process notes and update the dashboard",
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Logistics Notes</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={handleSave} disabled={saveMutation.isPending}>
              <Save className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleClear}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter logistics notes and planning information here...

Examples:
- Add customer ABC Corp with high priority and assign TRK-005
- Update Global Logistics to medium priority  
- Reserve TRK-008 for urgent delivery tomorrow
- Check maintenance schedule for TRK-012

The GPT agent will process these notes and update the dashboard accordingly."
          className="min-h-[256px] resize-none"
        />
        
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-neutral-500">
            {saveMutation.isPending ? "Saving..." : lastSaved ? `Last saved: ${lastSaved}` : "Not saved yet"}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleProcessNotes}
            className="flex items-center space-x-2"
          >
            <Brain className="h-4 w-4" />
            <span>Process with AI</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
