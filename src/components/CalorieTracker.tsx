import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Flame } from "lucide-react";
import { toast } from "sonner";

export const CalorieTracker = () => {
  const [calories, setCalories] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const dailyGoal = 2500;

  const addCalories = () => {
    const value = parseInt(inputValue);
    if (!value || value <= 0) {
      toast.error("Please enter a valid calorie amount");
      return;
    }
    setCalories(prev => prev + value);
    setInputValue("");
    toast.success(`Added ${value} calories`);
  };

  const progress = (calories / dailyGoal) * 100;
  const remaining = Math.max(0, dailyGoal - calories);

  return (
    <Card className="bg-card hover:shadow-[var(--shadow-card)] transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Calorie Intake</CardTitle>
        <Flame className="h-4 w-4 text-accent" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{calories} / {dailyGoal}</div>
        <p className="text-xs text-muted-foreground">{remaining} calories remaining</p>
        
        <div className="mt-3 h-2 w-full bg-secondary rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-accent to-accent/80 transition-all duration-500"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>

        <div className="flex gap-2 mt-4">
          <Input
            type="number"
            placeholder="Add calories"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addCalories()}
            className="bg-secondary border-border"
          />
          <Button onClick={addCalories} size="icon" variant="default">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
