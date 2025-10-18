import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, TrendingUp, TrendingDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export const CalorieTracker = () => {
  const [calories, setCalories] = useState(0);
  const [protein, setProtein] = useState(0);
  const [carbs, setCarbs] = useState(0);
  const [fats, setFats] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(2500);
  const [proteinGoal, setProteinGoal] = useState(150);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodaysData();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('daily-summaries-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'daily_summaries'
        },
        () => {
          fetchTodaysData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchTodaysData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const today = format(new Date(), 'yyyy-MM-dd');

      // Fetch today's summary
      const { data: summary } = await supabase
        .from('daily_summaries')
        .select('*')
        .eq('user_id', user.id)
        .eq('summary_date', today)
        .maybeSingle();

      // Fetch user's goals
      const { data: goal } = await supabase
        .from('daily_goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (summary) {
        setCalories(Number(summary.total_calories) || 0);
        setProtein(Number(summary.total_protein) || 0);
        setCarbs(Number(summary.total_carbs) || 0);
        setFats(Number(summary.total_fats) || 0);
      }

      if (goal) {
        setDailyGoal(goal.target_calories || 2500);
        setProteinGoal(Number(goal.target_protein) || 150);
      }
    } catch (error) {
      console.error('Error fetching today\'s data:', error);
    } finally {
      setLoading(false);
    }
  };

  const progress = (calories / dailyGoal) * 100;
  const remaining = Math.max(0, dailyGoal - calories);
  const proteinProgress = (protein / proteinGoal) * 100;

  return (
    <Card className="bg-card hover:shadow-[var(--shadow-card)] transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Calorie Intake</CardTitle>
        <Flame className="h-4 w-4 text-accent" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-8 bg-secondary rounded w-3/4"></div>
            <div className="h-4 bg-secondary rounded w-1/2"></div>
            <div className="h-2 bg-secondary rounded"></div>
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold text-foreground flex items-center gap-2">
              {calories} / {dailyGoal}
              {calories > dailyGoal ? (
                <TrendingUp className="h-5 w-5 text-destructive" />
              ) : calories > dailyGoal * 0.8 ? (
                <TrendingUp className="h-5 w-5 text-accent" />
              ) : null}
            </div>
            <p className="text-xs text-muted-foreground">
              {remaining > 0 ? `${remaining} calories remaining` : `${Math.abs(remaining)} calories over goal`}
            </p>
            
            <div className="mt-3 h-2 w-full bg-secondary rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${
                  progress > 100 
                    ? 'bg-gradient-to-r from-destructive to-destructive/80' 
                    : 'bg-gradient-to-r from-accent to-accent/80'
                }`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 mt-4 text-xs">
              <div className="bg-secondary/50 p-2 rounded">
                <p className="text-muted-foreground">Protein</p>
                <p className="font-bold text-foreground">{protein}g</p>
                <div className="h-1 bg-background rounded mt-1">
                  <div 
                    className="h-full bg-primary rounded"
                    style={{ width: `${Math.min(proteinProgress, 100)}%` }}
                  />
                </div>
              </div>
              <div className="bg-secondary/50 p-2 rounded">
                <p className="text-muted-foreground">Carbs</p>
                <p className="font-bold text-foreground">{carbs}g</p>
              </div>
              <div className="bg-secondary/50 p-2 rounded">
                <p className="text-muted-foreground">Fats</p>
                <p className="font-bold text-foreground">{fats}g</p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
