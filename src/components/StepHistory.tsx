import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, Calendar } from "lucide-react";

interface StepHistoryProps {
  userId?: string;
  days?: number;
}

interface DailyData {
  date: string;
  steps: number;
  distance: number;
  calories: number;
}

export const StepHistory = ({ userId, days = 7 }: StepHistoryProps) => {
  const [historyData, setHistoryData] = useState<DailyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchHistory = async () => {
      try {
        const startDate = format(subDays(new Date(), days), 'yyyy-MM-dd');
        
        const { data, error } = await supabase
          .from('daily_summaries')
          .select('summary_date, total_steps, calories_burned')
          .eq('user_id', userId)
          .gte('summary_date', startDate)
          .order('summary_date', { ascending: true });

        if (error) throw error;

        const formattedData: DailyData[] = (data || []).map(item => ({
          date: format(new Date(item.summary_date), 'MMM dd'),
          steps: item.total_steps || 0,
          distance: (item.total_steps || 0) * 0.000762, // approximate km
          calories: item.calories_burned || 0
        }));

        setHistoryData(formattedData);
      } catch (error) {
        console.error('Error fetching step history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [userId, days]);

  const totalSteps = historyData.reduce((sum, day) => sum + day.steps, 0);
  const avgSteps = historyData.length > 0 ? Math.round(totalSteps / historyData.length) : 0;

  if (loading) {
    return (
      <Card className="bg-card">
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-[200px] bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card hover:shadow-[var(--shadow-card)] transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Step History ({days} Days)</CardTitle>
        <Calendar className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary stats */}
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Total Steps</p>
            <p className="text-xl font-bold text-foreground">{totalSteps.toLocaleString()}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Daily Average</p>
            <p className="text-xl font-bold text-foreground">{avgSteps.toLocaleString()}</p>
          </div>
        </div>

        {/* Chart */}
        {historyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={historyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="steps" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No data available yet</p>
              <p className="text-xs">Start tracking to see your progress</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
