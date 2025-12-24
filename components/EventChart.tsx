
import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend
} from 'recharts';
import { CSVRow, AnalysisResult } from '../types';

interface EventChartProps {
  data?: CSVRow[];
  multiData?: AnalysisResult[];
  fileName?: string;
  isCombined?: boolean;
}

const COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', 
  '#ec4899', '#06b6d4', '#475569', '#14b8a6', '#f97316'
];

const EventChart: React.FC<EventChartProps> = ({ data, multiData, fileName, isCombined }) => {
  if (isCombined && multiData) {
    // 合併數據處理：為了在同一張圖表顯示，我們使用 index 作為 X 軸或嘗試對齊 timetick
    // 這裡我們以 timetick 為鍵，整合所有檔案的數值
    const combinedMap: Map<string, any> = new Map();
    
    multiData.forEach((res, fileIdx) => {
      res.detectedEvents.forEach((event) => {
        const time = event.timetick;
        if (!combinedMap.has(time)) {
          combinedMap.set(time, { name: time });
        }
        const entry = combinedMap.get(time);
        entry[`file_${fileIdx}`] = parseFloat(event.Move_RegenerativeLoadRatio) || 0;
      });
    });

    const chartData = Array.from(combinedMap.values()).sort((a, b) => a.name.localeCompare(b.name));

    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-[500px]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-slate-800">Combined Regenerative Load Ratio (All Files)</h3>
        </div>
        <ResponsiveContainer width="100%" height="90%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="name" tick={{fontSize: 9}} stroke="#94a3b8" />
            <YAxis tick={{fontSize: 10}} stroke="#94a3b8" label={{ value: 'Ratio', angle: -90, position: 'insideLeft', fontSize: 10 }} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '11px' }}
            />
            <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
            {multiData.map((res, idx) => (
              <Line 
                key={idx}
                type="stepAfter" 
                dataKey={`file_${idx}`} 
                name={res.fileName}
                stroke={COLORS[idx % COLORS.length]} 
                strokeWidth={2}
                dot={false}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // 單檔案視圖
  const chartData = data?.map((row, index) => ({
    name: row.timetick || `Point ${index}`,
    ratio: parseFloat(row.Move_RegenerativeLoadRatio) || 0,
    velocity: parseFloat(row.Move_Vel) || 0,
  })) || [];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-[400px]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-slate-800 truncate pr-4">Analysis: {fileName}</h3>
        <div className="flex gap-4 text-[10px] font-bold uppercase tracking-wider">
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-blue-500 rounded-sm"></div> Ratio</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-emerald-500 rounded-sm"></div> Velocity</div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="name" tick={{fontSize: 10}} stroke="#94a3b8" minTickGap={30} />
          <YAxis yAxisId="left" tick={{fontSize: 10}} stroke="#94a3b8" />
          <YAxis yAxisId="right" orientation="right" tick={{fontSize: 10}} stroke="#94a3b8" />
          <Tooltip 
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
            itemStyle={{ fontSize: '12px' }}
          />
          <Line 
            yAxisId="left"
            type="stepAfter" 
            dataKey="ratio" 
            stroke="#3b82f6" 
            strokeWidth={2.5}
            dot={{ r: 3, fill: '#3b82f6' }}
            name="Load Ratio"
          />
          <Line 
            yAxisId="right"
            type="monotone" 
            dataKey="velocity" 
            stroke="#10b981" 
            strokeWidth={1.5} 
            dot={false}
            strokeDasharray="5 5"
            name="Velocity"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EventChart;
