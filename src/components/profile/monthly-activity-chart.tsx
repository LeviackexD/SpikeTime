/**
 * @fileoverview A bar chart component showing user's monthly session activity.
 * It uses recharts to display data for the last 6 months.
 */

'use client';

import * as React from 'react';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useTheme } from 'next-themes';

const generateLast6MonthsData = () => {
    const data = [];
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthName = d.toLocaleString('default', { month: 'short' });
        // Generate a random number of sessions for mock data
        const sessions = Math.floor(Math.random() * 15) + 4;
        data.push({ name: monthName, sessions: sessions });
    }
    return data;
}

export default function MonthlyActivityChart() {
  const { resolvedTheme } = useTheme();
  const [data, setData] = React.useState<{name: string, sessions: number}[]>([]);

  React.useEffect(() => {
    setData(generateLast6MonthsData());
  }, []);
  
  // Determine colors from CSS variables based on the theme
  const [barColor, setBarColor] = React.useState('#000000');
  const [axisColor, setAxisColor] = React.useState('#000000');

  React.useEffect(() => {
    const computedStyle = getComputedStyle(document.documentElement);
    // HSL values from globals.css for primary and muted-foreground
    const primaryColor = resolvedTheme === 'dark' ? 'hsl(26 70% 28%)' : 'hsl(26 70% 25%)';
    const mutedColor = resolvedTheme === 'dark' ? 'hsl(215 20% 65%)' : 'hsl(25 25% 45%)';
    setBarColor(primaryColor);
    setAxisColor(mutedColor);
  }, [resolvedTheme]);


  return (
    <div className="h-64 w-full">
        <ResponsiveContainer>
            <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <XAxis
                dataKey="name"
                stroke={axisColor}
                fontSize={12}
                tickLine={false}
                axisLine={false}
            />
            <YAxis
                stroke={axisColor}
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
            />
            <Tooltip
                cursor={{ fill: 'hsla(var(--muted), 0.5)' }}
                content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                        return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                            <div className="grid grid-cols-2 gap-2">
                                <div className="flex flex-col">
                                    <span className="text-muted-foreground text-xs">{payload[0].payload.name}</span>
                                    <span className="font-bold">{`${payload[0].value} sessions`}</span>
                                </div>
                            </div>
                        </div>
                        );
                    }
                    return null;
                }}
            />
            <Bar
                dataKey="sessions"
                fill={barColor}
                radius={[4, 4, 0, 0]}
            />
            </BarChart>
        </ResponsiveContainer>
    </div>
  );
}
