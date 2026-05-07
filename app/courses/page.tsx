import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MainNav } from "@/components/MainNav";
import supabase, { getUser } from "@/supabase/client";
import { RecipeWithIngredients } from "@/types/recipes";
import { parseStringList } from "@/utils/recipes";
import CoursesContent from "./content";

export const metadata: Metadata = {
  title: "Liste de courses | NutriSmart",
  description: "Sélectionnez vos recettes pour générer automatiquement votre liste de courses.",
};

export default async function CoursesPage() {
  const user = await getUser();
  if (!user) {
    redirect("/connexion?redirectTo=/courses");
  }
  const displayName =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    user.email ??
    null;

  const client = await supabase();
  const { data, error } = await client
    .from("recipes")
    .select(
      "id, slug, title, description, cover_image, category, tags, created_at, duration_minutes, difficulty, calories, protein, carbs, fat, servings, ingredients"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
  }

  const recipes: RecipeWithIngredients[] =
    data?.map((recipe) => ({
      id: recipe.id,
      slug: recipe.slug ?? recipe.id,
      title: recipe.title ?? "Recette sans titre",
      description: recipe.description ?? "",
      cover_image: recipe.cover_image ?? null,
      category: recipe.category ?? "Autre",
      tags: Array.isArray(recipe.tags) ? recipe.tags : [],
      created_at: recipe.created_at,
      duration_minutes: recipe.duration_minutes ?? null,
      difficulty: recipe.difficulty ?? null,
      calories: recipe.calories ?? null,
      protein: recipe.protein ?? null,
      carbs: recipe.carbs ?? null,
      fat: recipe.fat ?? null,
      servings: recipe.servings ?? null,
      ingredients: parseStringList(recipe.ingredients),
    })) ?? [];

  return (
    <div className="flex min-h-screen flex-col bg-[#f6f7f2] text-slate-900">
      <MainNav />
      <CoursesContent recipes={recipes} userName={displayName} />
    </div>
  );
}
