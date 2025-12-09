import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SimplePriceChartProps {
  data: { time: number; price: number }[];
  color?: string;
}

export const SimplePriceChart: React.FC<SimplePriceChartProps> = ({ data, color = '#00ff9d' }) => {
  // Format time for X Axis
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full w-full select-none">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a35" vertical={false} />
          <XAxis 
            dataKey="time" 
            stroke="#64748b" 
            tickFormatter={formatTime}
            tick={{fontSize: 12}}
            minTickGap={30}
            hide
          />
          <YAxis 
            domain={['auto', 'auto']} 
            stroke="#64748b"
            tick={{fontSize: 12}}
            tickFormatter={(val) => val.toFixed(4)}
            width={60}
            mirror
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#13131f', borderColor: '#2a2a35', color: '#fff' }}
            itemStyle={{ color: color }}
            labelStyle={{ color: '#94a3b8' }}
            labelFormatter={(label) => formatTime(label)}
            formatter={(value: number) => [value.toFixed(6), "Price"]}
            isAnimationActive={false} // Disable tooltip animation for snappier feel
          />
          <Area 
            type="monotone" 
            dataKey="price" 
            stroke={color} 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorPrice)" 
            isAnimationActive={false} // Disable global animation to prevent whole chart redrawing
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
