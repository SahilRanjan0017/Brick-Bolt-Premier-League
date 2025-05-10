# Google Apps Script Integration for Supabase

This document outlines the conceptual steps to integrate Google Sheets with Supabase using Google Apps Script to daily fetch data and store it in the `performance_data` table.

## Prerequisites

1.  **Google Sheet**: A Google Sheet containing the performance data with columns matching (or mappable to) `crn_id`, `city`, `tl_name`, `spm_name`, `avg_bnb_csat`, `total_delay_days`, `rag_profile`.
2.  **Supabase Project**:
    *   A Supabase project with the `performance_data` table created as per the schema. The table should ideally have a unique constraint on `(crn_id, record_date)` for upsert operations.
    *   A **Service Role Key** from your Supabase project settings (API section). **Warning: Keep this key secure and never expose it in client-side code.**
3.  **Google Apps Script Editor**: Access to the script editor for your Google Sheet (Extensions > Apps Script).

## Google Apps Script - `Code.gs` (Example Structure)

```javascript
// WARNING: This is a conceptual example. You'll need to adapt it to your specific Sheet structure and error handling needs.

const SUPABASE_URL = 'YOUR_SUPABASE_PROJECT_URL'; // Replace with your Supabase project URL (e.g., https://xyz.supabase.co)
const SUPABASE_SERVICE_KEY = 'YOUR_SUPABASE_SERVICE_ROLE_KEY'; // Replace with your Service Role Key

function getSheetData() {
  const sheetName = 'Sheet1'; // CHANGE THIS to your actual sheet name
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) {
    Logger.log('Sheet not found: ' + sheetName);
    return [];
  }
  
  // Assuming headers are in row 1 and data starts from row 2
  const headerRow = 1;
  const firstDataRow = 2;
  const numColumns = sheet.getLastColumn(); // Get the actual number of columns with data
  const numDataRows = sheet.getLastRow() - headerRow;

  if (numDataRows <= 0) {
    Logger.log('No data rows found in sheet: ' + sheetName);
    return [];
  }
  
  const dataRange = sheet.getRange(firstDataRow, 1, numDataRows, numColumns);
  const values = dataRange.getValues();
  const headers = sheet.getRange(headerRow, 1, 1, numColumns).getValues()[0];

  const headerMap = {};
  headers.forEach((header, index) => {
    headerMap[header.toLowerCase().trim().replace(/\s+/g, '_')] = index;
  });

  const formattedData = values.map((row, rowIndex) => {
    let entry = {};
    entry.crn_id = row[headerMap['crn_id']] ? String(row[headerMap['crn_id']]) : null;
    entry.city = row[headerMap['city']] ? String(row[headerMap['city']]) : null;
    entry.tl_name = row[headerMap['tl_name']] ? String(row[headerMap['tl_name']]) : null;
    entry.spm_name = row[headerMap['spm_name']] ? String(row[headerMap['spm_name']]) : null;
    entry.avg_bnb_csat = row[headerMap['avg_bnb_csat']] !== '' ? parseFloat(row[headerMap['avg_bnb_csat']]) : null;
    entry.total_delay_days = row[headerMap['total_delay_days']] !== '' ? parseInt(row[headerMap['total_delay_days']], 10) : null;
    entry.rag_profile = row[headerMap['rag_profile']] ? String(row[headerMap['rag_profile']]) : null;

    // Validate essential fields, like crn_id
    if (!entry.crn_id) {
      Logger.log('Skipping row ' + (rowIndex + firstDataRow) + ' due to missing crn_id: ' + JSON.stringify(row));
      return null; 
    }
    if (isNaN(entry.avg_bnb_csat)) entry.avg_bnb_csat = null; // Handle potential NaN from parseFloat
    if (isNaN(entry.total_delay_days)) entry.total_delay_days = null; // Handle potential NaN from parseInt
    
    return entry;
  }).filter(entry => entry !== null); // Remove rows that were skipped

  return formattedData;
}

function upsertDataToSupabase() {
  const performanceEntries = getSheetData();
  if (performanceEntries.length === 0) {
    Logger.log('No valid data fetched from sheet.');
    return;
  }

  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  const recordsToUpsert = performanceEntries.map(entry => ({
    ...entry,
    record_date: today,
  }));

  // Supabase API endpoint for upserting into `performance_data`
  // The `on_conflict` parameter handles the upsert logic.
  // Ensure 'crn_id, record_date' is a unique constraint in your Supabase table.
  const url = `${SUPABASE_URL}/rest/v1/performance_data?on_conflict=crn_id,record_date`;

  const options = {
    method: 'post', // Supabase upsert via POST with Prefer header
    contentType: 'application/json',
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates,missing=default' // Upsert and use default for missing columns
    },
    payload: JSON.stringify(recordsToUpsert),
    muteHttpExceptions: true // To handle errors manually
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    const responseBody = response.getContentText();

    if (responseCode >= 200 && responseCode < 300) {
      Logger.log(`Data upserted successfully to Supabase for date ${today}. Records processed: ${recordsToUpsert.length}`);
      Logger.log('Response: ' + responseBody);
    } else {
      Logger.log(`Error upserting data: ${responseCode}`);
      Logger.log(`Response Body: ${responseBody}`);
      // Consider sending an email notification for critical errors
    }
  } catch (e) {
    Logger.log(`Exception during Supabase API call: ${e.toString()}`);
    Logger.log(`Stack: ${e.stack}`);
  }
}

// Function to set up a daily trigger
function createDailyTrigger() {
  // Delete existing triggers for this function to avoid duplicates
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(function(trigger) {
    if (trigger.getHandlerFunction() === 'upsertDataToSupabase') {
      ScriptApp.deleteTrigger(trigger);
      Logger.log('Deleted existing trigger for upsertDataToSupabase.');
    }
  });

  // Create a new trigger
  ScriptApp.newTrigger('upsertDataToSupabase')
    .timeBased()
    .everyDays(1)
    .atHour(1) // Set to run at 1 AM in the script's timezone (check project settings)
    .create();
  Logger.log('Daily trigger created for upsertDataToSupabase to run around 1 AM.');
}

// Function to remove triggers (for cleanup if needed)
function deleteAllTriggers() {
  const triggers = ScriptApp.getProjectTriggers();
  for (let i = 0; i < triggers.length; i++) {
    ScriptApp.deleteTrigger(triggers[i]);
  }
  Logger.log('All triggers deleted.');
}
```

## Setup Steps

1.  **Open Google Sheet**: Go to the Google Sheet that contains your performance data.
2.  **Prepare Sheet**:
    *   Ensure the first row contains headers that match (or can be mapped to) `crn_id`, `city`, `tl_name`, `spm_name`, `avg_bnb_csat`, `total_delay_days`, `rag_profile`.
    *   Data should start from the second row.
3.  **Open Apps Script**: Click on "Extensions" > "Apps Script".
4.  **Paste Code**: Replace the content of `Code.gs` with the script above.
5.  **Configure Constants**:
    *   Update `SUPABASE_URL` with your actual Supabase project URL (e.g., `https://yourprojectid.supabase.co`).
    *   Update `SUPABASE_SERVICE_KEY` with your Supabase **service role key**.
    *   Update `sheetName` in `getSheetData()` function to your sheet's actual name if it's not 'Sheet1'.
6.  **Save Script**: Click the save icon.
7.  **Authorize Script**:
    *   Run the `upsertDataToSupabase` function once manually from the Apps Script editor (Select function > Run).
    *   Google will prompt you for authorization. Review permissions (it will ask to connect to external services and manage your spreadsheets) and allow the script.
8.  **Set Up Daily Trigger**:
    *   Run the `createDailyTrigger` function once from the Apps Script editor. This will schedule `upsertDataToSupabase` to run daily.
    *   You can check existing triggers under "Triggers" (clock icon on the left sidebar) in the Apps Script editor. Ensure the timezone for the trigger is set correctly in your Apps Script project settings if needed.

## Supabase Table Setup

Ensure your `performance_data` table in Supabase has a unique constraint on `(crn_id, record_date)` for the upsert logic (`Prefer: resolution=merge-duplicates`) to work correctly.

Example SQL for adding a unique constraint if you haven't already:
```sql
ALTER TABLE performance_data
ADD CONSTRAINT performance_data_crn_id_record_date_key UNIQUE (crn_id, record_date);
```
Also ensure the `record_date` column is of type `date`.

## Security

*   The `SUPABASE_SERVICE_KEY` used in the Apps Script has full admin rights to your Supabase project. **Keep it secure and never expose it in client-side code.**
*   For the frontend website, configure Row Level Security (RLS) on the `performance_data` table.

    ```sql
    -- 1. Enable RLS on the table (if not already enabled)
    ALTER TABLE public.performance_data ENABLE ROW LEVEL SECURITY;

    -- 2. Create a policy to allow public read access
    CREATE POLICY "Allow public read access on performance_data"
    ON public.performance_data
    FOR SELECT
    USING (true);
    
    -- Note: For writes, the Google Apps Script will use the service_role key, 
    -- which bypasses RLS. No specific RLS policy for writes is needed for the script.
    ```

## Testing & Debugging

*   Manually run `upsertDataToSupabase` from the Apps Script editor to test the data transfer.
*   Check the Logger in Apps Script (`View > Logs` or `Execution log` in the new editor) for messages and errors.
*   Verify data appears correctly in your Supabase `performance_data` table.
*   Test the frontend website to ensure it can fetch, filter, and display the data.
*   Test the CSV download feature for various dates.
```

