import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { MainNav } from "@/components/MainNav";
import supabase, { getUser } from "@/supabase/client";
import { RecipeDetail } from "@/types/recipes";
import { parseStringList } from "@/utils/recipes";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80";

type RecipeDetailProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: RecipeDetailProps): Promise<Metadata> {
  const { slug } = await params;
  const slugOrId = decodeRouteParam(slug);
  const recipe = await fetchRecipePreview(slugOrId);
  return {
    title: recipe ? `${recipe.title} | NutriSmart` : "Recette | NutriSmart",
    description: recipe?.description ?? "Détails de la recette NutriSmart",
  };
}

export default async function RecipeDetailPage({ params }: RecipeDetailProps) {
  const { slug } = await params;
  const slugOrId = decodeRouteParam(slug);
  const user = await getUser();
  if (!user) {
    redirect(`/connexion?redirectTo=/recettes/${encodeURIComponent(slugOrId)}`);
  }

  const recipe = await fetchRecipe(slugOrId, user.id);
  if (!recipe) {
    notFound();
  }

  const stats = [
    { icon: "⏱️", label: "Préparation", value: recipe.duration_minutes ? `${recipe.duration_minutes} min` : "Libre" },
    { icon: "🧑‍🍳", label: "Difficulté", value: recipe.difficulty ?? "Facile" },
    { icon: "🔥", label: "Énergie", value: formatValue(recipe.calories, "kcal") },
  ];
  const macros = [
    { label: "Protéines", value: formatValue(recipe.protein, "g") },
    { label: "Glucides", value: formatValue(recipe.carbs, "g") },
    { label: "Lipides", value: formatValue(recipe.fat, "g") },
  ];
  const ingredients = recipe.ingredients ?? [];
  const steps = recipe.steps ?? [];
  const nutrients = recipe.nutrients ?? [];

  return (
    <div className="flex min-h-screen flex-col bg-[#f6f7f2] text-slate-900">
      <MainNav />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 pb-12 pt-8 lg:px-6">
        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand">Détails Recette</p>
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <Link href="/recettes" className="font-semibold text-slate-700 transition hover:text-brand">
              Recettes
            </Link>
            <span>›</span>
            <span className="text-slate-900">{recipe.title}</span>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(320px,1fr)]">
          <div className="space-y-6">
            <article className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.35em] text-brand">{recipe.category ?? "Recette personnalisée"}</p>
                  <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">{recipe.title}</h1>
                  <p className="text-sm text-slate-500">Par NutriSmart · Ajouté le {formatFullDate(recipe.created_at)}</p>
                  <p className="text-sm text-slate-600">{recipe.description}</p>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300"
                >
                  <span aria-hidden>♡</span> Ajouter aux favoris
                </button>
              </div>
              <div className="mt-6 relative h-72 w-full overflow-hidden rounded-3xl">
                <Image
                  src={recipe.cover_image || FALLBACK_IMAGE}
                  alt={recipe.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 640px"
                  className="object-cover"
                />
                <div className="pointer-events-none absolute bottom-4 left-4 flex flex-wrap gap-3">
                  {stats.map((stat) => (
                    <StatPill key={stat.label} icon={stat.icon} label={stat.label} value={stat.value} />
                  ))}
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2 text-xs text-slate-500">
                {recipe.tags.map((tag) => (
                  <TagPill key={tag}>{tag}</TagPill>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap gap-3 text-xs text-slate-500">
                <Chip title="Portions" value={recipe.servings ? `${recipe.servings} pers.` : "2 pers."} />
                <Chip title="Créée le" value={formatFullDate(recipe.created_at)} />
              </div>
              <div className="mt-6 flex flex-wrap gap-3 text-sm font-medium text-brand">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-2.5 text-white transition hover:bg-brand-strong"
                >
                  Commencer à cuisiner
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-6 py-2.5 text-slate-700 transition hover:border-slate-300"
                >
                  Planifier
                </button>
              </div>
            </article>

            <section className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-brand">Ingrédients</p>
                  <h2 className="mt-1 text-2xl font-semibold text-slate-900">Ce dont vous aurez besoin</h2>
                </div>
                <div className="flex flex-wrap gap-2 text-sm text-slate-600">
                  <button type="button" className="rounded-full border border-slate-200 px-4 py-2">
                    {recipe.servings ? `${recipe.servings} pers.` : "2 pers."}
                  </button>
                  <button type="button" className="rounded-full border border-slate-200 px-4 py-2">
                    Doubler les portions
                  </button>
                </div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {ingredients.length > 0 ? (
                  ingredients.map((ingredient) => <IngredientItem key={ingredient} label={ingredient} />)
                ) : (
                  <p className="text-sm text-slate-500">Cette recette n&apos;a pas encore d&apos;ingrédients détaillés.</p>
                )}
              </div>
            </section>

            <section className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-brand">Instructions</p>
                  <h2 className="mt-1 text-2xl font-semibold text-slate-900">Étapes pas à pas</h2>
                </div>
                <span className="text-sm text-slate-500">{steps.length} étape(s)</span>
              </div>
              <ol className="mt-6 space-y-4">
                {steps.length > 0 ? (
                  steps.map((step, index) => <InstructionStep key={`${step}-${index}`} index={index + 1} content={step} />)
                ) : (
                  <p className="text-sm text-slate-500">Ajoutez vos instructions pour guider la préparation.</p>
                )}
              </ol>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-sm">
              <p className="text-xs uppercase tracking-[0.35em] text-brand">Analyse nutritionnelle</p>
              <div className="mt-6 flex flex-col items-center gap-6">
                <NutritionGauge calories={recipe.calories} servings={recipe.servings} />
                <div className="grid w-full gap-3 text-sm text-slate-600">
                  {macros.map((macro) => (
                    <MacroCard key={macro.label} label={macro.label} value={macro.value} />
                  ))}
                </div>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {nutrients.map((nutrient) => (
                  <NutrientInfo key={nutrient.label} label={nutrient.label} value={nutrient.value} info={nutrient.info} />
                ))}
              </div>
            </section>

            <section className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Planification rapide</h2>
              <p className="mt-1 text-sm text-slate-500">
                Ajoutez cette recette à votre organisation hebdo ou envoyez-la à votre coéquipier de cuisine.
              </p>
              <div className="mt-4 space-y-3">
                <button className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300">
                  Ajouter à la liste de courses
                </button>
                <button className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300">
                  Partager avec un proche
                </button>
              </div>
            </section>

            <section className="rounded-[32px] border border-brand-soft bg-brand-soft p-6 text-sm text-brand-strong">
              <p className="font-semibold text-brand-strong">Note IA</p>
              <p className="mt-2">
                Recette validée par NutriSmart pour votre objectif « {recipe.category ?? "forme"} » et vos intolérances.
              </p>
              <p className="mt-3 text-xs text-brand-strong">
                Les allergènes exclus sont automatiquement filtrés à partir de votre profil.
              </p>
            </section>
          </aside>
        </section>
      </main>
    </div>
  );
}

async function fetchRecipe(slugOrId: string, userId: string): Promise<RecipeDetail | null> {
  const recipe = await fetchRecipeByColumn("slug", slugOrId, userId);
  if (recipe) {
    return recipe;
  }
  return fetchRecipeByColumn("id", slugOrId, userId);
}

async function fetchRecipePreview(slugOrId: string) {
  const client = await supabase();
  const { data } = await client
    .from("recipes")
    .select("title, description, slug, id")
    .or(`slug.eq.${slugOrId},id.eq.${slugOrId}`)
    .limit(1)
    .maybeSingle();
  return data ?? null;
}

async function fetchRecipeByColumn(column: "id" | "slug", value: string, userId: string): Promise<RecipeDetail | null> {
  const client = await supabase();
  // First try to fetch the recipe owned by the current user
  const baseSelect =
    "id, slug, title, description, cover_image, category, tags, created_at, duration_minutes, difficulty, calories, protein, carbs, fat, servings, ingredients, steps, nutrients, user_id";

  const { data, error } = await client.from("recipes").select(baseSelect).eq(column, value).eq("user_id", userId).maybeSingle();

  if (error) {
    console.error(error);
  }

  if (data) {
    return {
      ...data,
      tags: Array.isArray(data.tags) ? data.tags : [],
      ingredients: parseStringList(data.ingredients),
      steps: parseStringList(data.steps),
      nutrients: (data.nutrients as RecipeDetail["nutrients"]) ?? [],
    } as RecipeDetail;
  }

  // Fallback: try to fetch the recipe without user filter (in case of mismatch between stored user_id and session)
  const { data: publicData } = await client.from("recipes").select(baseSelect).eq(column, value).maybeSingle();
  if (!publicData) return null;

  return {
    ...publicData,
    tags: Array.isArray(publicData.tags) ? publicData.tags : [],
    ingredients: parseStringList(publicData.ingredients),
    steps: parseStringList(publicData.steps),
    nutrients: (publicData.nutrients as RecipeDetail["nutrients"]) ?? [],
  } as RecipeDetail;
}

type ChipProps = {
  title: string;
  value: string;
};

function Chip({ title, value }: ChipProps) {
  return (
    <div className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
      <span className="font-semibold text-slate-900">{value}</span> · {title}
    </div>
  );
}

type StatPillProps = {
  icon: string;
  label: string;
  value: string;
};

function StatPill({ icon, label, value }: StatPillProps) {
  return (
    <div className="flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-[0.7rem] font-medium text-slate-600 shadow-sm">
      <span aria-hidden className="text-base">
        {icon}
      </span>
      <span className="text-slate-900">{value}</span>
      <span className="text-slate-400">{label}</span>
    </div>
  );
}

function TagPill({ children }: { children: ReactNode }) {
  return <span className="rounded-full bg-slate-100 px-3 py-1 font-medium">{children}</span>;
}

function IngredientItem({ label }: { label: string }) {
  return (
    <label className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-700 shadow-sm">
      <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand" />
      <span>{label}</span>
    </label>
  );
}

function InstructionStep({ index, content }: { index: number; content: string }) {
  return (
    <li className="flex gap-4 rounded-3xl border border-slate-100 bg-slate-50/60 p-4 shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-soft text-sm font-semibold text-brand">
        {String(index).padStart(2, "0")}
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">Étape {index}</p>
        <p className="mt-1 text-sm text-slate-700">{content}</p>
      </div>
    </li>
  );
}

function NutritionGauge({ calories, servings }: { calories: number | null; servings: number | null }) {
  const value = typeof calories === "number" ? calories : 0;
  const percentage = Math.min(100, Math.round((value / 800) * 100));
  const degrees = percentage * 3.6;
  const gradient = `conic-gradient(#609966 0deg ${degrees}deg, #e2e8f0 ${degrees}deg 360deg)`;

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-40 w-40 rounded-full" style={{ background: gradient }}>
        <div className="absolute inset-3 flex flex-col items-center justify-center rounded-full bg-white text-center">
          <p className="text-4xl font-semibold text-slate-900">{value}</p>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Calories</p>
        </div>
      </div>
      <p className="mt-3 text-xs text-slate-500">Estimé pour {servings ? `${servings} pers.` : "2 pers."}</p>
    </div>
  );
}

function MacroCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
      <p className="text-[0.65rem] uppercase tracking-[0.35em] text-slate-400">{label}</p>
      <p className="mt-2 text-lg font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function NutrientInfo({ label, value, info }: { label: string; value: string; info?: string }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600">
      <p className="text-sm font-semibold text-slate-900">{label}</p>
      <p className="text-xs text-slate-500">{value}</p>
      {info && <p className="text-xs text-slate-400">{info}</p>}
    </div>
  );
}

function formatValue(value: number | null, unit: string) {
  if (typeof value !== "number") {
    return `0 ${unit}`;
  }
  return `${value} ${unit}`;
}

function formatFullDate(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return dateString;
  }
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
}

function decodeRouteParam(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
