// src/app/performance-data/page.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getPerformanceData, type PerformanceDataFilters } from '@/services/api';
import type { PerformanceDataEntry } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Filter, Database, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const PerformanceDataPage: React.FC = () => {
  const [allData, setAllData] = useState<PerformanceDataEntry[]>([]); // Store all data for the initially fetched date
  const [filteredData, setFilteredData] = useState<PerformanceDataEntry[]>([]); // Data to display after client-side filtering
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const today = new Date().toISOString().split('T')[0];
  const [dateFilter, setDateFilter] = useState<string>(today);
  const [cityFilter, setCityFilter] = useState<string>('');
  const [ragFilter, setRagFilter] = useState<string>('');

  // Fetch data only when dateFilter changes
  const fetchDataForDate = useCallback(async (selectedDate: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const apiFilters: PerformanceDataFilters = { record_date: selectedDate };
      const result = await getPerformanceData(apiFilters);
      setAllData(result);
      setFilteredData(result); // Initially, filteredData is same as allData for the date
      // Reset client-side filters when new date data is fetched
      setCityFilter(''); 
      setRagFilter('');
    } catch (err) {
      console.error("Failed to load performance data:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      setAllData([]);
      setFilteredData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (dateFilter) {
      fetchDataForDate(dateFilter);
    } else {
      setAllData([]); // Clear data if no date is selected
      setFilteredData([]);
      setIsLoading(false);
    }
  }, [dateFilter, fetchDataForDate]);

  // Apply client-side filters
  useEffect(() => {
    let currentData = [...allData];
    if (cityFilter) {
      currentData = currentData.filter(item => item.city === cityFilter);
    }
    if (ragFilter) {
      currentData = currentData.filter(item => item.rag_profile === ragFilter);
    }
    setFilteredData(currentData);
  }, [allData, cityFilter, ragFilter]);

  const uniqueCities = useMemo(() => {
    const cities = new Set(allData.map(item => item.city));
    return Array.from(cities).sort();
  }, [allData]);

  const uniqueRagProfiles = useMemo(() => {
    const profiles = new Set(allData.map(item => item.rag_profile));
    return Array.from(profiles).sort();
  }, [allData]);

  const handleDownloadCsv = () => {
    if (!dateFilter) {
      alert("Please select a date to download CSV.");
      return;
    }
    window.open(`/api/download-csv?date=${dateFilter}`, '_blank');
  };

  const LoadingSkeletonRows = () => (
    <>
      {[...Array(5)].map((_, i) => (
        <TableRow key={`skel-${i}`}>
          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
        </TableRow>
      ))}
    </>
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Database className="h-7 w-7 text-primary" /> Performance Data Log
        </h1>
        <Button onClick={handleDownloadCsv} disabled={!dateFilter || isLoading || allData.length === 0} className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" /> Download CSV for {dateFilter || 'selected date'}
        </Button>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-muted-foreground" /> Data Filters
          </CardTitle>
          <CardDescription>Select a date to load records, then apply additional filters.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label htmlFor="date-filter" className="block text-sm font-medium text-muted-foreground mb-1">Record Date</label>
            <Input
              id="date-filter"
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-background"
            />
          </div>
          <div>
            <label htmlFor="city-filter" className="block text-sm font-medium text-muted-foreground mb-1">Filter by City</label>
            <Select value={cityFilter} onValueChange={setCityFilter} disabled={isLoading || allData.length === 0}>
              <SelectTrigger id="city-filter" className="bg-background">
                <SelectValue placeholder="All Cities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Cities</SelectItem>
                {uniqueCities.map(city => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label htmlFor="rag-filter" className="block text-sm font-medium text-muted-foreground mb-1">Filter by RAG Profile</label>
            <Select value={ragFilter} onValueChange={setRagFilter} disabled={isLoading || allData.length === 0}>
              <SelectTrigger id="rag-filter" className="bg-background">
                <SelectValue placeholder="All RAG Profiles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All RAG Profiles</SelectItem>
                 {uniqueRagProfiles.map(profile => (
                  <SelectItem key={profile} value={profile}>{profile}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Data</AlertTitle>
          <AlertDescription>{error}. Please try adjusting filters or refresh.</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Data Records</CardTitle>
           <CardDescription>
            Displaying {filteredData.length} of {allData.length} records for {dateFilter || 'N/A'}.
            {cityFilter ? ` City: ${cityFilter}.` : ''}
            {ragFilter ? ` RAG: ${ragFilter}.` : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>CRN ID</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>TL Name</TableHead>
                  <TableHead>SPM Name</TableHead>
                  <TableHead className="text-right">Avg. CSAT</TableHead>
                  <TableHead className="text-right">Delay Days</TableHead>
                  <TableHead>RAG Profile</TableHead>
                  <TableHead>Record Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <LoadingSkeletonRows />
                ) : filteredData.length > 0 ? (
                  filteredData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.crn_id}</TableCell>
                      <TableCell>{item.city}</TableCell>
                      <TableCell>{item.tl_name}</TableCell>
                      <TableCell>{item.spm_name}</TableCell>
                      <TableCell className="text-right">{item.avg_bnb_csat.toFixed(2)}</TableCell>
                      <TableCell className="text-right">{item.total_delay_days}</TableCell>
                      <TableCell>{item.rag_profile}</TableCell>
                      <TableCell>{item.record_date}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-10">
                      {dateFilter ? 'No data found for the selected date and filters.' : 'Please select a date to view data.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceDataPage;