export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      daily_goals: {
        Row: {
          created_at: string
          end_date: string | null
          goal_type: Database["public"]["Enums"]["goal_type"]
          id: string
          is_active: boolean | null
          start_date: string
          target_calories: number
          target_carbs: number | null
          target_fats: number | null
          target_fiber: number | null
          target_protein: number | null
          target_steps: number | null
          target_water: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          goal_type?: Database["public"]["Enums"]["goal_type"]
          id?: string
          is_active?: boolean | null
          start_date?: string
          target_calories: number
          target_carbs?: number | null
          target_fats?: number | null
          target_fiber?: number | null
          target_protein?: number | null
          target_steps?: number | null
          target_water?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          end_date?: string | null
          goal_type?: Database["public"]["Enums"]["goal_type"]
          id?: string
          is_active?: boolean | null
          start_date?: string
          target_calories?: number
          target_carbs?: number | null
          target_fats?: number | null
          target_fiber?: number | null
          target_protein?: number | null
          target_steps?: number | null
          target_water?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_summaries: {
        Row: {
          calories_burned: number | null
          created_at: string
          id: string
          summary_date: string
          total_calories: number | null
          total_carbs: number | null
          total_fats: number | null
          total_fiber: number | null
          total_protein: number | null
          total_steps: number | null
          total_water: number | null
          updated_at: string
          user_id: string
          weight: number | null
        }
        Insert: {
          calories_burned?: number | null
          created_at?: string
          id?: string
          summary_date?: string
          total_calories?: number | null
          total_carbs?: number | null
          total_fats?: number | null
          total_fiber?: number | null
          total_protein?: number | null
          total_steps?: number | null
          total_water?: number | null
          updated_at?: string
          user_id: string
          weight?: number | null
        }
        Update: {
          calories_burned?: number | null
          created_at?: string
          id?: string
          summary_date?: string
          total_calories?: number | null
          total_carbs?: number | null
          total_fats?: number | null
          total_fiber?: number | null
          total_protein?: number | null
          total_steps?: number | null
          total_water?: number | null
          updated_at?: string
          user_id?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_summaries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      meals: {
        Row: {
          calories: number
          carbs: number | null
          created_at: string
          fats: number | null
          fiber: number | null
          id: string
          meal_date: string
          meal_name: string
          meal_time: string | null
          meal_type: Database["public"]["Enums"]["meal_type"]
          notes: string | null
          protein: number | null
          recipe_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          calories?: number
          carbs?: number | null
          created_at?: string
          fats?: number | null
          fiber?: number | null
          id?: string
          meal_date?: string
          meal_name: string
          meal_time?: string | null
          meal_type: Database["public"]["Enums"]["meal_type"]
          notes?: string | null
          protein?: number | null
          recipe_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          calories?: number
          carbs?: number | null
          created_at?: string
          fats?: number | null
          fiber?: number | null
          id?: string
          meal_date?: string
          meal_name?: string
          meal_time?: string | null
          meal_type?: Database["public"]["Enums"]["meal_type"]
          notes?: string | null
          protein?: number | null
          recipe_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meals_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          age: number | null
          avatar_url: string | null
          created_at: string
          email: string | null
          fitness_goal: string | null
          full_name: string | null
          gender: string | null
          height: number | null
          id: string
          maintenance_calories: number | null
          onboarding_completed: boolean | null
          updated_at: string
          weight: number | null
        }
        Insert: {
          age?: number | null
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          fitness_goal?: string | null
          full_name?: string | null
          gender?: string | null
          height?: number | null
          id: string
          maintenance_calories?: number | null
          onboarding_completed?: boolean | null
          updated_at?: string
          weight?: number | null
        }
        Update: {
          age?: number | null
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          fitness_goal?: string | null
          full_name?: string | null
          gender?: string | null
          height?: number | null
          id?: string
          maintenance_calories?: number | null
          onboarding_completed?: boolean | null
          updated_at?: string
          weight?: number | null
        }
        Relationships: []
      }
      recipes: {
        Row: {
          calories_per_serving: number | null
          carbs_per_serving: number | null
          cook_time: number | null
          created_at: string
          description: string | null
          fats_per_serving: number | null
          id: string
          image_url: string | null
          ingredients: Json
          instructions: string | null
          is_public: boolean | null
          prep_time: number | null
          protein_per_serving: number | null
          servings: number | null
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          calories_per_serving?: number | null
          carbs_per_serving?: number | null
          cook_time?: number | null
          created_at?: string
          description?: string | null
          fats_per_serving?: number | null
          id?: string
          image_url?: string | null
          ingredients?: Json
          instructions?: string | null
          is_public?: boolean | null
          prep_time?: number | null
          protein_per_serving?: number | null
          servings?: number | null
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          calories_per_serving?: number | null
          carbs_per_serving?: number | null
          cook_time?: number | null
          created_at?: string
          description?: string | null
          fats_per_serving?: number | null
          id?: string
          image_url?: string | null
          ingredients?: Json
          instructions?: string | null
          is_public?: boolean | null
          prep_time?: number | null
          protein_per_serving?: number | null
          servings?: number | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activities: {
        Row: {
          activity_date: string
          activity_name: string
          activity_type: Database["public"]["Enums"]["activity_type"]
          calories_burned: number | null
          created_at: string
          distance: number | null
          duration: number
          id: string
          notes: string | null
          steps: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          activity_date?: string
          activity_name: string
          activity_type: Database["public"]["Enums"]["activity_type"]
          calories_burned?: number | null
          created_at?: string
          distance?: number | null
          duration: number
          id?: string
          notes?: string | null
          steps?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          activity_date?: string
          activity_name?: string
          activity_type?: Database["public"]["Enums"]["activity_type"]
          calories_burned?: number | null
          created_at?: string
          distance?: number | null
          duration?: number
          id?: string
          notes?: string | null
          steps?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      activity_type:
        | "walking"
        | "running"
        | "cycling"
        | "swimming"
        | "gym"
        | "yoga"
        | "other"
      goal_type:
        | "weight_loss"
        | "weight_gain"
        | "muscle_gain"
        | "maintenance"
        | "health"
      meal_type: "breakfast" | "lunch" | "dinner" | "snack"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      activity_type: [
        "walking",
        "running",
        "cycling",
        "swimming",
        "gym",
        "yoga",
        "other",
      ],
      goal_type: [
        "weight_loss",
        "weight_gain",
        "muscle_gain",
        "maintenance",
        "health",
      ],
      meal_type: ["breakfast", "lunch", "dinner", "snack"],
    },
  },
} as const
