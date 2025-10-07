import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Flame } from "lucide-react";

interface RecipeCardProps {
  title: string;
  image: string;
  calories: number;
  protein: number;
  cookTime: string;
  tags: string[];
}

export const RecipeCard = ({ title, image, calories, protein, cookTime, tags }: RecipeCardProps) => {
  return (
    <Card className="overflow-hidden bg-card hover:shadow-[var(--shadow-card)] transition-all duration-300 group cursor-pointer">
      <div className="relative overflow-hidden h-48">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
      </div>
      <CardHeader>
        <CardTitle className="text-lg text-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Flame className="h-4 w-4 text-accent" />
            <span>{calories} cal</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-semibold text-primary">{protein}g</span>
            <span>protein</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-primary" />
            <span>{cookTime}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="bg-secondary text-secondary-foreground">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
