import { APPS_SCRIPT_URL } from '../constants';
import type { FlatData, DistributionDay, NewFlatData } from '../types';

export const fetchFlatsData = async (day: DistributionDay): Promise<FlatData[]> => {
  const sheetName = day === 'day1' ? 'Day 1' : 'Day 2';
  // The script now expects a `sheetName` query parameter to know which tab to read.
  const url = `${APPS_SCRIPT_URL}?sheetName=${encodeURIComponent(sheetName)}`;

  if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.includes('YOUR_GOOGLE_APPS_SCRIPT_URL_HERE')) {
      console.warn(`URL is not configured. Skipping fetch.`);
      return []; 
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Network response was not ok for ${day}: ${response.statusText}`);
    }
    const data = await response.json();
    
    // Check for a custom error message from the Apps Script
    if (data && data.error) {
      throw new Error(data.error);
    }
    
    if (!Array.isArray(data)) {
        throw new Error(`Received unexpected data format for ${day}. Please check the Apps Script and sheet headers.`);
    }

    return data;
  } catch (error) {
    console.error(`Failed to fetch data for ${day} from Google Sheet:`, error);
    throw error;
  }
};

export const addFlat = async (flatData: NewFlatData): Promise<void> => {
    const url = APPS_SCRIPT_URL;
    if (!url || url.includes('YOUR_GOOGLE_APPS_SCRIPT_URL_HERE')) {
        throw new Error(`URL is not configured. Cannot add flat.`);
    }

    try {
        const response = await fetch(url, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify({
                action: 'addFlatToBothDays',
                data: flatData,
            }),
        });

        if (!response.ok) {
            let errorMessage = response.statusText;
            try {
                const errorData = await response.json();
                if (errorData && errorData.message) {
                    errorMessage = errorData.message;
                }
            } catch (e) {
                const textResponse = await response.text();
                if (textResponse) {
                    errorMessage = textResponse;
                }
            }
            throw new Error(`Failed to add flat: ${errorMessage}`);
        }
    } catch (error) {
        console.error(`Failed to add flat to Google Sheets:`, error);
        throw error;
    }
}

export const updateServedCount = async (rowIndex: number, day: DistributionDay, newCount: number): Promise<void> => {
  const url = APPS_SCRIPT_URL; // Use the single URL for updates
  if (!url || url.includes('YOUR_GOOGLE_APPS_SCRIPT_URL_HERE')) {
      throw new Error(`URL is not configured. Cannot update sheet.`);
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({ action: 'updateCount', rowIndex, day, newCount }),
    });

    if (!response.ok) {
        let errorMessage = response.statusText;
        try {
            const errorData = await response.json();
            if (errorData && errorData.message) {
                errorMessage = errorData.message;
            }
        } catch (e) {
            const textResponse = await response.text();
            if (textResponse) {
                errorMessage = textResponse;
            }
        }
        throw new Error(`Failed to update ${day} sheet: ${errorMessage}`);
    }
  } catch (error) {
    console.error(`Failed to update ${day} Google Sheet:`, error);
    throw error;
  }
};