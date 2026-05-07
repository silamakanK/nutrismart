export type Nutrient = {
  label: string;
  value: string;
  info?: string;
};

export type RecipeSummary = {
  id: string;
  slug: string | null;
  title: string;
  description: string | null;
  cover_image: string | null;
  category: string | null;
  tags: string[];
  created_at: string;
  duration_minutes: number | null;
  difficulty: string | null;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  servings: number | null;
};

export type RecipeDetail = RecipeSummary & {
  ingredients: string[] | null;
  steps: string[] | null;
  nutrients: Nutrient[] | null;
};

export type RecipeWithIngredients = RecipeSummary & {
  ingredients: string[] | null;
};
