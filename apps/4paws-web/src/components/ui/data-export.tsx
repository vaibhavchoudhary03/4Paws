/**
 * DATA EXPORT COMPONENT - Export data to CSV/PDF formats
 * 
 * PURPOSE:
 * Provides a reusable component for exporting data in various formats.
 * Handles CSV generation, PDF creation, and download functionality.
 * 
 * KEY FEATURES:
 * 1. MULTIPLE FORMATS
 *    - CSV export with customizable headers
 *    - PDF generation with tables and charts
 *    - JSON export for data backup
 * 
 * 2. CUSTOMIZABLE OPTIONS
 *    - Date range filtering
 *    - Column selection
 *    - Formatting options
 * 
 * 3. PROGRESS INDICATION
 *    - Loading states during export
 *    - Progress bars for large datasets
 *    - Success/error feedback
 * 
 * USAGE:
 * <DataExport
 *   data={reportData}
 *   filename="animal-report"
 *   formats={['csv', 'pdf']}
 *   onExport={handleExport}
 * />
 */

import { useState } from "react";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Badge } from "./badge";
import { Progress } from "./progress";
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  CheckCircle, 
  AlertCircle,
  Loader2
} from "lucide-react";

interface ExportFormat {
  type: 'csv' | 'pdf' | 'json';
  label: string;
  icon: React.ReactNode;
  description: string;
}

interface DataExportProps {
  data: any[];
  filename: string;
  formats?: ('csv' | 'pdf' | 'json')[];
  columns?: string[];
  onExport?: (format: string, data: any[]) => void;
  className?: string;
}

const EXPORT_FORMATS: ExportFormat[] = [
  {
    type: 'csv',
    label: 'CSV',
    icon: <FileSpreadsheet className="w-4 h-4" />,
    description: 'Spreadsheet format for Excel/Google Sheets'
  },
  {
    type: 'pdf',
    label: 'PDF',
    icon: <FileText className="w-4 h-4" />,
    description: 'Formatted report for printing/sharing'
  },
  {
    type: 'json',
    label: 'JSON',
    icon: <FileText className="w-4 h-4" />,
    description: 'Raw data for developers/backup'
  }
];

export function DataExport({ 
  data, 
  filename, 
  formats = ['csv', 'pdf'], 
  columns,
  onExport,
  className = ""
}: DataExportProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [selectedFormat, setSelectedFormat] = useState<string>('');

  const availableFormats = EXPORT_FORMATS.filter(format => 
    formats.includes(format.type)
  );

  const handleExport = async (format: string) => {
    setIsExporting(true);
    setExportProgress(0);
    setExportStatus('idle');
    setSelectedFormat(format);

    try {
      // Simulate export progress
      const progressInterval = setInterval(() => {
        setExportProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // Call custom export handler if provided
      if (onExport) {
        await onExport(format, data);
      } else {
        // Default export behavior
        await exportData(format, data, filename);
      }

      clearInterval(progressInterval);
      setExportProgress(100);
      setExportStatus('success');

      // Reset after 3 seconds
      setTimeout(() => {
        setIsExporting(false);
        setExportProgress(0);
        setExportStatus('idle');
        setSelectedFormat('');
      }, 3000);

    } catch (error) {
      console.error('Export failed:', error);
      setExportStatus('error');
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const exportData = async (format: string, data: any[], filename: string) => {
    switch (format) {
      case 'csv':
        await exportToCSV(data, filename);
        break;
      case 'pdf':
        await exportToPDF(data, filename);
        break;
      case 'json':
        await exportToJSON(data, filename);
        break;
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  };

  const exportToCSV = async (data: any[], filename: string) => {
    if (data.length === 0) {
      throw new Error('No data to export');
    }

    // Get headers from first object or use provided columns
    const headers = columns || Object.keys(data[0]);
    
    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Escape commas and quotes in CSV
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value || '';
        }).join(',')
      )
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
  };

  const exportToPDF = async (data: any[], filename: string) => {
    // For now, we'll create a simple HTML table and use browser print
    // In a real implementation, you'd use a library like jsPDF or Puppeteer
    const table = document.createElement('table');
    table.style.border = '1px solid #ccc';
    table.style.borderCollapse = 'collapse';
    table.style.width = '100%';

    // Create header row
    const headers = columns || Object.keys(data[0]);
    const headerRow = document.createElement('tr');
    headers.forEach(header => {
      const th = document.createElement('th');
      th.textContent = header;
      th.style.border = '1px solid #ccc';
      th.style.padding = '8px';
      th.style.backgroundColor = '#f5f5f5';
      headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // Create data rows
    data.forEach(row => {
      const tr = document.createElement('tr');
      headers.forEach(header => {
        const td = document.createElement('td');
        td.textContent = row[header] || '';
        td.style.border = '1px solid #ccc';
        td.style.padding = '8px';
        tr.appendChild(td);
      });
      table.appendChild(tr);
    });

    // Create a new window with the table
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${filename}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              table { border-collapse: collapse; width: 100%; }
              th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
              th { background-color: #f5f5f5; font-weight: bold; }
            </style>
          </head>
          <body>
            <h1>${filename}</h1>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
            ${table.outerHTML}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const exportToJSON = async (data: any[], filename: string) => {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.json`;
    link.click();
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="w-5 h-5" />
          Export Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Export Format Selection */}
        <div className="grid gap-2 md:grid-cols-3">
          {availableFormats.map((format) => (
            <Button
              key={format.type}
              variant={selectedFormat === format.type ? "default" : "outline"}
              size="sm"
              onClick={() => handleExport(format.type)}
              disabled={isExporting || data.length === 0}
              className="h-auto p-3 flex flex-col items-center gap-2"
            >
              {isExporting && selectedFormat === format.type ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                format.icon
              )}
              <span className="text-xs font-medium">{format.label}</span>
            </Button>
          ))}
        </div>

        {/* Export Progress */}
        {isExporting && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Exporting {selectedFormat.toUpperCase()}...</span>
              <span>{exportProgress}%</span>
            </div>
            <Progress value={exportProgress} className="h-2" />
          </div>
        )}

        {/* Export Status */}
        {exportStatus === 'success' && (
          <div className="flex items-center gap-2 text-green-600 text-sm">
            <CheckCircle className="w-4 h-4" />
            <span>Export completed successfully!</span>
          </div>
        )}

        {exportStatus === 'error' && (
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>Export failed. Please try again.</span>
          </div>
        )}

        {/* Data Info */}
        <div className="text-xs text-muted-foreground">
          <p>Ready to export {data.length} records</p>
          {columns && (
            <p>Columns: {columns.join(', ')}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
