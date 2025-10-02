import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AppLayout from "../../components/layout/app-layout";
import { medicalApi } from "../../lib/api";
import { Card, CardContent, CardHeader } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { AlertTriangle, CheckCircle, Plus, ListChecks, Edit, Calendar } from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { apiRequest } from "../../lib/queryClient";

export default function MedicalIndex() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [dateFilter, setDateFilter] = useState("today");
  const [typeFilter, setTypeFilter] = useState("all-types");
  
  const { data: tasks = [], isLoading } = useQuery<any[]>({
    queryKey: ["medical-tasks"],
    queryFn: medicalApi.getTasks,
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => medicalApi.updateTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medical-tasks"] });
      toast({
        title: "Task updated",
        description: "Medical task has been marked as complete",
      });
    },
  });

  const batchUpdateMutation = useMutation({
    mutationFn: async ({ taskIds, updates }: { taskIds: string[], updates: any }) => {
      return await apiRequest("/api/v1/medical/schedule/batch", "POST", { taskIds, updates });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["medical-tasks"] });
      setSelectedTasks(new Set());
      toast({
        title: "Tasks updated",
        description: `${data.updated} tasks have been marked as complete`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update tasks",
        variant: "destructive",
      });
    },
  });

  const handleMarkDone = (taskId: string) => {
    updateTaskMutation.mutate({ id: taskId, data: { is_completed: true } });
  };

  const handleEditTask = (taskId: string) => {
    setLocation(`/medical/${taskId}/edit`);
  };

  const handleRescheduleTask = (taskId: string) => {
    // For now, just navigate to edit page
    // In the future, we could have a quick reschedule modal
    setLocation(`/medical/${taskId}/edit`);
  };

  const handleToggleTask = (taskId: string) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId);
    } else {
      newSelected.add(taskId);
    }
    setSelectedTasks(newSelected);
  };

  const handleSelectAllOverdue = () => {
    const overdueIds = overdueTasks.map((t: any) => t.id);
    const newSelected = new Set(selectedTasks);
    overdueIds.forEach(id => newSelected.add(id));
    setSelectedTasks(newSelected);
  };

  const handleSelectAllToday = () => {
    const todayIds = todayTasks.map((t: any) => t.id);
    const newSelected = new Set(selectedTasks);
    todayIds.forEach(id => newSelected.add(id));
    setSelectedTasks(newSelected);
  };

  const handleBatchMarkDone = () => {
    if (selectedTasks.size === 0) {
      toast({
        title: "No tasks selected",
        description: "Please select at least one task to mark as done",
        variant: "destructive",
      });
      return;
    }
    batchUpdateMutation.mutate({
      taskIds: Array.from(selectedTasks),
      updates: { status: 'done' },
    });
  };

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  // Filter tasks based on date and type filters
  const filteredTasks = useMemo(() => {
    return tasks.filter((task: any) => {
      // Date filtering
      const dueDate = new Date(task.dueDate);
      let matchesDate = true;
      
      switch (dateFilter) {
        case "today":
          matchesDate = dueDate.getDate() === today.getDate() &&
                       dueDate.getMonth() === today.getMonth() &&
                       dueDate.getFullYear() === today.getFullYear();
          break;
        case "overdue":
          matchesDate = dueDate < today;
          break;
        case "week":
          matchesDate = dueDate >= today && dueDate <= weekFromNow;
          break;
        case "all":
        default:
          matchesDate = true;
      }
      
      // Type filtering
      let matchesType = true;
      if (typeFilter !== "all-types") {
        matchesType = task.type === typeFilter;
      }
      
      return matchesDate && matchesType;
    });
  }, [tasks, dateFilter, typeFilter, today, weekFromNow]);
  
  const overdueTasks = filteredTasks.filter((t: any) => 
    !t.is_completed && new Date(t.dueDate) < today
  );
  
  const todayTasks = filteredTasks.filter((t: any) => {
    const dueDate = new Date(t.dueDate);
    return !t.is_completed && 
           dueDate.getDate() === today.getDate() &&
           dueDate.getMonth() === today.getMonth() &&
           dueDate.getFullYear() === today.getFullYear();
  });

  return (
    <AppLayout 
      title="Medical Schedule" 
      subtitle={`${filteredTasks.length} of ${tasks.length} tasks • ${overdueTasks.length} overdue`}
    >
      <Card className="mb-6">
        <CardHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              <Select value={dateFilter} onValueChange={setDateFilter}>
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
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]" data-testid="select-type-filter">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-types">All Types</SelectItem>
                  <SelectItem value="vaccine">Vaccines</SelectItem>
                  <SelectItem value="treatment">Treatments</SelectItem>
                  <SelectItem value="exam">Exams</SelectItem>
                  <SelectItem value="surgery">Surgeries</SelectItem>
                  <SelectItem value="checkup">Checkups</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              {selectedTasks.size > 0 && (
                <Button 
                  variant="default" 
                  size="sm" 
                  data-testid="button-batch-mark-done"
                  onClick={handleBatchMarkDone}
                  disabled={batchUpdateMutation.isPending}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark {selectedTasks.size} as Done
                </Button>
              )}
              <Button 
                size="sm" 
                data-testid="button-add-task"
                onClick={() => setLocation("/medical/create")}
              >
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
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-destructive border-destructive" 
                    data-testid="button-select-all-overdue"
                    onClick={handleSelectAllOverdue}
                  >
                    Select All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {overdueTasks.map((task: any) => (
                    <div key={task.id} className="p-4 hover:bg-accent/50 transition-colors" data-testid={`task-overdue-${task.id}`}>
                      <div className="flex items-start gap-4">
                        <input 
                          type="checkbox" 
                          className="mt-1 w-5 h-5 rounded border-input text-primary cursor-pointer" 
                          data-testid={`checkbox-${task.id}`}
                          checked={selectedTasks.has(task.id)}
                          onChange={() => handleToggleTask(task.id)}
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-medium text-foreground" data-testid={`text-animal-${task.animalName}`}>
                                {task.animalName || 'Unknown'}
                              </p>
                              <p className="text-sm text-muted-foreground">{task.type} - {task.description}</p>
                            </div>
                            <Badge variant="destructive" data-testid={`badge-overdue-${task.id}`}>
                              Overdue
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            data-testid={`button-reschedule-${task.id}`}
                            onClick={() => handleRescheduleTask(task.id)}
                          >
                            <Calendar className="w-4 h-4 mr-1" />
                            Reschedule
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            data-testid={`button-edit-${task.id}`}
                            onClick={() => handleEditTask(task.id)}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
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
                <Button 
                  variant="outline" 
                  size="sm" 
                  data-testid="button-select-all-today"
                  onClick={handleSelectAllToday}
                >
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
                        <input 
                          type="checkbox" 
                          className="mt-1 w-5 h-5 rounded border-input text-primary cursor-pointer" 
                          data-testid={`checkbox-today-${task.id}`}
                          checked={selectedTasks.has(task.id)}
                          onChange={() => handleToggleTask(task.id)}
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-medium text-foreground">{task.animalName || 'Unknown'}</p>
                              <p className="text-sm text-muted-foreground">{task.type} - {task.description}</p>
                            </div>
                            <Badge className="bg-success/10 text-success">Due today</Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleRescheduleTask(task.id)}
                          >
                            <Calendar className="w-4 h-4 mr-1" />
                            Reschedule
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditTask(task.id)}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
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
