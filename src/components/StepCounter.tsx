import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Footprints } from "lucide-react";

export const StepCounter = () => {
  const [steps, setSteps] = useState(0);
  const dailyGoal = 10000;

  useEffect(() => {
    // Simulated step counting - in real app would use device motion sensors
    const interval = setInterval(() => {
      setSteps(prev => Math.min(prev + Math.floor(Math.random() * 50), dailyGoal));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const progress = (steps / dailyGoal) * 100;

  return (
    <Card className="bg-card hover:shadow-[var(--shadow-card)] transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Steps Today</CardTitle>
        <Footprints className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{steps.toLocaleString()}</div>
        <p className="text-xs text-muted-foreground">Goal: {dailyGoal.toLocaleString()}</p>
        <div className="mt-3 h-2 w-full bg-secondary rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">{progress.toFixed(0)}% of daily goal</p>
      </CardContent>
    </Card>
  );
};
