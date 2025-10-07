import { Button } from "@/components/ui/button";
import { StepCounter } from "@/components/StepCounter";
import { CalorieTracker } from "@/components/CalorieTracker";
import { CalorieChart } from "@/components/CalorieChart";
import { RecipeCard } from "@/components/RecipeCard";
import { AIRecipeGenerator } from "@/components/AIRecipeGenerator";
import { ChefHat, TrendingUp, BookOpen } from "lucide-react";
import heroImage from "@/assets/hero-nutrition.jpg";
import recipe1 from "@/assets/recipe-1.jpg";
import recipe2 from "@/assets/recipe-2.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-[var(--gradient-hero)] opacity-90" />
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">
            Fuel Your <span className="text-primary">Fitness Journey</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            AI-powered nutrition tracking and recipe generation for gym enthusiasts. 
            Track calories, count steps, and discover high-protein meals.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button variant="hero" size="lg">
              <ChefHat className="mr-2 h-5 w-5" />
              Get AI Recipes
            </Button>
            <Button variant="outline" size="lg" className="bg-card/50 backdrop-blur-sm border-primary/30 hover:bg-card/80">
              <TrendingUp className="mr-2 h-5 w-5" />
              Track Progress
            </Button>
          </div>
        </div>
      </section>

      {/* Dashboard Section */}
      <section className="py-12 px-4 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-foreground flex items-center gap-2">
          <TrendingUp className="h-8 w-8 text-primary" />
          Your Daily Stats
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <CalorieTracker />
          <StepCounter />
          <AIRecipeGenerator />
        </div>

        <CalorieChart />
      </section>

      {/* Recipes Section */}
      <section className="py-12 px-4 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-foreground flex items-center gap-2">
          <BookOpen className="h-8 w-8 text-primary" />
          Featured Recipes
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <RecipeCard 
            title="Grilled Chicken Power Bowl"
            image={recipe1}
            calories={450}
            protein={45}
            cookTime="25 min"
            tags={["High Protein", "Low Carb", "Meal Prep"]}
          />
          <RecipeCard 
            title="Baked Salmon with Sweet Potato"
            image={recipe2}
            calories={520}
            protein={38}
            cookTime="30 min"
            tags={["Omega-3", "Balanced", "Dinner"]}
          />
          <RecipeCard 
            title="Protein-Packed Quinoa Salad"
            image={recipe1}
            calories={380}
            protein={28}
            cookTime="15 min"
            tags={["Vegetarian", "Quick", "Lunch"]}
          />
        </div>

        <div className="mt-8 text-center">
          <Button variant="accent" size="lg">
            View All Recipes
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
