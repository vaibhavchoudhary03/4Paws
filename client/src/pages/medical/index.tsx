import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AppLayout from "@/components/layout/app-layout";
import { medicalApi } from "@/lib/api";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Plus, ListChecks } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function MedicalIndex() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: tasks = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/v1/medical/schedule"],
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => medicalApi.updateTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v1/medical/schedule"] });
      toast({
        title: "Task updated",
        description: "Medical task has been marked as complete",
      });
    },
  });

  const handleMarkDone = (taskId: string) => {
    updateTaskMutation.mutate({ id: taskId, data: { status: 'done' } });
  };

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const overdueTasks = tasks.filter((t: any) => 
    t.status === 'scheduled' && new Date(t.dueDate) < today
  );
  
  const todayTasks = tasks.filter((t: any) => {
    const dueDate = new Date(t.dueDate);
    return t.status === 'scheduled' && 
           dueDate.getDate() === today.getDate() &&
           dueDate.getMonth() === today.getMonth() &&
           dueDate.getFullYear() === today.getFullYear();
  });

  return (
    <AppLayout 
      title="Medical Schedule" 
      subtitle={`${tasks.length} tasks • ${overdueTasks.length} overdue`}
    >
      <Card className="mb-6">
        <CardHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              <Select defaultValue="today">
                <SelectTrigger className="w-[180px]" data-testid="select-date-filter">
                  <SelectValue placeholder="All Dates" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dates</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all-types">
                <SelectTrigger className="w-[180px]" data-testid="select-type-filter">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-types">All Types</SelectItem>
                  <SelectItem value="vaccine">Vaccines</SelectItem>
                  <SelectItem value="treatment">Treatments</SelectItem>
                  <SelectItem value="exam">Exams</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" data-testid="button-batch-actions">
                <ListChecks className="w-4 h-4 mr-2" />
                Batch Actions
              </Button>
              <Button size="sm" data-testid="button-add-task">
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {isLoading ? (
        <div className="text-center py-12" data-testid="loading-tasks">
          <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Overdue Section */}
          {overdueTasks.length > 0 && (
            <Card className="border-destructive/50" data-testid="section-overdue">
              <CardHeader className="bg-destructive/5 border-b border-border">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-destructive flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Overdue ({overdueTasks.length})
                  </h3>
                  <Button variant="outline" size="sm" className="text-destructive border-destructive" data-testid="button-select-all-overdue">
                    Select All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {overdueTasks.map((task: any) => (
                    <div key={task.id} className="p-4 hover:bg-accent/50 transition-colors" data-testid={`task-overdue-${task.id}`}>
                      <div className="flex items-start gap-4">
                        <input type="checkbox" className="mt-1 w-5 h-5 rounded border-input text-primary" data-testid={`checkbox-${task.id}`} />
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-medium text-foreground" data-testid={`text-animal-${task.animal?.name}`}>
                                {task.animal?.name || 'Unknown'}
                              </p>
                              <p className="text-sm text-muted-foreground">{task.type} - {task.notes}</p>
                            </div>
                            <Badge variant="destructive" data-testid={`badge-overdue-${task.id}`}>
                              Overdue
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" data-testid={`button-reschedule-${task.id}`}>
                            Reschedule
                          </Button>
                          <Button 
                            size="sm" 
                            className="bg-success hover:bg-success/90"
                            onClick={() => handleMarkDone(task.id)}
                            data-testid={`button-done-${task.id}`}
                          >
                            Mark Done
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Today's Tasks */}
          <Card data-testid="section-today">
            <CardHeader className="border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success" />
                  Due Today ({todayTasks.length})
                </h3>
                <Button variant="outline" size="sm" data-testid="button-select-all-today">
                  Select All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {todayTasks.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground" data-testid="empty-today">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No tasks due today</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {todayTasks.map((task: any) => (
                    <div key={task.id} className="p-4 hover:bg-accent/50 transition-colors" data-testid={`task-today-${task.id}`}>
                      <div className="flex items-start gap-4">
                        <input type="checkbox" className="mt-1 w-5 h-5 rounded border-input text-primary" />
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-medium text-foreground">{task.animal?.name || 'Unknown'}</p>
                              <p className="text-sm text-muted-foreground">{task.type} - {task.notes}</p>
                            </div>
                            <Badge className="bg-success/10 text-success">Due today</Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Reschedule</Button>
                          <Button 
                            size="sm" 
                            className="bg-success hover:bg-success/90"
                            onClick={() => handleMarkDone(task.id)}
                          >
                            Mark Done
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </AppLayout>
  );
}
