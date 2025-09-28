import React from 'react';
import type { FlatData, DistributionDay } from '../types';

interface FlatCardProps {
  flat: FlatData;
  onUpdateCount: (flatRowIndex: number, day: DistributionDay, newCount: number) => void;
  isUpdating: boolean;
  activeDay: DistributionDay;
}

const PlateCounter: React.FC<{
  day: DistributionDay;
  subscribed: number;
  served: number;
  isUpdating: boolean;
  onUpdate: (newCount: number) => void;
}> = ({ day, subscribed, served, isUpdating, onUpdate }) => {
  const canIncrement = served < subscribed;
  const canDecrement = served > 0;

  const buttonBaseClasses = "h-10 w-10 flex items-center justify-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-75";
  const incrementButtonClasses = `${buttonBaseClasses} ${canIncrement && !isUpdating ? 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500' : 'bg-slate-600 text-slate-400 cursor-not-allowed'}`;
  const decrementButtonClasses = `${buttonBaseClasses} ${canDecrement && !isUpdating ? 'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500' : 'bg-slate-600 text-slate-400 cursor-not-allowed'}`;

  return (
    <div className={`flex flex-col items-center space-y-2 py-2 ${isUpdating ? 'opacity-50 cursor-wait' : ''}`}>
      <p className="text-sm font-medium text-slate-400">Progress</p>
      <div className="flex items-center space-x-3">
        <button
          onClick={() => onUpdate(served - 1)}
          disabled={!canDecrement || isUpdating}
          className={decrementButtonClasses}
          aria-label={`Decrease served count`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
        <p className="text-2xl font-bold w-16 text-center tabular-nums">{served} <span className="text-slate-500">/</span> {subscribed}</p>
        <button
          onClick={() => onUpdate(served + 1)}
          disabled={!canIncrement || isUpdating}
          className={incrementButtonClasses}
          aria-label={`Increase served count`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </div>
  );
};


export const FlatCard: React.FC<FlatCardProps> = ({ flat, onUpdateCount, isUpdating, activeDay }) => {
  // Coalesce undefined/null values to 0 for safety. This prevents UI glitches.
  const subscribedPlates = (activeDay === 'day1' ? flat.subscribed_plates_day1 : flat.subscribed_plates_day2) || 0;
  const servedPlates = (activeDay === 'day1' ? flat.served_plates_day1 : flat.served_plates_day2) || 0;
  
  // A flat is only relevant for a day if they subscribed to plates for that day.
  if (subscribedPlates === 0) {
      return null;
  }
  
  // Check for essential data. If it's missing, render an error card.
  // This helps debug issues with Google Sheet headers.
  if (!flat.flat_number) {
    return (
      <div className="bg-red-900/50 rounded-lg shadow-md p-4 border border-red-700 flex flex-col justify-center items-center text-center">
        <h3 className="text-lg font-bold text-red-300">Data Error</h3>
        <p className="text-sm text-red-400 mt-1">
          Missing 'flat_number'. Please check your Google Sheet column headers match the required format exactly (e.g., 'flat_number', not 'Flat Number').
        </p>
        <p className="text-xs text-slate-500 mt-2">Sheet Row: {flat.row_index}</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg shadow-md p-4 border border-slate-700 flex flex-col justify-between">
      <div>
        <div className="text-center mb-2">
            <h3 className="text-2xl font-bold text-amber-400">{flat.flat_number}</h3>
            {flat.name && <p className="text-sm text-slate-300 mt-1">{flat.name}</p>}
        </div>

        {(flat.phone_number || flat.amount_paid !== undefined) && (
            <div className="text-xs text-slate-400 mb-4 space-y-1 text-center border-y border-slate-700 py-2">
                {flat.phone_number && <p>Phone: {flat.phone_number}</p>}
                {flat.amount_paid !== undefined && <p>Amount Paid: ₹{flat.amount_paid}</p>}
            </div>
        )}
      </div>

      <div className="space-y-4">
          <PlateCounter 
              day={activeDay}
              subscribed={subscribedPlates}
              served={servedPlates}
              isUpdating={isUpdating}
              onUpdate={(newCount) => onUpdateCount(flat.row_index, activeDay, newCount)}
          />
      </div>
    </div>
  );
};