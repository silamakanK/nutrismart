"use client";

import { FormEvent, KeyboardEvent, useState, useTransition } from "react";
import { generateAiRecipe } from "@/actions/recipe";
import { RecipeDetail } from "@/types/recipes";
import Link from "next/link";

type GeneratedRecipe = RecipeDetail | null;

const mealTypes = [
  { value: "dejeuner", label: "Déjeuner" },
  { value: "diner", label: "Dîner" },
  { value: "snack", label: "Snack" },
];

const dietTags = ["Végétarien", "Sans gluten", "Low carb", "Rapide"];

export default function GenerationContent() {
  const [people, setPeople] = useState(2);
  const [mealType, setMealType] = useState("diner");
  const [recipeName, setRecipeName] = useState("Risotto aux champignons");
  const [ingredients, setIngredients] = useState<string[]>(["Tomates", "Basilic frais", "Poulet"]);
  const [ingredientInput, setIngredientInput] = useState("");
  const [selectedDiet, setSelectedDiet] = useState<string[]>(["Végétarien"]);
  const [calories, setCalories] = useState(600);
  const [protein, setProtein] = useState(20);
  const [result, setResult] = useState<GeneratedRecipe>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const normalizedSteps = normalizeEntries(result?.steps ?? null, /\r?\n/);
  const normalizedIngredients = normalizeEntries(result?.ingredients ?? null, /[,\n]/);

  const handleIngredientKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addIngredient();
    }
  };

  const addIngredient = () => {
    const trimmed = ingredientInput.trim();
    if (!trimmed || ingredients.includes(trimmed)) {
      return;
    }
    setIngredients((prev) => [...prev, trimmed]);
    setIngredientInput("");
  };

  const removeIngredient = (item: string) => {
    setIngredients((prev) => prev.filter((entry) => entry !== item));
  };

  const toggleDiet = (diet: string) => {
    setSelectedDiet((prev) => (prev.includes(diet) ? prev.filter((item) => item !== diet) : [...prev, diet]));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("Génération en cours...");
    startTransition(async () => {
      const response = await generateAiRecipe({
        name: recipeName,
        people,
        mealType,
        ingredients,
        dietTags: selectedDiet,
        calories,
        protein,
      });
      if (!response.success) {
        setMessage(response.message);
        return;
      }
      setResult(response.recipe);
      setMessage("Recette générée et sauvegardée !");
    });
  };

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 pb-12 pt-8 lg:px-6">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-brand">Création IA</p>
        <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">Configurez votre prochaine recette</h1>
        <p className="text-sm text-slate-500">
          Décrivez vos envies, NutriSmart ajuste automatiquement portions et macros selon votre profil.
        </p>
      </header>

      <form className="grid flex-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]" onSubmit={handleSubmit}>
        <div className="space-y-6">
          <section className="space-y-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <span className="text-lg">📝</span> Les bases
            </div>
            <label className="text-sm font-medium text-slate-600">
              Nom de la recette
              <input
                type="text"
                value={recipeName}
                onChange={(event) => setRecipeName(event.target.value)}
                placeholder="ex: Risotto aux champignons"
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:border-brand focus:outline-none"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-slate-600">Nombre de convives</p>
                <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
                  <button
                    type="button"
                    onClick={() => setPeople((prev) => Math.max(1, prev - 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200"
                  >
                    –
                  </button>
                  <span className="text-lg font-semibold text-slate-900">{people}</span>
                  <button
                    type="button"
                    onClick={() => setPeople((prev) => Math.min(8, prev + 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200"
                  >
                    +
                  </button>
                </div>
              </div>
              <label className="text-sm font-medium text-slate-600">
                Type de repas
                <select
                  value={mealType}
                  onChange={(event) => setMealType(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:border-brand focus:outline-none"
                >
                  {mealTypes.map((meal) => (
                    <option key={meal.value} value={meal.value}>
                      {meal.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          <section className="space-y-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <span className="text-lg">🥕</span> Ingrédients
            </div>
            <div className="flex flex-wrap gap-2">
              {ingredients.map((ingredient) => (
                <span key={ingredient} className="inline-flex items-center gap-2 rounded-full bg-brand-soft px-4 py-2 text-sm font-semibold text-brand">
                  {ingredient}
                  <button type="button" onClick={() => removeIngredient(ingredient)}>
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={ingredientInput}
                onChange={(event) => setIngredientInput(event.target.value)}
                onKeyDown={handleIngredientKey}
                placeholder="Ajoutez un ingrédient"
                className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:border-brand focus:outline-none"
              />
              <button
                type="button"
                onClick={addIngredient}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"
              >
                Ajouter
              </button>
            </div>
            <p className="text-xs text-slate-400">Appuyez sur Entrée pour valider un ingrédient.</p>
          </section>
        </div>

        <div className="space-y-6">
          <section className="space-y-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <span className="text-lg">⚙️</span> Préférences
            </div>
            <div className="flex flex-wrap gap-2">
              {dietTags.map((diet) => (
                <button
                  key={diet}
                  type="button"
                  onClick={() => toggleDiet(diet)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    selectedDiet.includes(diet) ? "bg-brand-soft text-brand" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {diet}
                </button>
              ))}
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Calories max ({calories} kcal)</label>
              <input
                type="range"
                min={350}
                max={900}
                step={10}
                value={calories}
                onChange={(event) => setCalories(Number(event.target.value))}
                className="mt-2 w-full"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Protéines min ({protein} g)</label>
              <input
                type="range"
                min={10}
                max={60}
                step={2}
                value={protein}
                onChange={(event) => setProtein(Number(event.target.value))}
                className="mt-2 w-full"
              />
            </div>
          </section>

          <section className="space-y-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Recette proposée</h2>
              <span className="text-xs text-slate-400">IA en direct</span>
            </div>
            {message && <p className="text-sm text-slate-500">{message}</p>}
            {result ? (
              <>
                <p className="text-base font-semibold text-slate-900">{result.title}</p>
                <p className="text-sm text-slate-500">{result.description}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Macro label="Calories" value={formatValue(result.calories, "kcal")} />
                  <Macro label="Protéines" value={formatValue(result.protein, "g")} />
                  <Macro label="Glucides" value={formatValue(result.carbs, "g")} />
                  <Macro label="Lipides" value={formatValue(result.fat, "g")} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Étapes</p>
                  <ol className="mt-3 space-y-2 text-sm text-slate-600">
                    {normalizedSteps.map((step, index) => (
                      <li key={`${step}-${index}`} className="rounded-2xl bg-slate-50 p-3">
                        <span className="font-semibold text-slate-900">{index + 1}.</span> {step}
                      </li>
                    ))}
                  </ol>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Liste de courses</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-600">
                    {normalizedIngredients.map((item) => (
                      <span key={item} className="rounded-full border border-slate-200 px-3 py-1">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
                <Link
                  href={`/recettes/${result.slug ?? result.id}`}
                  className="block text-center text-sm font-semibold text-brand underline underline-offset-2"
                >
                  Ouvrir la recette sauvegardée
                </Link>
              </>
            ) : (
              <p className="text-sm text-slate-500">Configurez vos paramètres puis lancez la génération IA.</p>
            )}
            <button
              type="submit"
              className="w-full rounded-2xl bg-brand px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-brand-strong disabled:opacity-60"
              disabled={isPending}
            >
              {isPending ? "Génération en cours..." : "Générer la recette"}
            </button>
          </section>
        </div>
      </form>
    </main>
  );
}

type MacroProps = {
  label: string;
  value: string;
};

function Macro({ label, value }: MacroProps) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm">
      <p className="text-xs uppercase tracking-[0.35em] text-slate-400">{label}</p>
      <p className="mt-2 text-base font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function formatValue(value: number | null, unit: string) {
  if (typeof value !== "number") {
    return `0 ${unit}`;
  }
  return `${value} ${unit}`;
}

function normalizeEntries(value: unknown, splitPattern: RegExp | string) {
  if (Array.isArray(value)) {
    return value
      .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
      .filter((entry): entry is string => Boolean(entry));
  }
  if (typeof value === "string") {
    return value
      .split(splitPattern)
      .map((entry) => entry.trim())
      .filter(Boolean);
  }
  return [];
}
