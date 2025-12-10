import { useState, useEffect } from 'react';
import { Trophy, Medal, TrendingUp, Calendar } from 'lucide-react';
import { supabase, User } from '../lib/supabase';

type Period = 'weekly' | 'monthly' | 'all-time';

export function Leaderboard() {
  const [period, setPeriod] = useState<Period>('all-time');
  const [leaders, setLeaders] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaders();
  }, [period]);

  const fetchLeaders = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('users')
        .select('*')
        .order('total_points', { ascending: false })
        .limit(10);

      if (period === 'weekly') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        query = query.gte('created_at', weekAgo.toISOString());
      } else if (period === 'monthly') {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        query = query.gte('created_at', monthAgo.toISOString());
      }

      const { data, error } = await query;

      if (!error && data) {
        setLeaders(data);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMedalIcon = (index: number) => {
    if (index === 0) return <Trophy className="text-yellow-500" size={24} />;
    if (index === 1) return <Medal className="text-gray-400" size={24} />;
    if (index === 2) return <Medal className="text-amber-700" size={24} />;
    return <span className="text-gray-400 font-bold">{index + 1}</span>;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="text-white" size={32} />
          <h2 className="text-2xl font-bold text-white">Leaderboard</h2>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setPeriod('weekly')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              period === 'weekly'
                ? 'bg-white text-emerald-600'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            <Calendar size={16} className="inline mr-1" />
            Weekly
          </button>
          <button
            onClick={() => setPeriod('monthly')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              period === 'monthly'
                ? 'bg-white text-emerald-600'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            <Calendar size={16} className="inline mr-1" />
            Monthly
          </button>
          <button
            onClick={() => setPeriod('all-time')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              period === 'all-time'
                ? 'bg-white text-emerald-600'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : leaders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No data available for this period
          </div>
        ) : (
          <div className="space-y-3">
            {leaders.map((user, index) => (
              <div
                key={user.id}
                className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
                  index < 3
                    ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="w-10 flex items-center justify-center">
                  {getMedalIcon(index)}
                </div>

                <div className="flex-1 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold">
                    {user.wallet_address.slice(2, 4).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {user.username || `${user.wallet_address.slice(0, 6)}...${user.wallet_address.slice(-4)}`}
                    </p>
                    <p className="text-sm text-gray-500">
                      {user.wallet_address.slice(0, 10)}...{user.wallet_address.slice(-8)}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold text-emerald-600">
                    {user.total_points}
                  </p>
                  <p className="text-xs text-gray-500">points</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
