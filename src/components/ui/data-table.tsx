'use client';

import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Filter,
  Download,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PAGINATION_CONFIG } from '@/lib/constants';

interface Column<T> {
  key: keyof T;
  header: string;
  cell?: (item: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  title?: string;
  searchable?: boolean;
  filterable?: boolean;
  pagination?: boolean;
  pageSize?: number;
  actions?: {
    label: string;
    onClick: (selectedItems: T[]) => void;
    icon?: React.ComponentType<{ className?: string }>;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  }[];
  onRowClick?: (item: T) => void;
  className?: string;
  emptyMessage?: string;
  loading?: boolean;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  title,
  searchable = true,
  filterable = true,
  pagination = true,
  pageSize = PAGINATION_CONFIG.defaultPageSize,
  actions,
  onRowClick,
  className,
  emptyMessage = 'No data available',
  loading = false,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPageSize, setSelectedPageSize] = useState(pageSize);
  const [sortColumn, setSortColumn] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedItems, setSelectedItems] = useState<T[]>([]);

  // Filter and sort data
  const filteredData = useMemo(() => {
    let result = data;

    // Search
    if (searchTerm) {
      result = result.filter(item =>
        columns.some(column => {
          const value = item[column.key];
          return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }

    // Sort
    if (sortColumn) {
      result = [...result].sort((a, b) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, searchTerm, sortColumn, sortDirection, columns]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / selectedPageSize);
  const startIndex = (currentPage - 1) * selectedPageSize;
  const endIndex = startIndex + selectedPageSize;
  const paginatedData = pagination ? filteredData.slice(startIndex, endIndex) : filteredData;

  // Handle sorting
  const handleSort = (column: keyof T) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Handle row selection
  const handleRowSelect = (item: T) => {
    setSelectedItems(prev => {
      const isSelected = prev.some(selected => selected === item);
      if (isSelected) {
        return prev.filter(selected => selected !== item);
      } else {
        return [...prev, item];
      }
    });
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedItems.length === paginatedData.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems([...paginatedData]);
    }
  };

  // Reset pagination when search changes
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <div className="flex items-center space-x-2">
            {actions && selectedItems.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  {selectedItems.length} selected
                </span>
                {actions.map((action, index) => (
                  <Button
                    key={index}
                    variant={action.variant || 'default'}
                    size="sm"
                    onClick={() => action.onClick(selectedItems)}
                  >
                    {action.icon && <action.icon className="mr-2 h-4 w-4" />}
                    {action.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Search and filters */}
        <div className="flex items-center space-x-4">
          {searchable && (
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          )}

          {pagination && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Show:</span>
              <Select
                value={selectedPageSize.toString()}
                onValueChange={(value) => {
                  setSelectedPageSize(Number(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGINATION_CONFIG.pageSizeOptions.map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {actions && (
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === paginatedData.length && paginatedData.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </TableHead>
                )}
                {columns.map((column) => (
                  <TableHead
                    key={String(column.key)}
                    className={cn(
                      column.sortable && 'cursor-pointer hover:bg-muted/50',
                      column.width
                    )}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column.header}</span>
                      {column.sortable && sortColumn === column.key && (
                        <span className="text-xs">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length + (actions ? 1 : 0)} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + (actions ? 1 : 0)} className="text-center py-8">
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((item, index) => (
                  <TableRow
                    key={index}
                    className={cn(
                      onRowClick && 'cursor-pointer hover:bg-muted/50',
                      selectedItems.includes(item) && 'bg-muted/50'
                    )}
                    onClick={() => onRowClick?.(item)}
                  >
                    {actions && (
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item)}
                          onChange={() => handleRowSelect(item)}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded border-gray-300"
                        />
                      </TableCell>
                    )}
                    {columns.map((column) => (
                      <TableCell key={String(column.key)}>
                        {column.cell ? column.cell(item) : (() => {
                          const value = item[column.key];
                          if (value === null || value === undefined) return '';
                          if (typeof value === 'object') return JSON.stringify(value);
                          return String(value);
                        })()}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {pagination && totalPages > 1 && (
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredData.length)} of{' '}
              {filteredData.length} results
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="w-8 h-8 p-0"
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 