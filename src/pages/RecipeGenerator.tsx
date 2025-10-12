import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Camera, Clock, ChefHat, Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function RecipeGenerator() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [ingredients, setIngredients] = useState("");
  const [cookingTime, setCookingTime] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [recipe, setRecipe] = useState<any>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const timeOptions = [5, 10, 15, 20, 30, 45, 60];

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setImageFile(file);
    setIsLoading(true);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result as string;
        
        const { data, error } = await supabase.functions.invoke('analyze-food', {
          body: { imageBase64: base64Image }
        });

        if (error) throw error;

        const detectedIngredients = data.foods.map((food: any) => food.name).join(', ');
        setIngredients(detectedIngredients);
        toast.success('Ingredients detected from image!');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error analyzing image:', error);
      toast.error('Failed to analyze image');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateRecipe = async () => {
    if (!ingredients || !cookingTime) {
      toast.error('Please provide ingredients and cooking time');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-recipe', {
        body: { ingredients, cookingTime }
      });

      if (error) throw error;

      setRecipe(data);
      setStep(3);
      toast.success('Recipe generated successfully!');
    } catch (error) {
      console.error('Error generating recipe:', error);
      toast.error('Failed to generate recipe');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 md:p-6 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChefHat className="h-6 w-6 text-primary" />
                Add Ingredients
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-2 block">Type Ingredients</label>
                <Textarea
                  placeholder="Enter ingredients separated by commas (e.g., chicken, rice, tomatoes, onions)"
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                  rows={4}
                  className="w-full"
                />
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Upload Ingredient Photo</label>
                <div className="flex gap-4">
                  <label className="flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="ingredient-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => document.getElementById('ingredient-upload')?.click()}
                      disabled={isLoading}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {isLoading ? 'Analyzing...' : 'Upload Photo'}
                    </Button>
                  </label>
                  <label className="flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="ingredient-camera"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => document.getElementById('ingredient-camera')?.click()}
                      disabled={isLoading}
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      {isLoading ? 'Analyzing...' : 'Take Photo'}
                    </Button>
                  </label>
                </div>
              </div>

              <Button
                onClick={() => setStep(2)}
                disabled={!ingredients || isLoading}
                className="w-full"
                variant="hero"
              >
                Next: Choose Cooking Time
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-6 w-6 text-primary" />
                Select Cooking Time
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-sm text-muted-foreground mb-4">
                  Ingredients: {ingredients}
                </p>
              </div>

              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {timeOptions.map((time) => (
                  <Button
                    key={time}
                    variant={cookingTime === time ? "default" : "outline"}
                    onClick={() => setCookingTime(time)}
                    className="h-20 flex flex-col items-center justify-center"
                  >
                    <Clock className="h-5 w-5 mb-1" />
                    <span className="text-lg font-semibold">{time}</span>
                    <span className="text-xs">minutes</span>
                  </Button>
                ))}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleGenerateRecipe}
                  disabled={!cookingTime || isLoading}
                  className="flex-1"
                  variant="hero"
                >
                  {isLoading ? 'Generating Recipe...' : 'Generate Recipe'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && recipe && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChefHat className="h-6 w-6 text-primary" />
                {recipe.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">
                  <Clock className="h-3 w-3 mr-1" />
                  {cookingTime} min
                </Badge>
                {recipe.servings && (
                  <Badge variant="secondary">Serves {recipe.servings}</Badge>
                )}
                {recipe.difficulty && (
                  <Badge variant="secondary">{recipe.difficulty}</Badge>
                )}
              </div>

              {recipe.description && (
                <p className="text-muted-foreground">{recipe.description}</p>
              )}

              <div>
                <h3 className="font-semibold text-lg mb-3">Ingredients</h3>
                <ul className="space-y-2">
                  {recipe.ingredients.map((ingredient: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>{ingredient}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">Cooking Instructions</h3>
                <ol className="space-y-4">
                  {recipe.instructions.map((instruction: string, index: number) => (
                    <li key={index} className="flex gap-3">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                        {index + 1}
                      </span>
                      <p className="flex-1 pt-1">{instruction}</p>
                    </li>
                  ))}
                </ol>
              </div>

              {recipe.nutrition && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">Nutritional Information (per serving)</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(recipe.nutrition).map(([key, value]) => (
                      <div key={key} className="bg-secondary p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground capitalize">{key}</p>
                        <p className="text-lg font-semibold">{String(value)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {recipe.tips && recipe.tips.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">Chef's Tips</h3>
                  <ul className="space-y-2">
                    {recipe.tips.map((tip: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <span className="text-accent mt-1">💡</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setStep(1);
                    setIngredients("");
                    setCookingTime(null);
                    setRecipe(null);
                    setImageFile(null);
                  }}
                  className="flex-1"
                >
                  Generate Another Recipe
                </Button>
                <Button
                  onClick={() => navigate('/dashboard')}
                  className="flex-1"
                  variant="hero"
                >
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
