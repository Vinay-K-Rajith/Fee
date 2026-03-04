import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { useDefaulterAnalysis, formatCurrency, formatPercentage } from '@/hooks/use-api';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MapPin, DollarSign } from 'lucide-react';

interface DefaulterRecord {
  id: string;
  occupation: string;
  location: string;
  defaulterCount: number;
  totalBalance: number;
  defaulterRate: number;
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
}

export function DefaultersTable() {
  const { data: analysis, isLoading, error } = useDefaulterAnalysis();
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');

  if (isLoading) {
    return (
      <Card className="border-none shadow-md" style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.03)' }}>
        <div className="p-6">
          <Skeleton className="h-10 w-full mb-4" />
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-14 w-full mb-2" />
          ))}
        </div>
      </Card>
    );
  }

  if (error || !analysis) {
    return (
      <Card className="border-none shadow-md p-6">
        <p className="text-red-500">Failed to load defaulter data</p>
      </Card>
    );
  }

  // Helper function to determine risk level
  const getRiskLevel = (rate: number): 'critical' | 'high' | 'medium' | 'low' => {
    if (rate > 20) return 'critical';
    if (rate > 15) return 'high';
    if (rate > 10) return 'medium';
    return 'low';
  };

  // Prepare defaulter records from location data
  const defaulterRecords: DefaulterRecord[] = analysis.locationWise.map((loc, idx) => ({
    id: `loc-${idx}`,
    occupation: loc.location,
    location: loc.location,
    defaulterCount: loc.defaulterCount,
    totalBalance: loc.totalBalance,
    defaulterRate: loc.defaulterRate,
    riskLevel: getRiskLevel(loc.defaulterRate),
  }));

  // Filter and search
  let filtered = defaulterRecords;
  if (searchTerm) {
    filtered = filtered.filter(
      (r) =>
        r.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.occupation.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  if (riskFilter !== 'all') {
    filtered = filtered.filter((r) => r.riskLevel === riskFilter);
  }

  // Sort by default rate descending
  filtered = filtered.sort((a, b) => b.defaulterRate - a.defaulterRate);

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'high':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'medium':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getRateColor = (rate: number): string => {
    if (rate > 20) return '#DC2626';
    if (rate > 15) return '#F97316';
    if (rate > 10) return '#EAB308';
    return '#16A34A';
  };



  return (
    <Card className="border-none shadow-md" style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.03)' }}>
      <div className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-black text-[#1E293B] uppercase tracking-widest mb-4 font-roboto">
            Location-wise Defaulter Analysis
          </h3>

          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <Input
              placeholder="Search location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk Levels</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-slate-200 hover:bg-transparent">
                <TableHead className="text-[#64748B] font-black text-xs uppercase">Location</TableHead>
                <TableHead className="text-[#64748B] font-black text-xs uppercase text-right">Defaulters</TableHead>
                <TableHead className="text-[#64748B] font-black text-xs uppercase text-right">Default Rate</TableHead>
                <TableHead className="text-[#64748B] font-black text-xs uppercase text-right">Outstanding Balance</TableHead>
                <TableHead className="text-[#64748B] font-black text-xs uppercase">Risk Level</TableHead>
                <TableHead className="text-[#64748B] font-black text-xs uppercase">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((record) => (
                <TableRow key={record.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <TableCell className="py-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#64748B]" />
                      <span className="font-semibold text-[#1E293B] text-sm">{record.location}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 text-right">
                    <span className="font-bold text-[#1E293B]">{record.defaulterCount}</span>
                  </TableCell>
                  <TableCell className="py-4 text-right">
                    <span
                      className="font-bold text-sm"
                      style={{
                        color: getRateColor(record.defaulterRate),
                      }}
                    >
                      {formatPercentage(record.defaulterRate)}
                    </span>
                  </TableCell>
                  <TableCell className="py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <DollarSign className="w-4 h-4 text-[#64748B]" />
                      <span className="font-semibold text-[#1E293B]">
                        {formatCurrency(record.totalBalance, true)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <Badge
                      className={`capitalize text-xs font-black border ${getRiskColor(record.riskLevel)}`}
                    >
                      {record.riskLevel}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs text-[#3B82F6] border-[#3B82F6] hover:bg-blue-50"
                    >
                      Target
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-8">
            <p className="text-[#64748B] text-sm">No defaulter records found</p>
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-200">
          <div className="text-center">
            <p className="text-[#64748B] text-xs uppercase font-bold tracking-wider mb-1">Total Locations</p>
            <p className="text-xl font-black text-[#1E293B]">{analysis.locationWise.length}</p>
          </div>
          <div className="text-center">
            <p className="text-[#64748B] text-xs uppercase font-bold tracking-wider mb-1">Avg Default Rate</p>
            <p className="text-xl font-black text-[#F59E0B]">
              {formatPercentage(analysis.locationWise.reduce((sum, l) => sum + l.defaulterRate, 0) / analysis.locationWise.length)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[#64748B] text-xs uppercase font-bold tracking-wider mb-1">Total Defaulters</p>
            <p className="text-xl font-black text-[#DC2626]">
              {analysis.locationWise.reduce((sum, l) => sum + l.defaulterCount, 0)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[#64748B] text-xs uppercase font-bold tracking-wider mb-1">Outstanding</p>
            <p className="text-xl font-black text-[#1E293B]">
              {formatCurrency(analysis.locationWise.reduce((sum, l) => sum + l.totalBalance, 0), true)}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
