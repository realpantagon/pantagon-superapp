import { useEffect, useState } from 'react';
import { fetchFCDEntries, addFCDEntry, calculateFCDStats, formatCurrency } from '../../../api/fcd';
import type { FCDEntry, FCDStats, NewFCDEntry } from '../../../api/fcd/types';
import { format, parseISO } from 'date-fns';
import Input from '../../../shared/components/Input';
import Button from '../../../shared/components/Button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function FCDDashboard() {
    const [entries, setEntries] = useState<FCDEntry[]>([]);
    const [stats, setStats] = useState<FCDStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [showQuickAdd, setShowQuickAdd] = useState(false);

    const [quickAddData, setQuickAddData] = useState<NewFCDEntry>({
        status: 'IN',
        date: format(new Date(), 'yyyy-MM-dd'),
        usd: 0,
        thb: 0,
        rate: 0,
        note: '',
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const data = await fetchFCDEntries();
            setEntries(data);
            const calculatedStats = calculateFCDStats(data);
            setStats(calculatedStats);
        } catch (error) {
            console.error('Error fetching FCD data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Calculate total interest
    const totalInterest = entries
        .filter(e => e.status === 'Interest')
        .reduce((sum, e) => sum + Number(e.usd) + (Number(e.thb) || 0), 0);

    // Prepare chart data - exclude initial deposit to make chart more readable
    const sortedEntries = entries
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Skip the first entry if it's a large initial deposit
    const chartEntries = sortedEntries.length > 1 ? sortedEntries.slice(1) : sortedEntries;
    
    const chartData = chartEntries
        .map(entry => ({
            date: format(parseISO(entry.date), 'MMM dd'),
            usd: Number(entry.usd),
            thb: Number(entry.thb || 0),
        }));

    const handleQuickAdd = async () => {
        if (quickAddData.usd === 0 && (quickAddData.thb || 0) === 0) {
            alert('Please enter USD or THB amount');
            return;
        }

        try {
            await addFCDEntry(quickAddData);
            setQuickAddData({
                status: 'IN',
                date: format(new Date(), 'yyyy-MM-dd'),
                usd: 0,
                thb: 0,
                rate: 0,
                note: '',
            });
            setShowQuickAdd(false);
            fetchData();
        } catch (error) {
            console.error('Error adding FCD entry:', error);
            alert('Failed to add entry');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-400">Loading...</div>
            </div>
        );
    }

    return (
        <div className="space-y-4 pt-4">
            {/* Chart */}
            <div className="bg-gradient-to-br from-yellow-900/20 to-green-900/20 rounded-xl p-4 border border-yellow-700/30">
                <h2 className="text-sm font-semibold text-yellow-400 mb-3">
                    Amount Over Time
                </h2>
                <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis
                            dataKey="date"
                            stroke="#9CA3AF"
                            tick={{ fontSize: 11 }}
                        />
                        <YAxis stroke="#9CA3AF" tick={{ fontSize: 11 }} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1F2937',
                                border: '1px solid #374151',
                                borderRadius: '8px'
                            }}
                            labelStyle={{ color: '#F9FAFB' }}
                        />
                        <Line
                            type="monotone"
                            dataKey="usd"
                            stroke="#22c55e"
                            strokeWidth={2}
                            name="USD"
                        />
                        <Line
                            type="monotone"
                            dataKey="thb"
                            stroke="#eab308"
                            strokeWidth={2}
                            name="THB"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 rounded-xl p-3 border border-green-700/40">
                    <div className="text-xs text-green-300 mb-1">Total USD</div>
                    <div className="text-lg font-bold text-green-400">
                        {formatCurrency(stats?.total_usd || 0, 'USD')}
                    </div>
                </div>

                <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/20 rounded-xl p-3 border border-yellow-700/40">
                    <div className="text-xs text-yellow-300 mb-1">Total THB</div>
                    <div className="text-lg font-bold text-yellow-400">
                        {formatCurrency(stats?.total_thb || 0, 'THB')}
                    </div>
                </div>

                <div className="bg-gradient-to-br from-lime-900/30 to-lime-800/20 rounded-xl p-3 border border-lime-700/40">
                    <div className="text-xs text-lime-300 mb-1">Avg Rate</div>
                    <div className="text-lg font-bold text-lime-400">
                        {stats?.weighted_avg_rate.toFixed(4) || '0.0000'}
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 rounded-xl p-3 border border-blue-700/40">
                    <div className="text-xs text-blue-300 mb-1">Sum Interest</div>
                    <div className="text-lg font-bold text-blue-400">
                        {formatCurrency(totalInterest, 'USD')}
                    </div>
                </div>
            </div>

            {/* Quick Add Form */}
            <div className="bg-gradient-to-br from-yellow-900/20 to-green-900/20 rounded-xl p-4 border border-yellow-700/30 mb-4">
                <button
                    onClick={() => setShowQuickAdd(!showQuickAdd)}
                    className="w-full flex items-center justify-between text-left"
                >
                    <h2 className="text-base font-semibold text-yellow-400">
                        Quick Add Entry
                    </h2>
                    <span className="text-2xl text-yellow-400">{showQuickAdd ? '−' : '+'}</span>
                </button>

                {showQuickAdd && (
                    <div className="mt-4 space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                            <Input
                                type="number"
                                step="0.01"
                                placeholder="USD Amount"
                                value={quickAddData.usd || ''}
                                onChange={(e) => setQuickAddData({ ...quickAddData, usd: parseFloat(e.target.value) || 0 })}
                                className="bg-gray-900/60 border-gray-700 text-white"
                            />
                            <Input
                                type="number"
                                step="0.01"
                                placeholder="THB Amount"
                                value={quickAddData.thb || ''}
                                onChange={(e) => setQuickAddData({ ...quickAddData, thb: parseFloat(e.target.value) || 0 })}
                                className="bg-gray-900/60 border-gray-700 text-white"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <Input
                                type="number"
                                step="0.0001"
                                placeholder="Rate (THB/USD)"
                                value={quickAddData.rate || ''}
                                onChange={(e) => setQuickAddData({ ...quickAddData, rate: parseFloat(e.target.value) || 0 })}
                                className="bg-gray-900/60 border-gray-700 text-white"
                            />
                            <Input
                                type="date"
                                value={quickAddData.date}
                                onChange={(e) => setQuickAddData({ ...quickAddData, date: e.target.value })}
                                className="bg-gray-900/60 border-gray-700 text-white"
                            />
                        </div>
                        <select
                            value={quickAddData.status}
                            onChange={(e) => setQuickAddData({ ...quickAddData, status: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-900/60 border border-gray-700/50 rounded-lg text-white text-sm"
                        >
                            <option value="IN">IN</option>
                            <option value="Interest">Interest</option>
                            <option value="Out">Out</option>
                        </select>
                        <Input
                            type="text"
                            placeholder="Note (optional)"
                            value={quickAddData.note || ''}
                            onChange={(e) => setQuickAddData({ ...quickAddData, note: e.target.value })}
                            className="bg-gray-900/60 border-gray-700 text-white"
                        />
                        <Button
                            onClick={handleQuickAdd}
                            className="
    w-full
    bg-yellow-600
    hover:bg-yellow-500
    text-black
    font-semibold
    rounded-xl
    py-3
    shadow-[0_0_8px_rgba(255,215,86,0.4)]
    hover:shadow-[0_0_12px_rgba(255,215,86,0.6)]
    transition-all
  "
                        >
                            Add Entry
                        </Button>

                    </div>
                )}
            </div>

            {/* Entries List */}
            <div className="space-y-3">
                <h2 className="text-xl font-bold text-yellow-400">All Entries</h2>

                <div className="space-y-2">
                    {[...entries]
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map(entry => (
                        <div
                            key={entry.id}
                            className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 border border-yellow-700/20 rounded-xl p-3"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${entry.status === 'IN'
                                                ? 'bg-green-900 text-green-200'
                                                : entry.status === 'Interest'
                                                    ? 'bg-blue-900 text-blue-200'
                                                    : 'bg-red-900 text-red-200'
                                            }`}>
                                            {entry.status}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            {format(new Date(entry.date), 'MMM dd, yyyy')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1 text-sm">
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <span className="text-gray-400">USD: </span>
                                        <span className="text-green-400 font-medium">
                                            {formatCurrency(entry.usd, 'USD')}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400">THB: </span>
                                        <span className="text-blue-400 font-medium">
                                            {formatCurrency(entry.thb || 0, 'THB')}
                                        </span>
                                    </div>
                                </div>
                                {entry.rate && (
                                    <div>
                                        <span className="text-gray-400">Rate: </span>
                                        <span className="text-yellow-400 font-medium">
                                            {entry.rate.toFixed(4)}
                                        </span>
                                    </div>
                                )}
                                {entry.note && (
                                    <div className="mt-2 text-xs text-gray-300 bg-gray-700/50 px-2 py-1 rounded">
                                        {entry.note}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {entries.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-400">No entries yet. Add your first FCD entry!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
