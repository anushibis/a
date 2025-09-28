import React from 'react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  isLoading: boolean;
}

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, content, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-lg p-6 border border-slate-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-amber-400">Distribution Report</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="mt-4 text-slate-300 max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400"></div>
              <p>Generating report with Gemini...</p>
            </div>
          ) : (
            <p className="whitespace-pre-wrap">{content}</p>
          )}
        </div>
      </div>
    </div>
  );
};