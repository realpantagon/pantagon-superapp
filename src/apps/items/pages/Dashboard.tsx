import { useEffect, useState } from 'react';
import { supabase } from '../../../shared/utils/supabase';
import type { DashboardStats, GroupBurnRate } from '../../../api/items/types';
import { calculateDailyBurnRate, formatCurrency } from '../../../api/items/calculations';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [groupData, setGroupData] = useState<GroupBurnRate[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data: items, error } = await supabase
        .from('pantagon_items')
        .select('*')
        .order('buy_date', { ascending: false });

      if (error) throw error;

      if (items) {
        // Calculate stats
        const totalItems = items.length;
        const ownedItems = items.filter(item => item.status === 'owned').length;
        const soldItems = items.filter(item => item.status === 'sold').length;
        const dailyBurnRate = calculateDailyBurnRate(items);

        setStats({
          total_items: totalItems,
          owned_items: ownedItems,
          sold_items: soldItems,
          daily_burn_rate: dailyBurnRate,
        });

        // Calculate group burn rates
        const groupMap = new Map<string, { totalBurn: number; count: number }>();
        items.forEach(item => {
          const group = item.group_name || 'No Group';
          const daysHeld = item.sell_date 
            ? Math.max(1, Math.floor((new Date(item.sell_date).getTime() - new Date(item.buy_date).getTime()) / (1000 * 60 * 60 * 24)))
            : Math.max(1, Math.floor((Date.now() - new Date(item.buy_date).getTime()) / (1000 * 60 * 60 * 24)));
          const realCost = item.buy_price + item.extra_cost;
          const burnRate = realCost / daysHeld;

          if (!groupMap.has(group)) {
            groupMap.set(group, { totalBurn: 0, count: 0 });
          }
          const current = groupMap.get(group)!;
          current.totalBurn += burnRate;
          current.count += 1;
        });

        const groupBurnRates: GroupBurnRate[] = Array.from(groupMap.entries()).map(([group, data]) => ({
          group_name: group,
          avg_burn_rate: data.totalBurn / data.count,
          item_count: data.count,
        }));
        setGroupData(groupBurnRates);

        // Calculate category distribution
        const categoryMap = new Map<string, number>();
        items.forEach(item => {
          const category = item.category || 'Uncategorized';
          categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
        });

        const categoryDist = Array.from(categoryMap.entries()).map(([category, count]) => ({
          name: category,
          value: count,
        }));
        setCategoryData(categoryDist);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-4">
      {/* <h1 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">Dashboard</h1> */}

      {/* Stats Grid - Compact */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-gray-800/40 rounded-xl p-3 border border-gray-700/50">
          <div className="text-xs text-gray-400 mb-1">Total Items</div>
          <div className="text-lg font-bold text-white">
            {stats?.total_items || 0}
          </div>
        </div>

        <div className="bg-gray-800/40 rounded-xl p-3 border border-gray-700/50">
          <div className="text-xs text-gray-400 mb-1">Items Owned</div>
          <div className="text-lg font-bold text-green-400">
            {stats?.owned_items || 0}
          </div>
        </div>

        <div className="bg-gray-800/40 rounded-xl p-3 border border-gray-700/50">
          <div className="text-xs text-gray-400 mb-1">Items Sold</div>
          <div className="text-lg font-bold text-blue-400">
            {stats?.sold_items || 0}
          </div>
        </div>

        <div className="bg-gray-800/40 rounded-xl p-3 border border-gray-700/50">
          <div className="text-xs text-gray-400 mb-1">Daily Burn</div>
          <div className="text-lg font-bold text-red-400">
            {stats ? formatCurrency(stats.daily_burn_rate) : '฿0'}
          </div>
        </div>
      </div>

      {/* Bar Chart - Group Burn Rates */}
      <div className="bg-gray-800/40 rounded-xl p-4 border border-gray-700/50 mb-4">
        <h2 className="text-base font-semibold text-white mb-3">
          Burn Rate by Group
        </h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={groupData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="group_name" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
            <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
              labelStyle={{ color: '#F9FAFB' }}
            />
            <Bar dataKey="avg_burn_rate" fill="#3b82f6" name="Avg ฿/day" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Chart - Category Distribution */}
      <div className="bg-gray-800/40 rounded-xl p-4 border border-gray-700/50">
        <h2 className="text-base font-semibold text-white mb-3">
          Items by Category
        </h2>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {categoryData.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
