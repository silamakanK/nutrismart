import type { Metadata } from "next";
import { MainNav } from "@/components/MainNav";

const searchResults = [
  {
    title: "Soupe thaï coco",
    description: "Parfumée, riche en énergie douce.",
    calories: 420,
    time: "20 min",
    tags: ["Sans lactose", "Entrée"],
  },
  {
    title: "Bowl protéiné tempeh",
    description: "Parfait après sport.",
    calories: 560,
    time: "25 min",
    tags: ["Vegan", "Gain énergie"],
  },
  {
    title: "Granola chocolat noisette",
    description: "Petit-déjeuner croustillant.",
    calories: 350,
    time: "15 min",
    tags: ["Batch cooking", "Snack"],
  },
];

export const metadata: Metadata = {
  title: "Rechercher une recette | NutriSmart",
};

export default function SearchPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#fdf8f3] text-slate-900">
      <MainNav />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-16 pt-8 lg:px-8">
        <section className="rounded-[32px] border border-brand-soft bg-white p-6 shadow-[0_30px_120px_rgba(96,153,62,0.2)] sm:p-10">
          <header className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-brand">
              Recherche intelligente
            </p>
            <h1 className="text-3xl font-semibold sm:text-4xl">Trouver la recette idéale</h1>
            <p className="text-sm text-slate-500">
              Filtrez par ingrédients disponibles, type de plat ou objectif nutritionnel. NutriSmart croise
              automatiquement vos intolérances.
            </p>
          </header>

          <form className="mt-8 grid gap-4 rounded-3xl border border-brand-soft bg-brand-soft p-5 sm:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">
              Nom de recette
              <input
                type="text"
                placeholder="Ex: curry, tarte, poke bowl"
                className="mt-2 w-full rounded-2xl border border-brand-soft bg-white px-4 py-3 text-sm text-slate-900 focus:border-brand focus:outline-none"
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Ingrédient à inclure
              <input
                type="text"
                placeholder="Patate douce, pois chiche..."
                className="mt-2 w-full rounded-2xl border border-brand-soft bg-white px-4 py-3 text-sm text-slate-900 focus:border-brand focus:outline-none"
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Type de plat
              <select className="mt-2 w-full rounded-2xl border border-brand-soft bg-white px-4 py-3 text-sm text-slate-900 focus:border-brand focus:outline-none">
                <option value="">Peu importe</option>
                <option value="entree">Entrée</option>
                <option value="plat">Plat principal</option>
                <option value="dessert">Dessert</option>
                <option value="snack">Snack</option>
              </select>
            </label>
            <label className="text-sm font-medium text-slate-700">
              Objectif nutritionnel
              <select className="mt-2 w-full rounded-2xl border border-brand-soft bg-white px-4 py-3 text-sm text-slate-900 focus:border-brand focus:outline-none">
                <option value="">Tous</option>
                <option value="mass">Prise de masse</option>
                <option value="loss">Perte de poids</option>
                <option value="energy">Gain d&apos;énergie</option>
              </select>
            </label>
            <label className="text-sm font-medium text-slate-700 sm:col-span-2">
              Ingrédients exclus
              <textarea
                rows={2}
                placeholder="Noter les aliments à éviter"
                className="mt-2 w-full rounded-2xl border border-brand-soft bg-white px-4 py-3 text-sm text-slate-900 focus:border-brand focus:outline-none"
              />
            </label>
            <button
              type="submit"
              className="sm:col-span-2 rounded-2xl bg-brand px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-brand-strong"
            >
              Lancer la recherche intelligente
            </button>
          </form>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {searchResults.map((result) => (
              <article key={result.title} className="rounded-3xl border border-brand-soft bg-white p-5 shadow-lg">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-900">{result.title}</h2>
                  <span className="text-xs text-slate-400">{result.time}</span>
                </div>
                <p className="text-sm text-slate-500">{result.description}</p>
                <p className="mt-3 text-sm font-semibold text-brand">{result.calories} kcal</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {result.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand">
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
