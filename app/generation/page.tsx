import type { Metadata } from "next";
import { MainNav } from "@/components/MainNav";
import GenerationContent from "./content";

export const metadata: Metadata = {
  title: "Générer une recette IA | NutriSmart",
  description: "Décrivez vos envies culinaires pour que l'IA propose une recette équilibrée.",
};

export default function GenerationPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f6f7f2] text-slate-900">
      <MainNav />
      <GenerationContent />
    </div>
  );
}
