import React from 'react';

interface SummaryProps {
  totalSubscribed: number;
  totalServed: number;
  dayLabel: string;
}

const ProgressBar: React.FC<{ served: number; subscribed: number }> = ({ served, subscribed }) => {
  const percentage = subscribed > 0 ? (served / subscribed) * 100 : 0;
  return (
    <div className="w-full bg-slate-700 rounded-full h-2.5">
      <div
        className="bg-amber-500 h-2.5 rounded-full"
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
};

export const Summary: React.FC<SummaryProps> = ({ 
  totalSubscribed, 
  totalServed, 
  dayLabel,
}) => {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-slate-700 sticky top-4 z-10">
        <div className="grid grid-cols-1 gap-4 text-center">
            <div>
                <h3 className="text-sm font-medium text-slate-400">{dayLabel} Total Distribution</h3>
                <p className="text-2xl font-bold text-amber-400">{totalServed} / {totalSubscribed}</p>
                 <ProgressBar served={totalServed} subscribed={totalSubscribed} />
            </div>
        </div>
    </div>
  );
};
