import React, { useState } from 'react';
import type { DistributionDay, NewFlatData } from '../types';

interface AddFlatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NewFlatData) => Promise<void>;
  activeDay: DistributionDay;
}

export const AddFlatModal: React.FC<AddFlatModalProps> = ({ isOpen, onClose, onSubmit, activeDay }) => {
  const [flatNumber, setFlatNumber] = useState('');
  const [subscribedPlates, setSubscribedPlates] = useState(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleReset = () => {
    setFlatNumber('');
    setSubscribedPlates(1);
    setName('');
    setPhone('');
    setAmountPaid('');
    setError(null);
    setIsSubmitting(false);
  }

  const handleClose = () => {
    handleReset();
    onClose();
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flatNumber.trim() || subscribedPlates < 1) {
      setError('Flat Number and at least 1 Subscribed Plate are required.');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    
    const newFlatData: NewFlatData = {
      flat_number: flatNumber.trim().toUpperCase(),
      subscribed_plates: subscribedPlates,
      name: name.trim() || undefined,
      phone_number: phone.trim() || undefined,
      amount_paid: amountPaid ? parseFloat(amountPaid) : undefined,
    };
    
    try {
      await onSubmit(newFlatData);
      handleClose();
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full p-3 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-lg p-6 border border-slate-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-amber-400">Add New Flat for {activeDay === 'day1' ? 'Day 1' : 'Day 2'}</h2>
          <button onClick={handleClose} className="text-slate-400 hover:text-white" disabled={isSubmitting}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="flatNumber" className="block text-sm font-medium text-slate-300 mb-1">Flat Number <span className="text-red-400">*</span></label>
              <input type="text" id="flatNumber" value={flatNumber} onChange={e => setFlatNumber(e.target.value)} className={inputClass} required />
            </div>
            <div>
              <label htmlFor="subscribedPlates" className="block text-sm font-medium text-slate-300 mb-1">Subscribed Plates <span className="text-red-400">*</span></label>
              <input type="number" id="subscribedPlates" value={subscribedPlates} onChange={e => setSubscribedPlates(parseInt(e.target.value, 10) || 1)} min="1" className={inputClass} required />
            </div>
          </div>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1">Name (Optional)</label>
            <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className={inputClass} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-300 mb-1">Phone (Optional)</label>
              <input type="tel" id="phone" value={phone} onChange={e => setPhone(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label htmlFor="amountPaid" className="block text-sm font-medium text-slate-300 mb-1">Amount Paid (Optional)</label>
              <input type="number" id="amountPaid" value={amountPaid} onChange={e => setAmountPaid(e.target.value)} step="0.01" min="0" placeholder="e.g., 500" className={inputClass} />
            </div>
          </div>
          
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-2 rounded-lg text-sm">
              <p>{error}</p>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <button type="submit" disabled={isSubmitting} className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:bg-slate-600 disabled:cursor-wait">
              {isSubmitting ? 'Adding...' : 'Add Flat'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
