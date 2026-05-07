"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { RecipeSummary } from "@/types/recipes";

type RecettesContentProps = {
  recipes: RecipeSummary[];
};

type SortOrder = "desc" | "asc";

const categories = [
  { key: "all", label: "Tout voir" },
  { key: "Vegetarian", label: "Végétarien" },
  { key: "Meat", label: "Plats" },
  { key: "Fish", label: "Poisson" },
  { key: "Dessert", label: "Desserts" },
];

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80";

export default function RecettesContent({ recipes }: RecettesContentProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const filteredRecipes = useMemo(() => {
    const search = query.trim().toLowerCase();
    return recipes
      .filter((recipe) => {
        const matchesQuery =
          !search ||
          recipe.title.toLowerCase().includes(search) ||
          (recipe.description ?? "").toLowerCase().includes(search) ||
          recipe.tags.some((tag) => tag.toLowerCase().includes(search));
        const matchesCategory = category === "all" || recipe.category === category;
        return matchesQuery && matchesCategory;
      })
      .sort((a, b) => {
        const diff = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        return sortOrder === "desc" ? diff : -diff;
      });
  }, [recipes, query, category, sortOrder]);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 pb-12 pt-8 lg:px-6">
      <header className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-brand">Mes recettes</p>
            <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">Vos plats favoris & générés</h1>
            <p className="text-sm text-slate-500">
              Consultez vos recettes triées du plus récent au plus ancien, relancez une génération IA ou planifiez vos repas.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/recettes?mode=manual"
              className="inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
            >
              + Manuel
            </Link>
            <Link
              href="/generation"
              className="inline-flex items-center justify-center rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-strong"
            >
              Générer IA
            </Link>
          </div>
        </div>
        <div className="flex flex-col gap-3 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-3">
            <div className="hidden h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 sm:flex">🔍</div>
            <input
              type="text"
              placeholder="Rechercher une recette, un ingrédient..."
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 focus:border-brand focus:outline-none"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <label className="text-sm font-medium text-slate-600">
            Trier
            <select
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value as SortOrder)}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-brand focus:outline-none"
            >
              <option value="desc">Plus récentes</option>
              <option value="asc">Plus anciennes</option>
            </select>
          </label>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.key}
              type="button"
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${category === cat.key ? "bg-brand text-white" : "bg-white text-slate-600 shadow-sm"
                }`}
              onClick={() => setCategory(cat.key)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </header>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredRecipes.map((recipe) => (
          <article
            key={recipe.id}
            className="flex h-full flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="relative h-48 w-full">
              <Image
                src={recipe.cover_image || FALLBACK_IMAGE}
                alt={recipe.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 400px"
                className="object-cover"
              />
              <div className="absolute left-4 top-4 inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700">
                {recipe.duration_minutes ? `${recipe.duration_minutes} min` : ""}
                {recipe.difficulty ? ` · ${recipe.difficulty}` : ""}
              </div>
            </div>
            <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
              <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                {recipe.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 font-medium">
                    {tag}
                  </span>
                ))}
              </div>
              <h2 className="mt-3 text-xl font-semibold text-slate-900">{recipe.title}</h2>
              <p className="mt-1 text-sm text-slate-500">{recipe.description}</p>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs text-slate-500">
                <Macro label="Calories" value={formatValue(recipe.calories, "kcal")} />
                <Macro label="Protéines" value={formatValue(recipe.protein, "g")} />
                <Macro label="Glucides" value={formatValue(recipe.carbs, "g")} />
              </div>
              <div className="mt-4 flex flex-1 items-end justify-between text-xs text-slate-400">
                <p>{new Date(recipe.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}</p>
                <Link
                  href={`/recettes/${encodeURIComponent(recipe.slug ?? recipe.id)}`}
                  className="rounded-full bg-brand-soft px-4 py-2 text-sm font-semibold text-brand transition hover:bg-brand"
                >
                  Voir la recette
                </Link>
              </div>
            </div>
          </article>
        ))}
        <Link
          href="/generation"
          className="flex min-h-[320px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-white text-center text-slate-500 transition hover:border-brand hover:text-brand"
        >
          <span className="text-4xl">+</span>
          <p className="mt-2 text-base font-semibold">Nouvelle recette</p>
          <p className="text-sm">Créez ou importez vos idées</p>
        </Link>
      </section>

      {filteredRecipes.length === 0 && (
        <p className="rounded-3xl border border-slate-100 bg-white px-5 py-4 text-sm text-slate-500">
          Aucune recette ne correspond à votre recherche pour le moment.
        </p>
      )}
    </main>
  );
}

type MacroProps = {
  label: string;
  value: string;
};

function Macro({ label, value }: MacroProps) {
  return (
    <div className="rounded-2xl bg-slate-50 px-3 py-3">
      <p className="text-[0.65rem] uppercase tracking-[0.35em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function formatValue(value: number | null, unit: string) {
  if (typeof value !== "number") {
    return `0 ${unit}`;
  }
  return `${value} ${unit}`;
}
