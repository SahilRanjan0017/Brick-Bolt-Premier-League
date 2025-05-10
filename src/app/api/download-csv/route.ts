// src/app/api/download-csv/route.ts
import { type NextRequest, NextResponse } from 'next/server';
import { supabase, getSupabaseInitializationError } from '@/lib/supabaseClient';
import type { PerformanceDataEntry } from '@/types';

function convertToCSV(data: PerformanceDataEntry[]): string {
  if (!data || data.length === 0) {
    return 'No data available for the selected date.';
  }
  // Define the order of headers
  const headers = [
    "crn_id", 
    "city", 
    "tl_name", 
    "spm_name", 
    "avg_bnb_csat", 
    "total_delay_days", 
    "rag_profile", 
    "record_date"
  ];
  
  const csvRows = [];
  csvRows.push(headers.join(',')); // Add header row

  for (const row of data) {
    const values = headers.map(header => {
      let value = (row as any)[header];
      // Handle null or undefined values as empty strings
      if (value === null || value === undefined) {
        value = '';
      }
      // Ensure string values with commas or quotes are properly quoted
      if (typeof value === 'string') {
        // Escape double quotes by doubling them
        value = value.replace(/"/g, '""');
        if (value.includes(',') || value.includes('\n') || value.includes('"')) {
          value = `"${value}"`;
        }
      }
      return value;
    });
    csvRows.push(values.join(','));
  }
  return csvRows.join('\n');
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date'); // Expects YYYY-MM-DD

  if (!date) {
    return NextResponse.json({ error: 'Date query parameter is required' }, { status: 400 });
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'Invalid date format. Use YYYY-MM-DD.' }, { status: 400 });
  }
  
  const initializationError = getSupabaseInitializationError();
  if (!supabase || initializationError) {
    return NextResponse.json({ error: `Supabase client not initialized. ${initializationError || 'Check server configuration.'}` }, { status: 500 });
  }

  try {
    const { data, error: queryError } = await supabase
      .from('performance_data')
      .select('crn_id, city, tl_name, spm_name, avg_bnb_csat, total_delay_days, rag_profile, record_date')
      .eq('record_date', date)
      .order('city')
      .order('tl_name');

    if (queryError) {
      console.error('Supabase error fetching data for CSV:', queryError);
      return NextResponse.json({ error: `Failed to fetch data: ${queryError.message}` }, { status: 500 });
    }

    const csvData = convertToCSV(data as PerformanceDataEntry[]);
    const filename = `performance_data_${date}.csv`;

    const responseHeaders = new Headers();
    responseHeaders.set('Content-Type', 'text/csv; charset=utf-8');
    responseHeaders.set('Content-Disposition', `attachment; filename="${filename}"`);

    return new NextResponse(csvData, { headers: responseHeaders });

  } catch (e) {
    console.error('Error generating CSV:', e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
    return NextResponse.json({ error: `Error generating CSV: ${errorMessage}` }, { status: 500 });
  }
}