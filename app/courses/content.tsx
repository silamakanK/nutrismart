"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { RecipeWithIngredients } from "@/types/recipes";

type CoursesContentProps = {
  recipes: RecipeWithIngredients[];
  userName: string | null;
};

type AggregatedItem = {
  label: string;
  count: number;
  categoryId: ShoppingCategoryId;
  unitPrice: number;
  priceSource: "catalog" | "macro" | "category";
};

type ShoppingCategoryId = "produce" | "dairy" | "protein" | "grocery";

type ShoppingCategory = {
  id: ShoppingCategoryId;
  label: string;
  color: string;
};

type MacroProfile = {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
};

type IngredientPriceEntry = {
  keywords: string[];
  label: string;
  unit: string;
  price: number;
  category: ShoppingCategoryId;
  nutrition: Partial<MacroProfile>;
};

const STORAGE_KEY = "nutrismart-shopping-list";
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80";

const SHOPPING_CATEGORIES: Record<ShoppingCategoryId, ShoppingCategory> = {
  produce: { id: "produce", label: "Fruits & Légumes", color: "border-lime-200" },
  dairy: { id: "dairy", label: "Frais & Crèmerie", color: "border-amber-200" },
  protein: { id: "protein", label: "Protéines & Poisson", color: "border-orange-200" },
  grocery: { id: "grocery", label: "Épicerie", color: "border-slate-200" },
};

const CATEGORY_KEYWORDS: Record<ShoppingCategoryId, string[]> = {
  produce: ["salade", "tomate", "carotte", "oignon", "citron", "pomme", "poivron", "courgette", "herbe", "persil", "basilic", "ail", "legume", "epinard", "avocat"],
  dairy: ["lait", "creme", "fromage", "beurre", "yaourt", "mozzarella", "parmesan", "chevre", "oeuf"],
  protein: ["poulet", "saumon", "boeuf", "porc", "tofu", "poisson", "crevette", "jambon", "lentille", "pois chiche", "haricot"],
  grocery: ["farine", "pates", "riz", "huile", "epices", "sel", "poivre", "sucre", "quinoa", "noix", "amande", "miel", "poudre"],
};

const FALLBACK_CATEGORY: ShoppingCategoryId = "grocery";

const CATEGORY_BASE_COST: Record<ShoppingCategoryId, number> = {
  produce: 1.1,
  dairy: 2.1,
  protein: 4.2,
  grocery: 0.9,
};

const MACRO_PRICE_INDEX = {
  protein: 0.035, // €/g
  carbs: 0.012,
  fat: 0.03,
  calories: 0.0008, // €/kcal
};

const CATEGORY_MACRO_PRESETS: Record<ShoppingCategoryId, MacroProfile> = {
  produce: { calories: 35, carbs: 7, protein: 1 },
  dairy: { calories: 120, fat: 7, protein: 6 },
  protein: { calories: 165, protein: 25, fat: 7 },
  grocery: { calories: 220, carbs: 45, protein: 8 },
};

const INGREDIENT_DATABASE: IngredientPriceEntry[] = [
  {
    keywords: ["poulet", "blanc de poulet", "filet de poulet"],
    label: "Poulet fermier",
    unit: "500 g",
    price: 6.5,
    category: "protein",
    nutrition: { protein: 31, fat: 3, calories: 165 },
  },
  {
    keywords: ["saumon"],
    label: "Saumon",
    unit: "2 pavés",
    price: 8.2,
    category: "protein",
    nutrition: { protein: 25, fat: 12, calories: 208 },
  },
  {
    keywords: ["tofu"],
    label: "Tofu",
    unit: "400 g",
    price: 3.1,
    category: "protein",
    nutrition: { protein: 12, fat: 8, calories: 145 },
  },
  {
    keywords: ["riz", "riz blanc", "riz basmati"],
    label: "Riz",
    unit: "500 g",
    price: 1.9,
    category: "grocery",
    nutrition: { carbs: 78, calories: 350 },
  },
  {
    keywords: ["pates", "pate", "spaghetti"],
    label: "Pâtes",
    unit: "500 g",
    price: 1.6,
    category: "grocery",
    nutrition: { carbs: 75, protein: 13, calories: 350 },
  },
  {
    keywords: ["quinoa"],
    label: "Quinoa",
    unit: "400 g",
    price: 3.8,
    category: "grocery",
    nutrition: { protein: 14, carbs: 64, fat: 6, calories: 368 },
  },
  {
    keywords: ["tomate", "tomates"],
    label: "Tomates",
    unit: "500 g",
    price: 2.3,
    category: "produce",
    nutrition: { carbs: 4, calories: 18 },
  },
  {
    keywords: ["courgette"],
    label: "Courgettes",
    unit: "500 g",
    price: 1.8,
    category: "produce",
    nutrition: { carbs: 3, calories: 17 },
  },
  {
    keywords: ["poivron", "poivrons"],
    label: "Poivrons rouges",
    unit: "3 pieces",
    price: 2.5,
    category: "produce",
    nutrition: { carbs: 6, calories: 26 },
  },
  {
    keywords: ["oignon", "oignons"],
    label: "Oignons jaunes",
    unit: "1 kg",
    price: 2.1,
    category: "produce",
    nutrition: { carbs: 9, calories: 40 },
  },
  {
    keywords: ["citron"],
    label: "Citron",
    unit: "4 pieces",
    price: 1.6,
    category: "produce",
    nutrition: { carbs: 3, calories: 29 },
  },
  {
    keywords: ["creme", "crème"],
    label: "Crème liquide",
    unit: "20 cl",
    price: 1.2,
    category: "dairy",
    nutrition: { fat: 30, calories: 292 },
  },
  {
    keywords: ["beurre"],
    label: "Beurre doux",
    unit: "250 g",
    price: 2.5,
    category: "dairy",
    nutrition: { fat: 82, calories: 717 },
  },
  {
    keywords: ["fromage", "parmesan"],
    label: "Parmesan",
    unit: "150 g",
    price: 3.9,
    category: "dairy",
    nutrition: { protein: 35, fat: 28, calories: 400 },
  },
  {
    keywords: ["oeuf", "oeufs"],
    label: "Oeufs plein air",
    unit: "6 pieces",
    price: 2.3,
    category: "dairy",
    nutrition: { protein: 6, fat: 5, calories: 70 },
  },
  {
    keywords: ["lait"],
    label: "Lait entier",
    unit: "1 L",
    price: 1.4,
    category: "dairy",
    nutrition: { protein: 3, fat: 3.5, carbs: 5 },
  },
  {
    keywords: ["pois chiche", "pois chiches"],
    label: "Pois chiches",
    unit: "400 g",
    price: 1.7,
    category: "protein",
    nutrition: { protein: 19, carbs: 61, fat: 6, calories: 364 },
  },
  {
    keywords: ["lentille", "lentilles"],
    label: "Lentilles corail",
    unit: "500 g",
    price: 2.1,
    category: "protein",
    nutrition: { protein: 25, carbs: 50, calories: 330 },
  },
];

export default function CoursesContent({ recipes, userName }: CoursesContentProps) {
  const defaultSelection = useMemo(() => recipes.slice(0, 2).map((recipe) => recipe.id), [recipes]);
  const persistedState = useMemo(() => loadShoppingState(recipes, defaultSelection), [recipes, defaultSelection]);

  const [selectedIds, setSelectedIds] = useState<string[]>(
    () => (persistedState.selectedIds.length > 0 ? persistedState.selectedIds : defaultSelection)
  );
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [quantities, setQuantities] = useState<Record<string, number>>(() => persistedState.quantities);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(() => persistedState.checkedItems);
  useEffect(() => {
    persistShoppingState({ selectedIds, quantities, checkedItems });
  }, [selectedIds, quantities, checkedItems]);
  const restoredFromStorage = persistedState.fromStorage;

  const filters = useMemo(() => {
    const uniqueCategories = Array.from(new Set(recipes.map((recipe) => recipe.category).filter(Boolean))) as string[];
    const filterList = [{ key: "all", label: "Tout voir" }];
    uniqueCategories.forEach((category) => {
      filterList.push({ key: category, label: category });
    });
    if (recipes.some((recipe) => recipe.tags.some((tag) => tag.toLowerCase().includes("veg")))) {
      filterList.push({ key: "vegetarian", label: "Végétarien" });
    }
    return filterList;
  }, [recipes]);

  const safeFilter = filters.some((filter) => filter.key === activeFilter) ? activeFilter : "all";

  const filteredRecipes = useMemo(() => {
    const search = query.trim().toLowerCase();
    return recipes.filter((recipe) => {
      const matchesSearch =
        !search ||
        recipe.title.toLowerCase().includes(search) ||
        recipe.description?.toLowerCase().includes(search) ||
        recipe.tags.some((tag) => tag.toLowerCase().includes(search));
      const matchesFilter =
        safeFilter === "all"
          ? true
          : safeFilter === "vegetarian"
            ? recipe.tags.some((tag) => tag.toLowerCase().includes("veg"))
            : (recipe.category ?? "").toLowerCase() === safeFilter.toLowerCase();
      return matchesSearch && matchesFilter;
    });
  }, [recipes, query, safeFilter]);

  const selectedRecipes = useMemo(() => {
    const byId = new Map(recipes.map((recipe) => [recipe.id, recipe]));
    return selectedIds
      .map((id) => byId.get(id))
      .filter((recipe): recipe is RecipeWithIngredients => Boolean(recipe));
  }, [recipes, selectedIds]);

  const aggregatedItems = useMemo(() => aggregateIngredients(selectedRecipes), [selectedRecipes]);

  const groupedItems = useMemo(() => {
    const grouped = new Map<ShoppingCategoryId, ShoppingListItem[]>();
    aggregatedItems.forEach((item) => {
      const categoryId = SHOPPING_CATEGORIES[item.categoryId] ? item.categoryId : FALLBACK_CATEGORY;
      const current = grouped.get(categoryId) ?? [];
      current.push({
        label: item.label,
        quantity: quantities[item.label] ?? item.count,
        checked: checkedItems[item.label] ?? false,
        price: item.unitPrice,
      });
      grouped.set(categoryId, current);
    });
    return Object.values(SHOPPING_CATEGORIES)
      .map((category) => ({
        category,
        items: (grouped.get(category.id) ?? []).sort((a, b) => a.label.localeCompare(b.label)),
      }))
      .filter((group) => group.items.length > 0);
  }, [aggregatedItems, quantities, checkedItems]);

  const totalItems = groupedItems.reduce((sum, group) => sum + group.items.reduce((acc, item) => acc + item.quantity, 0), 0);
  const shoppingCost = groupedItems.reduce(
    (sum, group) => sum + group.items.reduce((acc, item) => acc + item.price * item.quantity, 0),
    0
  );
  const macroCost = selectedRecipes.reduce((sum, recipe) => sum + estimateMacroCost(recipe), 0);
  const estimatedCost = blendCosts(shoppingCost, macroCost);

  const handleToggleRecipe = (id: string) => {
    setSelectedIds((previous) => (previous.includes(id) ? previous.filter((value) => value !== id) : [...previous, id]));
  };

  const handleQuantityChange = (label: string, delta: number) => {
    setQuantities((previous) => {
      const current = previous[label] ?? aggregatedItems.find((item) => item.label === label)?.count ?? 1;
      const nextValue = Math.max(1, current + delta);
      return { ...previous, [label]: nextValue };
    });
  };

  const handleToggleItem = (label: string, checked: boolean) => {
    setCheckedItems((previous) => ({ ...previous, [label]: checked }));
  };

  const handleResetList = () => {
    setSelectedIds(defaultSelection);
    setQuantities({});
    setCheckedItems({});
    clearShoppingState();
  };

  const shareTarget = userName?.split(" ")[0] ?? "votre coach";

  return (
    <main className="mx-auto w-full max-w-[90rem] flex-1 px-4 pb-16 pt-8 lg:px-6">
      <header className="max-w-4xl space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-brand">Liste de Courses</p>
        <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">Génération de liste intelligente</h1>
        <p className="text-sm text-slate-500">
          Sélectionnez vos créations coup de cœur (ex: 3 plats + 2 desserts) et laissez NutriSmart consolider les ingrédients par rayon.
        </p>
      </header>

      <div className="mt-6 flex flex-wrap gap-3 rounded-3xl border border-slate-100 bg-white/80 p-4 shadow-sm">
        <input
          type="text"
          className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 focus:border-brand focus:outline-none"
          placeholder="Rechercher une recette, un ingrédient..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter.key}
              type="button"
              onClick={() => setActiveFilter(filter.key)}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                safeFilter === filter.key ? "bg-brand text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,2.2fr)_minmax(360px,1fr)] xl:grid-cols-[minmax(0,2.4fr)_minmax(420px,1fr)]">
        <section className="space-y-5 rounded-[32px] border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">Vos recettes ({filteredRecipes.length})</h2>
            <p className="text-sm text-slate-500">
              {selectedRecipes.length} recette(s) sélectionnée(s) - {selectedRecipes.reduce((sum, recipe) => sum + (recipe.duration_minutes ?? 20), 0)} min cumulées
            </p>
          </div>
          {filteredRecipes.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-500">
              Aucune recette ne correspond à votre recherche actuelle.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  selected={selectedIds.includes(recipe.id)}
                  onToggle={() => handleToggleRecipe(recipe.id)}
                />
              ))}
            </div>
          )}
        </section>

        <aside className="flex flex-col gap-5 rounded-[32px] border border-slate-100 bg-white p-6 shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-brand">Liste de Courses</p>
              <p className="text-sm text-slate-500">{selectedRecipes.length} recette(s) choisie(s)</p>
            </div>
            <span className="rounded-full bg-brand-soft px-4 py-1 text-sm font-semibold text-brand">
              {selectedRecipes.length || "0"}{" "}
              {selectedRecipes.length > 1 ? "recettes" : "recette"}
            </span>
          </div>

          <div className="grid gap-3 rounded-3xl bg-slate-50 p-4 text-sm text-slate-500 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Total estimé</p>
              <p className="mt-2 text-2xl font-semibold text-brand-strong">{formatCurrency(estimatedCost)}</p>
              <p className="text-xs text-slate-400">
                Panier {formatCurrency(shoppingCost)} • Nutrition {formatCurrency(macroCost)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Articles</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{totalItems}</p>
            </div>
          </div>

          <div className="space-y-4">
            {groupedItems.length === 0 && (
              <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                Sélectionnez au moins une recette pour générer votre liste de courses.
              </p>
            )}
            {groupedItems.map((group) => (
              <section key={group.category.id} className={`rounded-3xl border ${group.category.color} bg-slate-50/70 p-4`}>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900">{group.category.label}</p>
                  <span className="text-xs text-slate-500">{group.items.length} item(s)</span>
                </div>
                <ul className="mt-3 space-y-2">
                  {group.items.map((item) => (
                    <ShoppingItem
                      key={item.label}
                      item={item}
                      onQuantityChange={handleQuantityChange}
                      onToggle={handleToggleItem}
                    />
                  ))}
                </ul>
              </section>
            ))}
          </div>

          <div className="mt-auto space-y-3 pt-3">
            <button className="w-full rounded-2xl bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-strong">
              Partager avec {shareTarget}
            </button>
            <div className="flex gap-3">
              <button className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300">
                Copier
              </button>
              <button className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300">
                Imprimer
              </button>
            </div>
            <button
              type="button"
              onClick={handleResetList}
              className="w-full rounded-2xl border border-dashed border-slate-300 px-4 py-2 text-xs font-semibold text-slate-500 transition hover:border-brand hover:text-brand"
            >
              Réinitialiser la sélection
            </button>
            <p className="text-center text-xs text-slate-400">
              Sauvegarde automatique {restoredFromStorage ? "restaurée depuis votre dernière visite" : "activée"}.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}

type ShoppingListItem = {
  label: string;
  quantity: number;
  checked: boolean;
  price: number;
};

type RecipeCardProps = {
  recipe: RecipeWithIngredients;
  selected: boolean;
  onToggle: () => void;
};

function RecipeCard({ recipe, selected, onToggle }: RecipeCardProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`group relative flex flex-col overflow-hidden rounded-3xl border bg-white text-left shadow-sm transition ${
        selected ? "border-brand shadow-brand/20" : "border-slate-100 hover:-translate-y-1"
      }`}
    >
      <div className="relative h-40 w-full">
        <Image
          src={recipe.cover_image || FALLBACK_IMAGE}
          alt={recipe.title}
          fill
          sizes="(max-width: 768px) 100vw, 320px"
          className="object-cover transition duration-300 group-hover:scale-105"
        />
        <div
          className={`absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border ${
            selected ? "border-brand bg-brand text-white" : "border-white bg-white/80 text-slate-400"
          }`}
        >
          {selected ? "✓" : "+"}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 px-5 py-4">
        <span className="text-xs font-semibold uppercase tracking-[0.35em] text-brand">{recipe.category}</span>
        <h3 className="text-lg font-semibold text-slate-900">{recipe.title}</h3>
        <p className="text-sm text-slate-500">{recipe.description}</p>
        <div className="mt-auto flex flex-wrap gap-4 text-xs text-slate-500">
          {recipe.duration_minutes && (
            <span className="inline-flex items-center gap-1">
              ⏱️ {recipe.duration_minutes} min
            </span>
          )}
          {recipe.calories && (
            <span className="inline-flex items-center gap-1">
              🔥 {recipe.calories} kcal
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

type ShoppingItemProps = {
  item: ShoppingListItem;
  onQuantityChange: (label: string, delta: number) => void;
  onToggle: (label: string, checked: boolean) => void;
};

function ShoppingItem({ item, onQuantityChange, onToggle }: ShoppingItemProps) {
  const totalPrice = item.price * item.quantity;
  return (
    <li className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm">
      <label className="flex flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
        <span className="inline-flex items-center gap-3">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand"
            checked={item.checked}
            onChange={(event) => onToggle(item.label, event.target.checked)}
          />
          <span className={item.checked ? "text-slate-400 line-through" : ""}>{item.label}</span>
        </span>
        <span className="text-xs text-slate-400">{formatCurrency(item.price)} / unité</span>
      </label>
      <div className="flex items-center gap-1">
        <button
          type="button"
          className="h-8 w-8 rounded-full border border-slate-200 text-slate-600 transition hover:border-slate-300"
          onClick={() => onQuantityChange(item.label, -1)}
        >
          -
        </button>
        <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
        <button
          type="button"
          className="h-8 w-8 rounded-full border border-slate-200 text-slate-600 transition hover:border-slate-300"
          onClick={() => onQuantityChange(item.label, 1)}
        >
          +
        </button>
      </div>
      <span className="w-16 text-right text-xs font-semibold text-slate-600">{formatCurrency(totalPrice)}</span>
    </li>
  );
}

function aggregateIngredients(recipes: RecipeWithIngredients[]): AggregatedItem[] {
  const map = new Map<string, AggregatedItem>();
  recipes.forEach((recipe) => {
    (recipe.ingredients ?? []).forEach((ingredient) => {
      const label = ingredient.trim();
      if (!label) {
        return;
      }
      const normalizedCategory = categorizeIngredient(label);
      const catalogEntry = matchIngredientPrice(label);
      const entryMacros = catalogEntry?.nutrition ?? CATEGORY_MACRO_PRESETS[normalizedCategory];
      const estimatedPrice = catalogEntry?.price ?? derivePriceFromMacros(entryMacros, CATEGORY_BASE_COST[normalizedCategory]);
      if (map.has(label)) {
        const current = map.get(label)!;
        current.count += 1;
      } else {
        map.set(label, {
          label,
          count: 1,
          categoryId: catalogEntry?.category ?? normalizedCategory,
          unitPrice: estimatedPrice,
          priceSource: catalogEntry ? "catalog" : entryMacros ? "macro" : "category",
        });
      }
    });
  });
  return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
}

function matchIngredientPrice(label: string) {
  const normalized = normalizeText(label.toLowerCase());
  return INGREDIENT_DATABASE.find((entry) => entry.keywords.some((keyword) => normalized.includes(keyword)));
}

function derivePriceFromMacros(macros?: MacroProfile, fallbackBase?: number) {
  if (!macros) {
    return fallbackBase ?? 1.5;
  }
  const caloriesCost = (macros.calories ?? 0) * MACRO_PRICE_INDEX.calories;
  const proteinCost = (macros.protein ?? 0) * MACRO_PRICE_INDEX.protein;
  const carbsCost = (macros.carbs ?? 0) * MACRO_PRICE_INDEX.carbs;
  const fatCost = (macros.fat ?? 0) * MACRO_PRICE_INDEX.fat;
  const estimated = caloriesCost + proteinCost + carbsCost + fatCost;
  if (estimated === 0) {
    return fallbackBase ?? 1.5;
  }
  return Number.isFinite(estimated) ? estimated : fallbackBase ?? 1.5;
}

function estimateMacroCost(recipe: RecipeWithIngredients) {
  const macros: MacroProfile = {
    calories: recipe.calories ?? undefined,
    protein: recipe.protein ?? undefined,
    carbs: recipe.carbs ?? undefined,
    fat: recipe.fat ?? undefined,
  };
  return derivePriceFromMacros(macros, 5);
}

function blendCosts(cartCost: number, macroCost: number) {
  if (cartCost === 0 && macroCost === 0) {
    return 0;
  }
  if (cartCost === 0) {
    return macroCost;
  }
  if (macroCost === 0) {
    return cartCost;
  }
  return cartCost * 0.7 + macroCost * 0.3;
}

type LoadedShoppingState = {
  selectedIds: string[];
  quantities: Record<string, number>;
  checkedItems: Record<string, boolean>;
  fromStorage: boolean;
};

type PersistPayload = Omit<LoadedShoppingState, "fromStorage"> & { savedAt?: string };

function loadShoppingState(recipes: RecipeWithIngredients[], fallbackSelection: string[]): LoadedShoppingState {
  if (typeof window === "undefined") {
    return { selectedIds: fallbackSelection, quantities: {}, checkedItems: {}, fromStorage: false };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { selectedIds: fallbackSelection, quantities: {}, checkedItems: {}, fromStorage: false };
    }
    const parsed = JSON.parse(raw) as PersistPayload;
    const validIds = new Set(recipes.map((recipe) => recipe.id));
    const selectedIds = (parsed.selectedIds ?? []).filter((id) => validIds.has(id));
    return {
      selectedIds,
      quantities: parsed.quantities ?? {},
      checkedItems: parsed.checkedItems ?? {},
      fromStorage: selectedIds.length > 0,
    };
  } catch {
    return { selectedIds: fallbackSelection, quantities: {}, checkedItems: {}, fromStorage: false };
  }
}

function persistShoppingState(state: PersistPayload) {
  if (typeof window === "undefined") {
    return;
  }
  const payload: PersistPayload = {
    selectedIds: state.selectedIds,
    quantities: state.quantities,
    checkedItems: state.checkedItems,
    savedAt: new Date().toISOString(),
  };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function clearShoppingState() {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(STORAGE_KEY);
}

function categorizeIngredient(label: string): ShoppingCategoryId {
  const normalized = normalizeText(label.toLowerCase());
  const match = Object.entries(CATEGORY_KEYWORDS).find(([, keywords]) => keywords.some((keyword) => normalized.includes(keyword)));
  if (match) {
    return match[0] as ShoppingCategoryId;
  }
  return FALLBACK_CATEGORY;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(value);
}

function normalizeText(value: string) {
  return value.normalize("NFD").replaceAll(/[\u0300-\u036f]/g, "");
}
