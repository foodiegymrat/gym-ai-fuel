import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Upload, Loader2, Edit2, Save, X, Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface FoodItem {
  name: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  originalPortion?: number;
  originalCalories?: number;
  originalProtein?: number;
  originalCarbs?: number;
  originalFats?: number;
  originalFiber?: number;
}

interface AnalysisResult {
  foods: FoodItem[];
  total: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    fiber: number;
  };
}

export const AIFoodScanner = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editedFood, setEditedFood] = useState<FoodItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setImagePreview(base64);
      analyzeImage(base64);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async (imageBase64: string) => {
    setAnalyzing(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-food', {
        body: { imageBase64 }
      });

      if (error) throw error;

      // Store original values for proportional recalculation
      const enhancedData = {
        ...data,
        foods: data.foods.map((food: FoodItem) => {
          const portionMatch = food.portion.match(/(\d+(?:\.\d+)?)/);
          const portionNumber = portionMatch ? parseFloat(portionMatch[1]) : 100;
          
          return {
            ...food,
            originalPortion: portionNumber,
            originalCalories: food.calories,
            originalProtein: food.protein,
            originalCarbs: food.carbs,
            originalFats: food.fats,
            originalFiber: food.fiber,
          };
        })
      };

      setResult(enhancedData);
      toast.success('Food analyzed successfully!');
    } catch (error: any) {
      console.error('Error analyzing food:', error);
      if (error.message?.includes('Rate limit')) {
        toast.error('Rate limit exceeded. Please try again later.');
      } else if (error.message?.includes('Payment required')) {
        toast.error('AI credits depleted. Please add credits.');
      } else {
        toast.error('Failed to analyze food. Please try again.');
      }
    } finally {
      setAnalyzing(false);
    }
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setEditedFood({ ...result!.foods[index] });
  };

  const saveEdit = () => {
    if (editingIndex !== null && editedFood && result) {
      const newFoods = [...result.foods];
      newFoods[editingIndex] = editedFood;
      
      const newTotal = newFoods.reduce((acc, food) => ({
        calories: acc.calories + food.calories,
        protein: acc.protein + food.protein,
        carbs: acc.carbs + food.carbs,
        fats: acc.fats + food.fats,
        fiber: acc.fiber + food.fiber,
      }), { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 });

      setResult({ foods: newFoods, total: newTotal });
      setEditingIndex(null);
      setEditedFood(null);
      toast.success('Food item updated');
    }
  };

  const removeFood = (index: number) => {
    if (result) {
      const newFoods = result.foods.filter((_, i) => i !== index);
      const newTotal = newFoods.reduce((acc, food) => ({
        calories: acc.calories + food.calories,
        protein: acc.protein + food.protein,
        carbs: acc.carbs + food.carbs,
        fats: acc.fats + food.fats,
        fiber: acc.fiber + food.fiber,
      }), { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 });

      setResult({ foods: newFoods, total: newTotal });
      toast.success('Food item removed');
    }
  };

  const addMeal = async () => {
    if (!result) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please login to add meals');
        return;
      }

      const today = new Date().toISOString().split('T')[0];
      const mealName = result.foods.map(f => f.name).join(', ');

      // Insert individual food items into meals table
      const currentTime = format(new Date(), 'HH:mm:ss');
      const mealInserts = result.foods.map(food => ({
        user_id: user.id,
        meal_name: food.name,
        meal_type: 'snack',
        meal_date: today,
        meal_time: currentTime,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fats: food.fats,
        fiber: food.fiber,
        notes: `Portion: ${food.portion}`
      }));

      const { error: mealsError } = await supabase
        .from('meals')
        .insert(mealInserts);

      if (mealsError) throw mealsError;

      // Update daily summary
      const { data: existingSummary } = await supabase
        .from('daily_summaries')
        .select('*')
        .eq('user_id', user.id)
        .eq('summary_date', today)
        .maybeSingle();

      if (existingSummary) {
        const { error } = await supabase
          .from('daily_summaries')
          .update({
            total_calories: (Number(existingSummary.total_calories) || 0) + result.total.calories,
            total_protein: (Number(existingSummary.total_protein) || 0) + result.total.protein,
            total_carbs: (Number(existingSummary.total_carbs) || 0) + result.total.carbs,
            total_fats: (Number(existingSummary.total_fats) || 0) + result.total.fats,
            total_fiber: (Number(existingSummary.total_fiber) || 0) + result.total.fiber,
          })
          .eq('id', existingSummary.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('daily_summaries')
          .insert({
            user_id: user.id,
            summary_date: today,
            total_calories: result.total.calories,
            total_protein: result.total.protein,
            total_carbs: result.total.carbs,
            total_fats: result.total.fats,
            total_fiber: result.total.fiber,
          });

        if (error) throw error;
      }

      toast.success(`Added ${result.total.calories} calories to your daily intake!`);
      setResult(null);
      setImagePreview(null);
    } catch (error) {
      console.error('Error adding meal:', error);
      toast.error('Failed to add meal');
    }
  };

  const saveMeal = async () => {
    if (!result) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please login to save meals');
        return;
      }

      const mealName = result.foods.map(f => f.name).join(', ');
      
      const { error } = await supabase.from('meals').insert({
        user_id: user.id,
        meal_name: mealName,
        meal_type: 'snack',
        calories: result.total.calories,
        protein: result.total.protein,
        carbs: result.total.carbs,
        fats: result.total.fats,
        fiber: result.total.fiber,
        notes: `AI-detected: ${result.foods.map(f => `${f.name} (${f.portion})`).join(', ')}`
      });

      if (error) throw error;

      toast.success('Meal saved successfully!');
      setResult(null);
      setImagePreview(null);
    } catch (error) {
      console.error('Error saving meal:', error);
      toast.error('Failed to save meal');
    }
  };

  return (
    <Card className="bg-card hover:shadow-[var(--shadow-card)] transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">AI Food Scanner</CardTitle>
        <Camera className="h-4 w-4 text-accent" />
      </CardHeader>
      <CardContent className="space-y-4">
        {!imagePreview ? (
          <div className="space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleImageSelect(e.target.files[0])}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleImageSelect(e.target.files[0])}
            />
            <Button
              onClick={() => cameraInputRef.current?.click()}
              className="w-full"
              variant="default"
            >
              <Camera className="h-4 w-4 mr-2" />
              Take Photo
            </Button>
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="w-full"
              variant="outline"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Photo
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <img
              src={imagePreview}
              alt="Food preview"
              className="w-full h-48 object-cover rounded-md"
            />

            {analyzing && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-accent" />
                <span className="ml-2 text-sm text-muted-foreground">Analyzing food...</span>
              </div>
            )}

            {result && (
              <div className="space-y-3">
                <div className="space-y-2">
                  {result.foods.map((food, index) => (
                    <div key={index} className="bg-secondary/50 p-3 rounded-md space-y-2">
                      {editingIndex === index ? (
                        <div className="space-y-2">
                          <Input
                            value={editedFood?.name || ''}
                            onChange={(e) => setEditedFood({ ...editedFood!, name: e.target.value })}
                            placeholder="Food name"
                            className="bg-background"
                          />
                          <div className="space-y-2">
                            <Label className="text-xs">Amount/Portion</Label>
                            <Input
                              value={editedFood?.portion || ''}
                              onChange={(e) => {
                                const newPortion = e.target.value;
                                const newPortionMatch = newPortion.match(/(\d+(?:\.\d+)?)/);
                                const newPortionNumber = newPortionMatch ? parseFloat(newPortionMatch[1]) : 0;
                                
                                if (newPortionNumber > 0 && editedFood?.originalPortion) {
                                  const ratio = newPortionNumber / editedFood.originalPortion;
                                  
                                  setEditedFood({
                                    ...editedFood,
                                    portion: newPortion,
                                    calories: Math.round((editedFood.originalCalories || 0) * ratio),
                                    protein: Math.round((editedFood.originalProtein || 0) * ratio * 10) / 10,
                                    carbs: Math.round((editedFood.originalCarbs || 0) * ratio * 10) / 10,
                                    fats: Math.round((editedFood.originalFats || 0) * ratio * 10) / 10,
                                    fiber: Math.round((editedFood.originalFiber || 0) * ratio * 10) / 10,
                                  });
                                } else {
                                  setEditedFood({ ...editedFood!, portion: newPortion });
                                }
                              }}
                              placeholder="e.g., 100g, 1 cup"
                              className="bg-background"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-xs">Calories</Label>
                              <Input
                                type="number"
                                value={editedFood?.calories || 0}
                                onChange={(e) => setEditedFood({ ...editedFood!, calories: parseFloat(e.target.value) })}
                                className="bg-background"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Protein (g)</Label>
                              <Input
                                type="number"
                                value={editedFood?.protein || 0}
                                onChange={(e) => setEditedFood({ ...editedFood!, protein: parseFloat(e.target.value) })}
                                className="bg-background"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Carbs (g)</Label>
                              <Input
                                type="number"
                                value={editedFood?.carbs || 0}
                                onChange={(e) => setEditedFood({ ...editedFood!, carbs: parseFloat(e.target.value) })}
                                className="bg-background"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Fats (g)</Label>
                              <Input
                                type="number"
                                value={editedFood?.fats || 0}
                                onChange={(e) => setEditedFood({ ...editedFood!, fats: parseFloat(e.target.value) })}
                                className="bg-background"
                              />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={saveEdit} size="sm" variant="default">
                              <Save className="h-3 w-3 mr-1" /> Save
                            </Button>
                            <Button onClick={() => setEditingIndex(null)} size="sm" variant="outline">
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-foreground">{food.name}</p>
                              <p className="text-xs text-muted-foreground">{food.portion}</p>
                            </div>
                            <div className="flex gap-1">
                              <Button onClick={() => startEditing(index)} size="sm" variant="ghost">
                                <Edit2 className="h-3 w-3" />
                              </Button>
                              <Button onClick={() => removeFood(index)} size="sm" variant="ghost">
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-muted-foreground">Calories:</span>{' '}
                              <span className="font-medium">{food.calories}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Protein:</span>{' '}
                              <span className="font-medium">{food.protein}g</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Carbs:</span>{' '}
                              <span className="font-medium">{food.carbs}g</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Fats:</span>{' '}
                              <span className="font-medium">{food.fats}g</span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>

                <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-3 rounded-md border border-primary/20">
                  <p className="text-sm font-semibold mb-2">Total Nutrition</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Calories:</span>{' '}
                      <span className="font-bold text-foreground">{result.total.calories}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Protein:</span>{' '}
                      <span className="font-bold text-foreground">{result.total.protein}g</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Carbs:</span>{' '}
                      <span className="font-bold text-foreground">{result.total.carbs}g</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Fats:</span>{' '}
                      <span className="font-bold text-foreground">{result.total.fats}g</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={addMeal} className="flex-1" variant="default">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Meal
                  </Button>
                  <Button onClick={saveMeal} className="flex-1" variant="outline">
                    Save Meal
                  </Button>
                  <Button
                    onClick={() => {
                      setImagePreview(null);
                      setResult(null);
                    }}
                    className="flex-1"
                    variant="outline"
                  >
                    New Scan
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
