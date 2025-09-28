import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { FlatData, DistributionDay } from './types';
import { fetchFlatsData, updateServedCount } from './services/sheetService';
import { generateDistributionReport } from './services/geminiService';
import { FlatCard } from './components/FlatCard';
import { Summary } from './components/Summary';
import { ReportModal } from './components/ReportModal';

type AllFlatsState = {
    day1: FlatData[];
    day2: FlatData[];
}

const App: React.FC = () => {
    const [allFlats, setAllFlats] = useState<AllFlatsState>({ day1: [], day2: [] });
    const [activeDay, setActiveDay] = useState<DistributionDay>('day1');
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updatingFlats, setUpdatingFlats] = useState<Set<number>>(new Set());
    
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reportContent, setReportContent] = useState('');
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Fetch both sets of data concurrently
            const [dataDay1, dataDay2] = await Promise.all([
                fetchFlatsData('day1').catch(e => {
                    console.error("Day 1 data failed to load:", e.message);
                    return []; // Return empty array on failure to not block the UI
                }),
                fetchFlatsData('day2').catch(e => {
                    console.error("Day 2 data failed to load:", e.message);
                    return [];
                })
            ]);

            // Consolidate errors if any fetch failed
            const day1Error = dataDay1.length === 0 ? 'Day 1' : '';
            const day2Error = dataDay2.length === 0 ? 'Day 2' : '';
            const failedDays = [day1Error, day2Error].filter(Boolean).join(' and ');
            
            if (failedDays && (dataDay1.length + dataDay2.length === 0)) {
                 throw new Error(`No data loaded. Please check that your Google Sheet tabs are named 'Day 1' and 'Day 2' and that your script is deployed correctly.`);
            }

            setAllFlats({ day1: dataDay1, day2: dataDay2 });
        } catch (e: any) {
            setError(e.message || 'An unknown error occurred while fetching data.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const filteredFlats = useMemo(() => {
        const flatsForActiveDay = allFlats[activeDay];
        if (searchTerm === '') {
            return flatsForActiveDay;
        }
        const lowercasedFilter = searchTerm.toLowerCase();
        return flatsForActiveDay.filter(flat =>
            flat.flat_number.toLowerCase().includes(lowercasedFilter) ||
            flat.name?.toLowerCase().includes(lowercasedFilter)
        );
    }, [searchTerm, allFlats, activeDay]);
    
    const summary = useMemo(() => {
        return allFlats[activeDay].reduce(
            (acc, flat) => {
                const subscribedKey = activeDay === 'day1' ? 'subscribed_plates_day1' : 'subscribed_plates_day2';
                const servedKey = activeDay === 'day1' ? 'served_plates_day1' : 'served_plates_day2';
                acc.totalSubscribed += flat[subscribedKey];
                acc.totalServed += flat[servedKey];
                return acc;
            },
            { totalSubscribed: 0, totalServed: 0 }
        );
    }, [allFlats, activeDay]);


    const handleUpdateCount = async (flatRowIndex: number, day: DistributionDay, newCount: number) => {
        const flatToUpdate = allFlats[day].find(f => f.row_index === flatRowIndex);
        if (!flatToUpdate) return;
        
        const servedKey = day === 'day1' ? 'served_plates_day1' : 'served_plates_day2';
        const subscribedKey = day === 'day1' ? 'subscribed_plates_day1' : 'subscribed_plates_day2';

        if (newCount < 0 || newCount > flatToUpdate[subscribedKey]) {
            return;
        }

        setUpdatingFlats(prev => new Set(prev).add(flatRowIndex));
        
        const originalFlats = allFlats;
        setAllFlats(prevAllFlats => ({
            ...prevAllFlats,
            [day]: prevAllFlats[day].map(flat => 
                flat.row_index === flatRowIndex ? { ...flat, [servedKey]: newCount } : flat
            )
        }));

        try {
            await updateServedCount(flatRowIndex, day, newCount);
        } catch (e: any) {
            setError(`Failed to update ${flatToUpdate.flat_number}. Reverting.`);
            setAllFlats(originalFlats);
        } finally {
            setUpdatingFlats(prev => {
                const newSet = new Set(prev);
                newSet.delete(flatRowIndex);
                return newSet;
            });
        }
    };
    
    const handleGenerateReport = async () => {
        setIsReportModalOpen(true);
        setIsGeneratingReport(true);
        
        const dayLabel = activeDay === 'day1' ? "Day 1" : "Day 2";
        let summaryString = `
            ${dayLabel} Progress: ${summary.totalServed} out of ${summary.totalSubscribed} plates served.
            Number of households participating on ${dayLabel}: ${allFlats[activeDay].length}.
        `;

        const report = await generateDistributionReport(summaryString);
        setReportContent(report);
        setIsGeneratingReport(false);
    };

    const TabButton: React.FC<{day: DistributionDay, label: string}> = ({ day, label }) => {
        const isActive = activeDay === day;
        const baseClasses = "py-2 px-6 rounded-t-lg font-semibold transition-colors duration-300 focus:outline-none";
        const activeClasses = "bg-slate-800 text-amber-400";
        const inactiveClasses = "bg-slate-900/50 hover:bg-slate-700 text-slate-400";
        return (
            <button onClick={() => setActiveDay(day)} className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}>
                {label}
            </button>
        )
    }

    return (
        <div className="min-h-screen p-4 font-sans">
            <div className="container mx-auto max-w-4xl">
                <header className="text-center my-6">
                    <h1 className="text-4xl font-bold text-amber-400 tracking-wider">Kali Puja Bhog Distribution</h1>
                    <p className="text-slate-400 mt-2">Search for a flat number to record a serving.</p>
                </header>

                <main>
                    <Summary {...summary} dayLabel={activeDay === 'day1' ? 'Day 1' : 'Day 2'} />

                    <div className="mt-6">
                        <div className="flex space-x-2 border-b-2 border-slate-700">
                           <TabButton day="day1" label="Day 1" />
                           <TabButton day="day2" label="Day 2" />
                        </div>
                    </div>

                    <div className="my-6 sticky top-28 z-10">
                         <div className="relative">
                            <input
                                type="text"
                                placeholder="Search by Flat or Name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full p-4 pl-12 text-lg bg-slate-800 border-2 border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                            />
                            <svg className="w-6 h-6 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                         </div>
                    </div>
                    
                    {error && (
                        <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg my-4 text-center">
                            <p><strong>Error:</strong> {error}</p>
                            <button onClick={loadData} className="mt-2 bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded">
                                Retry
                            </button>
                        </div>
                    )}

                    {isLoading ? (
                        <div className="text-center py-10">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-400 mx-auto"></div>
                            <p className="mt-4 text-slate-400">Loading all distribution data...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredFlats.length > 0 ? (
                                filteredFlats.map(flat => (
                                    <FlatCard 
                                        key={`${activeDay}-${flat.row_index}`} 
                                        flat={flat} 
                                        onUpdateCount={handleUpdateCount}
                                        isUpdating={updatingFlats.has(flat.row_index)}
                                        activeDay={activeDay}
                                    />
                                ))
                            ) : (
                                <p className="text-center col-span-full text-slate-500 py-8">
                                    {allFlats[activeDay].length === 0 ? `No data loaded for ${activeDay === 'day1' ? 'Day 1' : 'Day 2'}. Please check that your Google Sheet tabs are named 'Day 1' and 'Day 2' and that your script is deployed.` : 'No flats found matching your search.'}
                                </p>
                            )}
                        </div>
                    )}
                    
                    <div className="text-center mt-8">
                      <button 
                        onClick={handleGenerateReport}
                        disabled={allFlats[activeDay].length === 0}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
                      >
                        Generate AI Report for {activeDay === 'day1' ? 'Day 1' : 'Day 2'}
                      </button>
                    </div>
                </main>
            </div>
            <ReportModal 
              isOpen={isReportModalOpen}
              onClose={() => setIsReportModalOpen(false)}
              content={reportContent}
              isLoading={isGeneratingReport}
            />
        </div>
    );
};

export default App;
