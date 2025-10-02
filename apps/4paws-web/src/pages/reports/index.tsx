import { useState } from "react";
import AppLayout from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MetricCard } from "@/components/ui/metric-card";
import { TrendingUp, Clock, Heart, Activity, BarChart3, FileText, Download, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface ReportMetrics {
  liveReleaseRate: string;
  avgLengthOfStay: string;
  totalAdoptionsThisMonth: number;
  medicalCompliance: string;
}

export default function ReportsIndex() {
  const [entityType, setEntityType] = useState("animals");
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();
  
  const { data: metrics, isLoading } = useQuery<ReportMetrics>({
    queryKey: ["reports-metrics"],
    queryFn: async () => {
      // Mock metrics for now - in a real app, this would calculate from actual data
      return {
        liveReleaseRate: "87.5%",
        avgLengthOfStay: "23 days",
        totalAdoptionsThisMonth: 42,
        medicalCompliance: "94.2%",
      };
    },
  });

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const response = await fetch(`/api/v1/reports/export/csv?entity=${entityType}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Export failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${entityType}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Success",
        description: `${entityType} exported successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <AppLayout title="Reports & Analytics" subtitle="Track outcomes, compliance, and key metrics">
      {/* Quick Stats */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12 mb-6">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <MetricCard
            title="Live Release Rate"
            value={metrics?.liveReleaseRate || "0.0%"}
            icon={TrendingUp}
            iconColor="text-success"
            trend={{ value: "Adoptions, transfers, RTOs" }}
            testId="metric-release-rate"
          />
          <MetricCard
            title="Avg Length of Stay"
            value={metrics?.avgLengthOfStay || "0 days"}
            icon={Clock}
            iconColor="text-primary"
            trend={{ value: "From intake to outcome" }}
            testId="metric-los"
          />
          <MetricCard
            title="Total Adoptions"
            value={metrics?.totalAdoptionsThisMonth?.toString() || "0"}
            icon={Heart}
            iconColor="text-destructive"
            trend={{ value: "This month" }}
            testId="metric-adoptions"
          />
          <MetricCard
            title="Medical Compliance"
            value={metrics?.medicalCompliance || "100.0%"}
            icon={Activity}
            iconColor="text-warning"
            trend={{ value: "Tasks completed" }}
            testId="metric-compliance"
          />
        </div>
      )}

      {/* Canned Reports */}
      <Card className="mb-6" data-testid="card-canned-reports">
        <CardHeader>
          <CardTitle>Quick Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid lg:grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              className="h-auto p-4 justify-start"
              data-testid="button-report-intake-outcomes"
            >
              <div className="flex items-center space-x-3 w-full">
                <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-5 h-5 text-success" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-medium text-foreground">Monthly Intake/Outcomes</p>
                  <p className="text-xs text-muted-foreground">View intake sources and outcomes</p>
                </div>
                <Download className="w-5 h-5 text-muted-foreground" />
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="h-auto p-4 justify-start"
              data-testid="button-report-los"
            >
              <div className="flex items-center space-x-3 w-full">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-medium text-foreground">Length of Stay Analysis</p>
                  <p className="text-xs text-muted-foreground">Average and breakdown by species</p>
                </div>
                <Download className="w-5 h-5 text-muted-foreground" />
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="h-auto p-4 justify-start"
              data-testid="button-report-medical"
            >
              <div className="flex items-center space-x-3 w-full">
                <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Activity className="w-5 h-5 text-warning" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-medium text-foreground">Medical Compliance</p>
                  <p className="text-xs text-muted-foreground">Vaccine and treatment completion</p>
                </div>
                <Download className="w-5 h-5 text-muted-foreground" />
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="h-auto p-4 justify-start"
              data-testid="button-report-foster"
            >
              <div className="flex items-center space-x-3 w-full">
                <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Heart className="w-5 h-5 text-secondary-foreground" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-medium text-foreground">Foster Utilization</p>
                  <p className="text-xs text-muted-foreground">Foster capacity and activity</p>
                </div>
                <Download className="w-5 h-5 text-muted-foreground" />
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Custom Report Builder */}
      <Card data-testid="card-custom-reports">
        <CardHeader>
          <CardTitle>Custom Report Builder</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Date Range</label>
                <Select defaultValue="last-30">
                  <SelectTrigger data-testid="select-date-range">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="last-30">Last 30 days</SelectItem>
                    <SelectItem value="last-90">Last 90 days</SelectItem>
                    <SelectItem value="this-year">This year</SelectItem>
                    <SelectItem value="custom">Custom range</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Entity Type</label>
                <Select value={entityType} onValueChange={setEntityType}>
                  <SelectTrigger data-testid="select-entity">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="animals">Animals</SelectItem>
                    <SelectItem value="people">People</SelectItem>
                    <SelectItem value="adoptions">Adoptions</SelectItem>
                    <SelectItem value="medical">Medical Records</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Export Format</label>
                <Select defaultValue="csv">
                  <SelectTrigger data-testid="select-format">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Columns to Include</label>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                {['ID', 'Name', 'Species', 'Status', 'Intake Date', 'Outcome Date', 'Location', 'Medical Status'].map((col) => (
                  <label key={col} className="flex items-center" data-testid={`checkbox-col-${col.toLowerCase().replace(/\s+/g, '-')}`}>
                    <input 
                      type="checkbox" 
                      defaultChecked={['ID', 'Name', 'Species', 'Status'].includes(col)}
                      className="w-4 h-4 text-primary border-input rounded focus:ring-ring mr-2"
                    />
                    <span className="text-sm text-foreground">{col}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <Button 
                onClick={handleExport} 
                disabled={isExporting}
                data-testid="button-generate-report"
              >
                {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
                {isExporting ? 'Exporting...' : 'Generate Report'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
