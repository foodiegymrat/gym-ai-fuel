import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

export const AIRecipeGenerator = () => {
  const [loading, setLoading] = useState(false);

  const generateRecipe = () => {
    setLoading(true);
    // Simulated AI generation
    setTimeout(() => {
      setLoading(false);
      toast.success("AI recipe generated! Check your recipes page");
    }, 2000);
  };

  return (
    <Card className="bg-gradient-to-br from-card to-secondary border-primary/20 hover:shadow-[var(--shadow-glow)] transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Recipe Generator
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Get personalized high-protein recipes based on your fitness goals and dietary preferences.
        </p>
        <Button 
          onClick={generateRecipe} 
          disabled={loading}
          variant="hero"
          className="w-full"
        >
          {loading ? "Generating..." : "Generate Recipe with AI"}
        </Button>
        <p className="text-xs text-muted-foreground mt-3 text-center">
          Powered by AI to optimize your nutrition
        </p>
      </CardContent>
    </Card>
  );
};
