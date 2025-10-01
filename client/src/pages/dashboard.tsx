import { useQuery } from "@tanstack/react-query";
import AppLayout from "@/components/layout/app-layout";
import { medicalApi, animalsApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dog, Stethoscope, HeartHandshake, HeartPulse, TrendingUp, AlertTriangle, Calendar, CheckCircle } from "lucide-react";

export default function Dashboard() {
  const { data: animals = [] } = useQuery<any[]>({
    queryKey: ["/api/v1/animals"],
  });

  const { data: medicalTasks = [] } = useQuery<any[]>({
    queryKey: ["/api/v1/medical/schedule"],
  });

  const stats = {
    totalAnimals: animals.length,
    available: animals.filter((a: any) => a.status === 'available').length,
    fostered: animals.filter((a: any) => a.status === 'fostered').length,
    overdueTasks: medicalTasks.filter((t: any) => t.status === 'scheduled' && new Date(t.dueDate) < new Date()).length,
  };

  return (
    <AppLayout title="Dashboard" subtitle="Welcome back! Here's what's happening today.">
      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card data-testid="card-stat-total">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">Animals in Care</p>
              <Dog className="w-5 h-5 text-primary" />
            </div>
            <p className="text-3xl font-bold text-foreground" data-testid="text-total-animals">{stats.totalAnimals}</p>
            <p className="text-xs text-success mt-2">
              <TrendingUp className="w-3 h-3 inline mr-1" />
              Active animals
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-stat-available">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">Available</p>
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <p className="text-3xl font-bold text-foreground" data-testid="text-available-animals">{stats.available}</p>
            <p className="text-xs text-muted-foreground mt-2">Ready for adoption</p>
          </CardContent>
        </Card>

        <Card data-testid="card-stat-fostered">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">In Foster</p>
              <HeartPulse className="w-5 h-5 text-secondary" />
            </div>
            <p className="text-3xl font-bold text-foreground" data-testid="text-fostered-animals">{stats.fostered}</p>
            <p className="text-xs text-muted-foreground mt-2">With fosters</p>
          </CardContent>
        </Card>

        <Card data-testid="card-stat-overdue">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">Medical Tasks Due</p>
              <Stethoscope className="w-5 h-5 text-warning" />
            </div>
            <p className="text-3xl font-bold text-foreground" data-testid="text-overdue-tasks">{stats.overdueTasks}</p>
            <p className="text-xs text-destructive mt-2">
              <AlertTriangle className="w-3 h-3 inline mr-1" />
              {stats.overdueTasks} overdue
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {stats.overdueTasks > 0 && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex items-start space-x-3 mb-6" data-testid="alert-overdue-tasks">
          <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-destructive">
              {stats.overdueTasks} Overdue Medical Tasks
            </p>
            <p className="text-sm text-destructive/80 mt-1">
              Medical schedules need immediate attention
            </p>
          </div>
          <Button variant="outline" size="sm" className="text-destructive border-destructive" data-testid="button-view-overdue">
            View All
          </Button>
        </div>
      )}

      {/* Today's Medical Tasks */}
      <Card data-testid="card-medical-tasks">
        <CardHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Today's Medical Tasks</CardTitle>
              <p className="text-sm text-muted-foreground mt-1" data-testid="text-tasks-count">
                {medicalTasks.length} tasks
              </p>
            </div>
            <Button variant="outline" size="sm" data-testid="button-batch-actions">Batch Actions</Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {medicalTasks.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground" data-testid="empty-tasks">
                <Stethoscope className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No medical tasks scheduled</p>
              </div>
            ) : (
              medicalTasks.slice(0, 5).map((task: any) => (
                <div key={task.id} className="p-4 hover:bg-accent/50 transition-colors" data-testid={`task-${task.id}`}>
                  <div className="flex items-start gap-4">
                    <input type="checkbox" className="mt-1 w-5 h-5 rounded border-input text-primary" data-testid={`checkbox-task-${task.id}`} />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-foreground" data-testid={`text-animal-${task.animal?.name}`}>
                            {task.animal?.name || 'Unknown'}
                          </p>
                          <p className="text-sm text-muted-foreground">{task.type} - {task.notes}</p>
                        </div>
                        <Badge variant={task.status === 'scheduled' ? 'secondary' : 'default'} data-testid={`badge-status-${task.id}`}>
                          {task.status}
                        </Badge>
                      </div>
                    </div>
                    <Button size="sm" className="bg-success hover:bg-success/90" data-testid={`button-complete-${task.id}`}>
                      Mark Done
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
