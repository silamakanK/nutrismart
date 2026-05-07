"use server";

import supabase, { getUser } from "@/supabase/client";
import { Nutrient, RecipeDetail } from "@/types/recipes";
import OpenAI from "openai";

type GenerateRecipeInput = {
  name: string;
  people: number;
  mealType: string;
  ingredients: string[];
  dietTags: string[];
  calories: number;
  protein: number;
};

type GenerateRecipeResult =
  | { success: true; recipe: RecipeDetail }
  | { success: false; message: string };

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80";

type DraftRecipeJSON = {
  title?: string;
  summary?: string;
  category?: string;
  image?: string;
  tags?: string[];
  duration?: number;
  difficulty?: string;
  macros?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  nutrients?: Nutrient[];
  ingredients?: string[];
  steps?: string[];
};

export async function generateAiRecipe(payload: GenerateRecipeInput): Promise<GenerateRecipeResult> {
  const user = await getUser();
  
  if (!user) {
    return { success: false, message: "Utilisateur non authentifié." };
  }

  const apiKey = process.env.OPENAI_API_KEY ?? process.env.OPENAI_KEY;

  if (!apiKey) {
    return { success: false, message: "Clé OpenAI manquante." };
  }

  try {
    const client = new OpenAI({ apiKey });
    const instructions = buildPrompt(payload);
    const response = await client.responses.create({
      model: "gpt-4o-mini",
      instructions: 'Tu es nutritionniste et un chef de cuisine expérimenté.',
      input: instructions
    });

    const outputText = response.output_text ?? "";
    const parsed = parseRecipeJson(outputText);
    if (!parsed) {
      return { success: false, message: "Impossible de comprendre la réponse IA." };
    }

    const normalized = normalizeRecipe(parsed, payload);
    const clientDb = await supabase();
    const slug = createSlug(normalized.title ?? `recette-${Date.now()}`);

    const { data, error } = await clientDb
      .from("recipes")
      .insert({
        user_id: user.id,
        slug,
        title: normalized.title,
        description: normalized.summary,
        cover_image: normalized.image ?? FALLBACK_IMAGE,
        category: normalized.category ?? payload.mealType,
        tags: normalized.tags,
        servings: payload.people,
        duration_minutes: normalized.duration,
        difficulty: normalized.difficulty,
        calories: normalized.macros.calories,
        protein: normalized.macros.protein,
        carbs: normalized.macros.carbs,
        fat: normalized.macros.fat,
        ingredients: normalized.ingredients,
        steps: normalized.steps,
        nutrients: normalized.nutrients,
      })
      .select(
        "id, slug, title, description, cover_image, category, tags, created_at, duration_minutes, difficulty, calories, protein, carbs, fat, servings, ingredients, steps, nutrients"
      )
      .single();

    if (error || !data) {
      console.error(error);
      return { success: false, message: "Enregistrement impossible. Vérifiez la base de données." };
    }

    const recipe: RecipeDetail = {
      ...data,
      tags: Array.isArray(data.tags) ? data.tags : [],
      ingredients: (data.ingredients as string[]) ?? [],
      steps: (data.steps as string[]) ?? [],
      nutrients: (data.nutrients as RecipeDetail["nutrients"]) ?? [],
    };

    return { success: true, recipe };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Erreur côté IA. Réessaie dans quelques instants." };
  }
}

function buildPrompt(payload: GenerateRecipeInput) {
  const ingredients = payload.ingredients.length ? payload.ingredients.join(", ") : "ingrédients libres";
  const diets = payload.dietTags.length ? payload.dietTags.join(", ") : "aucune restriction";
  return `T
    Génère une nouvelle recette équilibrée en te basant sur ces informations :
    - Nom proposé : ${payload.name}
    - Nombre de personnes : ${payload.people}
    - Type de repas : ${payload.mealType}
    - Ingrédients disponibles : ${ingredients}
    - Régimes / contraintes : ${diets}
    - Calories souhaitées ~${payload.calories} kcal, protéines min ${payload.protein} g

    Réponds UNIQUEMENT avec un JSON valide et parsable, sans texte additionnel, respectant ce schéma :
    {
      "title": "",
      "summary": "",
      "category": "",
      "tags": [""],
      "image": "",
      "duration": 30,
      "difficulty": "Facile",
      "macros": { "calories": 520, "protein": 30, "carbs": 60, "fat": 18 },
      "nutrients": [ { "label": "", "value": "", "info": "" } ],
      "ingredients": [""],
      "steps": [""]
    }`;
}

function parseRecipeJson(text: string) {
  const jsonMatch = text.match(/```json([\s\S]*?)```/i) ?? text.match(/```([\s\S]*?)```/i);
  const payload = jsonMatch ? jsonMatch[1] : text;
  try {
    return JSON.parse(payload.trim());
  } catch (error) {
    console.error("JSON parsing error", error, payload);
    return null;
  }
}

function normalizeRecipe(json: DraftRecipeJSON, payload: GenerateRecipeInput) {
  const macros = json.macros ?? {};
  return {
    title: json.title ?? payload.name,
    summary: json.summary ?? "Recette générée par NutriSmart",
    category: json.category ?? payload.mealType,
    image: json.image ?? FALLBACK_IMAGE,
    tags: Array.isArray(json.tags) ? json.tags : payload.dietTags,
    duration: typeof json.duration === "number" ? json.duration : 25,
    difficulty: json.difficulty ?? "Facile",
    macros: {
      calories: typeof macros.calories === "number" ? macros.calories : payload.calories,
      protein: typeof macros.protein === "number" ? macros.protein : payload.protein,
      carbs: typeof macros.carbs === "number" ? macros.carbs : Math.round(payload.calories * 0.45) / 4,
      fat: typeof macros.fat === "number" ? macros.fat : 18,
    },
    nutrients: Array.isArray(json.nutrients) ? json.nutrients : [],
    ingredients: Array.isArray(json.ingredients) ? json.ingredients : payload.ingredients,
    steps: Array.isArray(json.steps) ? json.steps : ["Préparez les ingrédients.", "Assemblez et servez."],
  };
}

function createSlug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replaceAll(/[\u0300-\u036f]/g, "")
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/(^-|-$)+/g, "")
    .slice(0, 80);
}

export type { GenerateRecipeInput, GenerateRecipeResult };
