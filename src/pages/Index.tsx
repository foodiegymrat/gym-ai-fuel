import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AdvancedStepCounter } from "@/components/AdvancedStepCounter";
import { CalorieTracker } from "@/components/CalorieTracker";
import { CalorieChart } from "@/components/CalorieChart";
import { RecipeCard } from "@/components/RecipeCard";
import { AIRecipeGenerator } from "@/components/AIRecipeGenerator";
import { ChefHat, TrendingUp, BookOpen, Dumbbell } from "lucide-react";
import heroImage from "@/assets/hero-nutrition.jpg";
import recipe1 from "@/assets/recipe-1.jpg";
import recipe2 from "@/assets/recipe-2.jpg";

const Index = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between py-4 px-4">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              FitNutrition AI
            </span>
          </div>
          <div className="flex gap-4 items-center">
            <Button variant="hero" size="sm" onClick={() => navigate("/auth")}>
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-24 md:py-32 px-4 max-w-5xl mx-auto text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 text-foreground">
          Fuel Your <span className="text-primary">Fitness Journey</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
          AI-powered nutrition tracking and recipe generation for gym enthusiasts.
        </p>
        <div className="flex gap-4 justify-center">
          <Button variant="default" size="lg" onClick={() => navigate("/auth")}>
            Get Started
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-muted-foreground">
          <p>© 2025 FitNutrition AI. Fuel your gains with smart nutrition.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
