import AppLayout from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MetricCard } from "@/components/ui/metric-card";
import { TrendingUp, Clock, Heart, Activity, BarChart3, FileText, Download } from "lucide-react";

export default function ReportsIndex() {
  return (
    <AppLayout title="Reports & Analytics" subtitle="Track outcomes, compliance, and key metrics">
      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <MetricCard
          title="Live Release Rate"
          value="94.2%"
          icon={TrendingUp}
          iconColor="text-success"
          trend={{ value: "+2.3% vs last month", positive: true }}
          testId="metric-release-rate"
        />
        <MetricCard
          title="Avg Length of Stay"
          value="18 days"
          icon={Clock}
          iconColor="text-primary"
          trend={{ value: "-3 days vs last month", positive: true }}
          testId="metric-los"
        />
        <MetricCard
          title="Total Adoptions"
          value="156"
          icon={Heart}
          iconColor="text-destructive"
          trend={{ value: "This month" }}
          testId="metric-adoptions"
        />
        <MetricCard
          title="Medical Compliance"
          value="97.8%"
          icon={Activity}
          iconColor="text-warning"
          trend={{ value: "Tasks completed on time" }}
          testId="metric-compliance"
        />
      </div>

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
                <Select defaultValue="animals">
                  <SelectTrigger data-testid="select-entity">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="animals">Animals</SelectItem>
                    <SelectItem value="adoptions">Adoptions</SelectItem>
                    <SelectItem value="medical">Medical Records</SelectItem>
                    <SelectItem value="fosters">Foster Assignments</SelectItem>
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
              <Button data-testid="button-generate-report">
                <FileText className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
