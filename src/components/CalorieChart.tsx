import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, startOfDay, endOfDay, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { Loader2 } from "lucide-react";

interface ChartData {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  goal?: number;
}

export const CalorieChart = () => {
  const [period, setPeriod] = useState("week");
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dailyGoal, setDailyGoal] = useState(2500);

  useEffect(() => {
    fetchGoal();
  }, []);

  useEffect(() => {
    fetchData();
  }, [period, dailyGoal]);

  useEffect(() => {
    // Set up realtime subscription for daily_summaries changes
    const channel = supabase
      .channel('calorie-chart-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'daily_summaries'
        },
        (payload) => {
          console.log('Daily summary changed:', payload);
          fetchData(); // Refresh chart data when summaries change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [period, dailyGoal]);

  const fetchGoal = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: goalData } = await supabase
        .from('daily_goals')
        .select('target_calories')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (goalData?.target_calories) {
        setDailyGoal(goalData.target_calories);
      }
    } catch (error) {
      console.error('Error fetching goal:', error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setData([]);
        return;
      }

      let startDate: Date;
      let endDate = new Date();
      let groupBy: 'day' | 'week' | 'month' = 'day';

      switch (period) {
        case "day":
          startDate = startOfDay(new Date());
          endDate = endOfDay(new Date());
          const { data: todayMeals } = await supabase
            .from('meals')
            .select('*')
            .eq('user_id', user.id)
            .gte('meal_date', format(startDate, 'yyyy-MM-dd'))
            .lte('meal_date', format(endDate, 'yyyy-MM-dd'))
            .order('meal_time', { ascending: true });

          // Create time slots throughout the day (every 2 hours from 6 AM to 10 PM)
          const timeSlots = [6, 8, 10, 12, 14, 16, 18, 20, 22];
          const cumulativeData: ChartData[] = [];

          timeSlots.forEach(hour => {
            // Calculate cumulative totals for all meals up to this hour
            const mealsUpToThisHour = todayMeals?.filter(meal => {
              const mealHour = meal.meal_time ? parseInt(meal.meal_time.split(':')[0]) : 12;
              return mealHour <= hour;
            }) || [];

            const totalCalories = mealsUpToThisHour.reduce((sum, meal) => sum + (Number(meal.calories) || 0), 0);
            const totalProtein = mealsUpToThisHour.reduce((sum, meal) => sum + (Number(meal.protein) || 0), 0);
            const totalCarbs = mealsUpToThisHour.reduce((sum, meal) => sum + (Number(meal.carbs) || 0), 0);
            const totalFats = mealsUpToThisHour.reduce((sum, meal) => sum + (Number(meal.fats) || 0), 0);

            const displayTime = hour === 12 ? '12 PM' : 
                               hour < 12 ? `${hour} AM` : 
                               `${hour - 12} PM`;
            
            cumulativeData.push({
              name: displayTime,
              calories: totalCalories,
              protein: totalProtein,
              carbs: totalCarbs,
              fats: totalFats,
              goal: dailyGoal
            });
          });
          
          setData(cumulativeData);
          break;

        case "week":
          startDate = subDays(new Date(), 6);
          const { data: weekData } = await supabase
            .from('daily_summaries')
            .select('*')
            .eq('user_id', user.id)
            .gte('summary_date', format(startDate, 'yyyy-MM-dd'))
            .lte('summary_date', format(endDate, 'yyyy-MM-dd'))
            .order('summary_date', { ascending: true });

          const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = subDays(new Date(), 6 - i);
            const dateStr = format(date, 'yyyy-MM-dd');
            const dayData = weekData?.find(d => d.summary_date === dateStr);
            
            return {
              name: i === 6 ? `Today\n${format(date, 'MMM d')}` : `${format(date, 'EEE')}\n${format(date, 'MMM d')}`,
              calories: Number(dayData?.total_calories) || 0,
              protein: Number(dayData?.total_protein) || 0,
              carbs: Number(dayData?.total_carbs) || 0,
              fats: Number(dayData?.total_fats) || 0,
              goal: dailyGoal
            };
          });
          setData(last7Days);
          break;

        case "month":
          startDate = subDays(new Date(), 29);
          const { data: monthData } = await supabase
            .from('daily_summaries')
            .select('*')
            .eq('user_id', user.id)
            .gte('summary_date', format(startDate, 'yyyy-MM-dd'))
            .lte('summary_date', format(endDate, 'yyyy-MM-dd'))
            .order('summary_date', { ascending: true });

          const last30Days = Array.from({ length: 30 }, (_, i) => {
            const date = subDays(new Date(), 29 - i);
            const dateStr = format(date, 'yyyy-MM-dd');
            const dayData = monthData?.find(d => d.summary_date === dateStr);
            
            return {
              name: format(date, 'MMM d'),
              calories: Number(dayData?.total_calories) || 0,
              protein: Number(dayData?.total_protein) || 0,
              carbs: Number(dayData?.total_carbs) || 0,
              fats: Number(dayData?.total_fats) || 0,
              goal: dailyGoal
            };
          });
          setData(last30Days);
          break;

        case "year":
          startDate = subMonths(new Date(), 11);
          const { data: yearData } = await supabase
            .from('daily_summaries')
            .select('*')
            .eq('user_id', user.id)
            .gte('summary_date', format(startOfMonth(startDate), 'yyyy-MM-dd'))
            .lte('summary_date', format(endDate, 'yyyy-MM-dd'))
            .order('summary_date', { ascending: true });

          const last12Months = Array.from({ length: 12 }, (_, i) => {
            const monthStart = startOfMonth(subMonths(new Date(), 11 - i));
            const monthEnd = endOfMonth(monthStart);
            const monthStartStr = format(monthStart, 'yyyy-MM-dd');
            const monthEndStr = format(monthEnd, 'yyyy-MM-dd');
            
            const monthTotal = yearData?.filter(d => 
              d.summary_date >= monthStartStr && d.summary_date <= monthEndStr
            ).reduce((acc, d) => ({
              calories: acc.calories + Number(d.total_calories || 0),
              protein: acc.protein + Number(d.total_protein || 0),
              carbs: acc.carbs + Number(d.total_carbs || 0),
              fats: acc.fats + Number(d.total_fats || 0)
            }), { calories: 0, protein: 0, carbs: 0, fats: 0 });

            const daysInMonth = yearData?.filter(d => 
              d.summary_date >= monthStartStr && d.summary_date <= monthEndStr
            ).length || 1;

            return {
              name: format(monthStart, 'MMM'),
              calories: Math.round(monthTotal!.calories / daysInMonth),
              protein: Math.round(monthTotal!.protein / daysInMonth),
              carbs: Math.round(monthTotal!.carbs / daysInMonth),
              fats: Math.round(monthTotal!.fats / daysInMonth),
              goal: dailyGoal
            };
          });
          setData(last12Months);
          break;

        default:
          setData([]);
      }
    } catch (error) {
      console.error('Error fetching calorie data:', error);
      setData([]);
    } finally {
      setLoading(false);
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
            {loading ? (
              <div className="flex items-center justify-center h-[300px]">
                <Loader2 className="h-8 w-8 animate-spin text-accent" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="calorieGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(160 84% 45%)" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(160 84% 45%)" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="proteinGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(220 84% 55%)" stopOpacity={0.6}/>
                      <stop offset="95%" stopColor="hsl(220 84% 55%)" stopOpacity={0}/>
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
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="goal" 
                    stroke="hsl(0 0% 60%)" 
                    strokeWidth={1}
                    strokeDasharray="5 5"
                    fill="none"
                    name="Daily Goal"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="calories" 
                    stroke="hsl(160 84% 45%)" 
                    strokeWidth={2}
                    fill="url(#calorieGradient)"
                    name="Calories"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="protein" 
                    stroke="hsl(220 84% 55%)" 
                    strokeWidth={1}
                    fill="url(#proteinGradient)"
                    name="Protein (g)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
