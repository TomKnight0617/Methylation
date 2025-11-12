
import React, { useState, useMemo } from 'react';
import { AnalysisResult, MethylationCounts } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ResultsDisplayProps {
    results: AnalysisResult;
}

type TabKey = 'group1' | 'pSamples' | 'yjSamples';

const TAB_CONFIG: { [key in TabKey]: string } = {
    group1: 'Core Samples (ddm1, NIP, etc.)',
    pSamples: 'P-Series Samples',
    yjSamples: 'YJ-Series Samples'
};

const formatDataForChart = (data: MethylationCounts) => {
    return Object.entries(data)
        .map(([percentage, count]) => ({
            percentage: `${percentage}%`,
            count
        }))
        .sort((a, b) => parseInt(a.percentage) - parseInt(b.percentage));
};

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results }) => {
    const [activeTab, setActiveTab] = useState<TabKey>('group1');
    
    const chartData = useMemo(() => ({
        group1: formatDataForChart(results.group1),
        pSamples: formatDataForChart(results.pSamples),
        yjSamples: formatDataForChart(results.yjSamples),
    }), [results]);

    const currentData = chartData[activeTab];

    return (
        <div>
            <div className="border-b border-gray-700 mb-6">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    {(Object.keys(TAB_CONFIG) as TabKey[]).map((key) => (
                        <button
                            key={key}
                            onClick={() => setActiveTab(key)}
                            className={`${
                                activeTab === key
                                    ? 'border-blue-400 text-blue-400'
                                    : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                        >
                            {TAB_CONFIG[key]}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="min-h-[400px]">
                    <h3 className="text-lg font-semibold mb-4 text-gray-200">Methylation Level Distribution</h3>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={currentData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                            <XAxis dataKey="percentage" stroke="#A0AEC0" />
                            <YAxis stroke="#A0AEC0" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1A202C', border: '1px solid #4A5568' }}
                                labelStyle={{ color: '#E2E8F0' }}
                            />
                            <Legend wrapperStyle={{color: '#E2E8F0'}}/>
                            <Bar dataKey="count" fill="#4299E1" name="Number of Sites" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="min-h-[400px]">
                     <h3 className="text-lg font-semibold mb-4 text-gray-200">Raw Data Counts</h3>
                     <div className="max-h-[400px] overflow-y-auto bg-gray-900/50 p-3 rounded-md border border-gray-700">
                        <table className="w-full text-sm text-left text-gray-400">
                            <thead className="text-xs text-gray-300 uppercase bg-gray-700 sticky top-0">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Methylation Level (%)</th>
                                    <th scope="col" className="px-6 py-3">Count</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentData.map(({ percentage, count }) => (
                                    <tr key={percentage} className="border-b border-gray-700 hover:bg-gray-700/50">
                                        <td className="px-6 py-2 font-medium text-gray-200">{parseInt(percentage)}</td>
                                        <td className="px-6 py-2">{count.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResultsDisplay;
