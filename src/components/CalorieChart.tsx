import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const generateData = (days: number) => {
  return Array.from({ length: days }, (_, i) => ({
    name: i === days - 1 ? 'Today' : `Day ${i + 1}`,
    calories: Math.floor(Math.random() * 1000) + 1500,
  }));
};

const weekData = generateData(7);
const monthData = generateData(30);
const yearData = generateData(12).map((d, i) => ({ ...d, name: `Month ${i + 1}` }));

export const CalorieChart = () => {
  const [period, setPeriod] = useState("week");

  const getData = () => {
    switch (period) {
      case "day": return [{ name: "Morning", calories: 500 }, { name: "Noon", calories: 800 }, { name: "Evening", calories: 1200 }];
      case "week": return weekData;
      case "month": return monthData;
      case "year": return yearData;
      default: return weekData;
    }
  };

  return (
    <Card className="col-span-full bg-card hover:shadow-[var(--shadow-card)] transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-foreground">Calorie Intake Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={period} onValueChange={setPeriod} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-secondary">
            <TabsTrigger value="day">Day</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="year">Year</TabsTrigger>
          </TabsList>
          <TabsContent value={period} className="mt-6">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={getData()}>
                <defs>
                  <linearGradient id="calorieGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(160 84% 45%)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(160 84% 45%)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 20%)" />
                <XAxis dataKey="name" stroke="hsl(160 5% 65%)" />
                <YAxis stroke="hsl(160 5% 65%)" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(220 18% 12%)", 
                    border: "1px solid hsl(220 15% 20%)",
                    borderRadius: "0.75rem"
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="calories" 
                  stroke="hsl(160 84% 45%)" 
                  strokeWidth={2}
                  fill="url(#calorieGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
