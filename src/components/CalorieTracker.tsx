import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, TrendingUp, TrendingDown, Edit2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export const CalorieTracker = () => {
  const [calories, setCalories] = useState(0);
  const [protein, setProtein] = useState(0);
  const [carbs, setCarbs] = useState(0);
  const [fats, setFats] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(2500);
  const [proteinGoal, setProteinGoal] = useState(150);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editGoal, setEditGoal] = useState(2500);
  const [editProteinGoal, setEditProteinGoal] = useState(150);
  const [goalId, setGoalId] = useState<string | null>(null);
  const { toast } = useToast();

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
        setEditGoal(goal.target_calories || 2500);
        setEditProteinGoal(Number(goal.target_protein) || 150);
        setGoalId(goal.id);
      }
    } catch (error) {
      console.error('Error fetching today\'s data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGoal = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (goalId) {
        // Update existing goal
        const { error } = await supabase
          .from('daily_goals')
          .update({
            target_calories: editGoal,
            target_protein: editProteinGoal,
          })
          .eq('id', goalId);

        if (error) throw error;
      } else {
        // Create new goal
        const { error } = await supabase
          .from('daily_goals')
          .insert({
            user_id: user.id,
            target_calories: editGoal,
            target_protein: editProteinGoal,
            goal_type: 'maintenance',
            is_active: true,
          });

        if (error) throw error;
      }

      setDailyGoal(editGoal);
      setProteinGoal(editProteinGoal);
      setIsEditOpen(false);
      
      toast({
        title: "Goal updated",
        description: "Your daily calorie goal has been updated successfully.",
      });

      fetchTodaysData();
    } catch (error) {
      console.error('Error saving goal:', error);
      toast({
        title: "Error",
        description: "Failed to update your goal. Please try again.",
        variant: "destructive",
      });
    }
  };

  const progress = (calories / dailyGoal) * 100;
  const remaining = Math.max(0, dailyGoal - calories);
  const proteinProgress = (protein / proteinGoal) * 100;

  return (
    <Card className="bg-card hover:shadow-[var(--shadow-card)] transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Calorie Intake</CardTitle>
        <div className="flex items-center gap-2">
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Edit2 className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Daily Goals</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="calories">Daily Calorie Goal</Label>
                  <Input
                    id="calories"
                    type="number"
                    value={editGoal}
                    onChange={(e) => setEditGoal(Number(e.target.value))}
                    placeholder="2500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="protein">Daily Protein Goal (g)</Label>
                  <Input
                    id="protein"
                    type="number"
                    value={editProteinGoal}
                    onChange={(e) => setEditProteinGoal(Number(e.target.value))}
                    placeholder="150"
                  />
                </div>
                <Button onClick={handleSaveGoal} className="w-full">
                  Save Goals
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Flame className="h-4 w-4 text-accent" />
        </div>
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
