import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChefHat, Clock, Flame, Users, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface Recipe {
  id: string;
  title: string;
  description: string;
  calories_per_serving: number;
  protein_per_serving: number;
  servings: number;
  cook_time: number;
  tags: string[];
  image_url?: string;
}

export const RecommendedRecipes = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [remainingCalories, setRemainingCalories] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Get user's daily goal and current intake
      const today = new Date().toISOString().split('T')[0];
      
      const [goalResult, summaryResult] = await Promise.all([
        supabase
          .from('daily_goals')
          .select('target_calories')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .maybeSingle(),
        supabase
          .from('daily_summaries')
          .select('total_calories')
          .eq('user_id', user.id)
          .eq('summary_date', today)
          .maybeSingle()
      ]);

      const targetCalories = goalResult.data?.target_calories || 2500;
      const currentCalories = summaryResult.data?.total_calories || 0;
      const remaining = Math.max(0, targetCalories - currentCalories);
      setRemainingCalories(remaining);

      // Fetch recipes that fit within remaining calories
      // Show both user's recipes and public recipes
      const { data: recipesData } = await supabase
        .from('recipes')
        .select('*')
        .or(`user_id.eq.${user.id},is_public.eq.true`)
        .lte('calories_per_serving', remaining > 0 ? remaining : targetCalories)
        .order('created_at', { ascending: false })
        .limit(6);

      setRecipes(recipesData || []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="col-span-full bg-card hover:shadow-[var(--shadow-card)] transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-foreground flex items-center gap-2">
            <ChefHat className="h-5 w-5 text-accent" />
            Recommended Recipes
          </CardTitle>
          {remainingCalories > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              Based on your remaining {remainingCalories} calories today
            </p>
          )}
        </div>
        <Button 
          onClick={() => navigate('/recipe-generator')}
          variant="outline"
          size="sm"
        >
          Generate New Recipe
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-secondary h-48 rounded-t-lg"></div>
                <div className="bg-secondary/50 p-4 rounded-b-lg space-y-3">
                  <div className="h-4 bg-secondary rounded w-3/4"></div>
                  <div className="h-3 bg-secondary rounded w-full"></div>
                  <div className="h-3 bg-secondary rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : recipes.length === 0 ? (
          <div className="text-center py-12">
            <ChefHat className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No recipes found yet</p>
            <Button onClick={() => navigate('/recipe-generator')} variant="hero">
              Generate Your First Recipe
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recipes.map((recipe) => (
              <Card 
                key={recipe.id} 
                className="overflow-hidden hover:shadow-[var(--shadow-glow)] transition-all duration-300 cursor-pointer group"
              >
                {recipe.image_url ? (
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={recipe.image_url} 
                      alt={recipe.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="h-48 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <ChefHat className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
                
                <CardContent className="p-4">
                  <h3 className="font-semibold text-foreground mb-2 line-clamp-1">
                    {recipe.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                    {recipe.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="secondary" className="text-xs">
                      <Flame className="h-3 w-3 mr-1" />
                      {recipe.calories_per_serving} cal
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      <Users className="h-3 w-3 mr-1" />
                      {recipe.servings} servings
                    </Badge>
                    {recipe.cook_time && (
                      <Badge variant="secondary" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        {recipe.cook_time} min
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-accent">
                      {recipe.protein_per_serving}g protein
                    </div>
                    <Button size="sm" variant="ghost">
                      View Recipe
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  </div>

                  {recipe.tags && recipe.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {recipe.tags.slice(0, 3).map((tag, i) => (
                        <Badge 
                          key={i} 
                          variant="outline" 
                          className="text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
