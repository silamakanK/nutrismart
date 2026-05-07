import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MainNav } from "@/components/MainNav";
import RecettesContent from "./content";
import supabase, { getUser } from "@/supabase/client";
import { RecipeSummary } from "@/types/recipes";

export const metadata: Metadata = {
  title: "Mes Recettes | NutriSmart",
  description: "Toutes vos recettes personnalisées classées du plus récent au plus ancien.",
};

export default async function RecettesPage() {
  const user = await getUser();
  if (!user) {
    redirect("/connexion?redirectTo=/recettes");
  }

  const client = await supabase();
  const { data, error } = await client
    .from("recipes")
    .select(
      "id, slug, title, description, cover_image, category, tags, created_at, duration_minutes, difficulty, calories, protein, carbs, fat, servings"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
  }

  const recipes: RecipeSummary[] =
    data?.map((recipe) => ({
      id: recipe.id,
      slug: recipe.slug ?? recipe.id,
      title: recipe.title ?? "Recette sans titre",
      description: recipe.description ?? "",
      cover_image: recipe.cover_image ?? null,
      category: recipe.category ?? "",
      tags: Array.isArray(recipe.tags) ? recipe.tags : [],
      created_at: recipe.created_at,
      duration_minutes: recipe.duration_minutes ?? null,
      difficulty: recipe.difficulty ?? null,
      calories: recipe.calories ?? null,
      protein: recipe.protein ?? null,
      carbs: recipe.carbs ?? null,
      fat: recipe.fat ?? null,
      servings: recipe.servings ?? null,
    })) ?? [];

  return (
    <div className="flex min-h-screen flex-col bg-[#f6f7f2] text-slate-900">
      <MainNav />
      <RecettesContent recipes={recipes} />
    </div>
  );
}
