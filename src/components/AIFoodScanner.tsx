import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Upload, Loader2, Edit2, Save, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface FoodItem {
  name: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
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

      setResult(data);
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
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="w-full"
              variant="default"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Food Photo
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
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              type="number"
                              value={editedFood?.calories || 0}
                              onChange={(e) => setEditedFood({ ...editedFood!, calories: parseFloat(e.target.value) })}
                              placeholder="Calories"
                              className="bg-background"
                            />
                            <Input
                              type="number"
                              value={editedFood?.protein || 0}
                              onChange={(e) => setEditedFood({ ...editedFood!, protein: parseFloat(e.target.value) })}
                              placeholder="Protein (g)"
                              className="bg-background"
                            />
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
                  <Button onClick={saveMeal} className="flex-1" variant="default">
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
