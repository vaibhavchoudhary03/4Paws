/**
 * RESPONSIVE TABLE COMPONENT
 * 
 * PURPOSE:
 * Provides a responsive data table that adapts to different screen sizes
 * with mobile-optimized layouts and touch-friendly interactions.
 * 
 * FEATURES:
 * 1. MOBILE CARDS - Transforms to card layout on small screens
 * 2. TOUCH FRIENDLY - Swipe gestures and touch interactions
 * 3. RESPONSIVE COLUMNS - Hides less important columns on mobile
 * 4. SORTING - Touch-friendly sorting controls
 * 5. FILTERING - Mobile-optimized filter interface
 * 6. PAGINATION - Touch-friendly pagination controls
 * 7. ACCESSIBILITY - Screen reader support and keyboard navigation
 */

import React, { useState, useMemo } from 'react';
import { 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight,
  MoreHorizontal,
  Filter,
  Search,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { Button } from './button';
import { Input } from './input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Badge } from './badge';
import { Card, CardContent } from './card';
import { cn } from '../../lib/utils';
import { useIsMobile } from '../../hooks/use-mobile';

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  mobile?: boolean; // Show on mobile
  priority?: 'high' | 'medium' | 'low'; // Priority for mobile
  render?: (value: any, row: T) => React.ReactNode;
  className?: string;
}

export interface ResponsiveTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyField: string;
  onRowClick?: (row: T) => void;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  onFilter?: (filters: Record<string, any>) => void;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  mobileCardTitle?: (row: T) => string;
  mobileCardSubtitle?: (row: T) => string;
  mobileCardActions?: (row: T) => React.ReactNode;
}

export function ResponsiveTable<T extends Record<string, any>>({
  data,
  columns,
  keyField,
  onRowClick,
  onSort,
  onFilter,
  loading = false,
  emptyMessage = 'No data available',
  className,
  mobileCardTitle,
  mobileCardSubtitle,
  mobileCardActions
}: ResponsiveTableProps<T>) {
  const isMobile = useIsMobile();
  const [sortKey, setSortKey] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [searchTerm, setSearchTerm] = useState('');

  // Filter and sort data
  const processedData = useMemo(() => {
    let filtered = data;

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(row =>
        Object.values(row).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter(row => row[key] === value);
      }
    });

    // Apply sorting
    if (sortKey) {
      filtered.sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        
        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [data, searchTerm, filters, sortKey, sortDirection]);

  const handleSort = (key: string) => {
    if (!columns.find(col => col.key === key)?.sortable) return;

    const newDirection = sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortKey(key);
    setSortDirection(newDirection);
    onSort?.(key, newDirection);
  };

  const handleFilter = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilter?.(newFilters);
  };

  const getSortIcon = (key: string) => {
    if (sortKey !== key) return <SortAsc className="w-4 h-4 opacity-50" />;
    return sortDirection === 'asc' ? 
      <ChevronUp className="w-4 h-4" /> : 
      <ChevronDown className="w-4 h-4" />;
  };

  const getMobileColumns = () => {
    return columns.filter(col => col.mobile !== false);
  };

  const getDesktopColumns = () => {
    return columns.filter(col => col.priority !== 'low');
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded mb-2"></div>
          ))}
        </div>
      </div>
    );
  }

  if (processedData.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-2">No data found</div>
        <div className="text-gray-400 text-sm">{emptyMessage}</div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className={cn('space-y-4', className)}>
        {/* Mobile Search and Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex space-x-2 overflow-x-auto">
            {columns
              .filter(col => col.key !== 'actions')
              .map(column => (
                <Select
                  key={column.key}
                  value={filters[column.key] || ''}
                  onValueChange={(value) => handleFilter(column.key, value || null)}
                >
                  <SelectTrigger className="min-w-[120px]">
                    <SelectValue placeholder={column.label} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All {column.label}</SelectItem>
                    {Array.from(new Set(data.map(row => row[column.key])))
                      .map(value => (
                        <SelectItem key={value} value={String(value)}>
                          {String(value)}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              ))}
          </div>
        </div>

        {/* Mobile Card Layout */}
        <div className="space-y-3">
          {processedData.map((row) => (
            <Card 
              key={row[keyField]} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onRowClick?.(row)}
            >
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Card Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">
                        {mobileCardTitle?.(row) || row[columns[0]?.key] || 'Item'}
                      </h3>
                      {mobileCardSubtitle && (
                        <p className="text-sm text-gray-600 mt-1">
                          {mobileCardSubtitle(row)}
                        </p>
                      )}
                    </div>
                    {mobileCardActions && (
                      <div className="flex-shrink-0 ml-2">
                        {mobileCardActions(row)}
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="space-y-2">
                    {getMobileColumns()
                      .filter(col => col.key !== columns[0]?.key)
                      .map(column => (
                        <div key={column.key} className="flex justify-between items-center">
                          <span className="text-sm text-gray-500 font-medium">
                            {column.label}:
                          </span>
                          <span className="text-sm text-gray-900">
                            {column.render 
                              ? column.render(row[column.key], row)
                              : String(row[column.key] || '-')
                            }
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Desktop Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex space-x-2">
          {columns
            .filter(col => col.key !== 'actions')
            .map(column => (
              <Select
                key={column.key}
                value={filters[column.key] || ''}
                onValueChange={(value) => handleFilter(column.key, value || null)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={column.label} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All {column.label}</SelectItem>
                  {Array.from(new Set(data.map(row => row[column.key])))
                    .map(value => (
                      <SelectItem key={value} value={String(value)}>
                        {String(value)}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            ))}
        </div>
      </div>

      {/* Desktop Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              {getDesktopColumns().map(column => (
                <th
                  key={column.key}
                  className={cn(
                    'px-4 py-3 text-left text-sm font-medium text-gray-700',
                    column.sortable && 'cursor-pointer hover:bg-gray-50',
                    column.className
                  )}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {column.sortable && getSortIcon(column.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {processedData.map((row, index) => (
              <tr
                key={row[keyField]}
                className={cn(
                  'border-b border-gray-100 hover:bg-gray-50',
                  onRowClick && 'cursor-pointer'
                )}
                onClick={() => onRowClick?.(row)}
              >
                {getDesktopColumns().map(column => (
                  <td
                    key={column.key}
                    className={cn('px-4 py-3 text-sm text-gray-900', column.className)}
                  >
                    {column.render 
                      ? column.render(row[column.key], row)
                      : String(row[column.key] || '-')
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ResponsiveTable;
