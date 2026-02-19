import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { DailyLog, AmalTarget } from '../types';
import { AMAL_TARGETS } from '../constants';

interface DashboardProps {
  logs: DailyLog[];
  currentDate: string;
  customTargets: Record<string, number>;
}

export const Dashboard: React.FC<DashboardProps> = ({ logs, currentDate, customTargets }) => {
  const currentLog = logs.find(l => l.date === currentDate);
  
  const calculateProgress = (log: DailyLog | undefined) => {
    if (!log) return 0;
    let completed = 0;
    AMAL_TARGETS.forEach(target => {
      const val = log.values[target.id] || 0;
      const targetValue = customTargets[target.id] ?? target.targetValue;
      if (val >= targetValue) completed++;
    });
    return Math.round((completed / AMAL_TARGETS.length) * 100);
  };

  const progress = calculateProgress(currentLog);
  
  const data = [
    { name: 'Completed', value: progress },
    { name: 'Remaining', value: 100 - progress },
  ];

  const COLORS = ['#5a5a40', '#f0f0f0'];

  // Last 7 days progress
  const last7Days = logs.slice(-7).map(log => ({
    day: new Date(log.date).getDate(),
    progress: calculateProgress(log)
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <div className="glass-card p-6 flex flex-col items-center justify-center">
        <h3 className="text-sm uppercase tracking-widest text-ramadan-gold font-bold mb-4">Progres Hari Ini</h3>
        <div className="relative w-48 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-serif font-bold">{progress}%</span>
            <span className="text-[10px] uppercase text-ramadan-ink/40">Tercapai</span>
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="text-sm uppercase tracking-widest text-ramadan-gold font-bold mb-4">Tren 7 Hari Terakhir</h3>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={last7Days}>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                cursor={{fill: 'rgba(90, 90, 64, 0.05)'}}
              />
              <Bar dataKey="progress" fill="#c5a059" radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
