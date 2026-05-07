import Image from "next/image";
import Link from "next/link";
import { JSX, SVGProps } from "react";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&w=1200&q=80";

type FeatureCard = {
  title: string;
  description: string;
  Icon: (props: SVGProps<SVGSVGElement>) => JSX.Element;
  accent: string;
};

const FEATURES: FeatureCard[] = [
  {
    title: "Recettes & Nutrition",
    description:
      "Génération sur mesure avec analyse calorique précise pour chaque repas.",
    Icon: PinIcon,
    accent: "bg-brand-soft text-brand",
  },
  {
    title: "Profil Alimentaire",
    description:
      "Gestion des intolérances, régimes spécifiques et objectifs santé personnels.",
    Icon: ProfileIcon,
    accent: "bg-amber-100 text-amber-600",
  },
  {
    title: "Explorer les Recettes",
    description:
      "Recherche intuitive et visualisation claire de milliers de possibilités.",
    Icon: SearchIcon,
    accent: "bg-sky-100 text-sky-600",
  },
  {
    title: "Création & Courses",
    description:
      "Critères personnalisés et génération de listes de courses automatiques.",
    Icon: BasketIcon,
    accent: "bg-violet-100 text-violet-600",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8fbff] via-[#f4f7fb] to-[#ecf3f7] text-slate-900">
      <div className="mx-auto max-w-6xl px-4 pb-12 pt-8 sm:px-6 lg:px-8 lg:pb-16">
        <header className="flex flex-col gap-4 rounded-2xl bg-white/80 p-4 backdrop-blur md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[color:rgba(96,153,62,0.15)] text-xl font-semibold text-brand">
              C
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-900">NutriSmart</p>
              <p className="text-xs text-slate-500">Votre chef personnel</p>
            </div>
          </div>
          <div className="flex flex-col gap-3 text-sm text-slate-600 sm:flex-row sm:items-center">
            <p>
              Déjà membre ?{" "}
              <Link
                href="/connexion"
                className="font-semibold text-brand underline-offset-4 hover:underline"
              >
                Se connecter
              </Link>
            </p>
            <Link
              href="/inscription"
              className="inline-flex items-center justify-center rounded-full bg-brand px-5 py-2 font-semibold text-white shadow-sm transition hover:bg-brand-strong"
            >
              Créer un compte
            </Link>
          </div>
        </header>

        <main className="mt-10 space-y-14">
          <section className="grid gap-10 rounded-[32px] bg-white p-8 shadow-2xl ring-1 ring-slate-100 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <p className="inline-flex items-center rounded-full bg-brand-soft px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-brand">
                Nutrition & IA
              </p>
              <div className="space-y-4">
                <h1 className="text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl">
                  Votre Chef <span className="text-brand">Personnel</span>
                </h1>
                <p className="text-lg text-slate-600">
                  Créez, planifiez et cuisinez sainement grâce à l&apos;IA.
                  Une approche sur mesure pour votre santé et vos envies du
                  jour.
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/inscription"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-brand-strong"
                >
                  Commencer maintenant
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
                <Link
                  href="/recettes"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 px-6 py-3 font-semibold text-slate-700 transition hover:border-slate-300"
                >
                  En savoir plus
                </Link>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                    IA
                  </span>
                  Suivi nutritionnel actif
                </div>
                <p className="text-sm text-slate-500">
                  Rejoint par{" "}
                  <span className="font-semibold text-slate-900">
                    +10 000 gourmets
                  </span>
                </p>
              </div>
            </div>
            <div className="relative rounded-[28px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 shadow-xl">
              <div className="overflow-hidden rounded-[22px]">
                <Image
                  src={HERO_IMAGE}
                  alt="Ingrédients frais sur un plan de travail"
                  width={800}
                  height={600}
                  className="h-full max-h-[360px] w-full object-cover"
                  priority
                />
              </div>
              <div className="absolute bottom-6 left-6 right-6 rounded-2xl bg-white/95 px-5 py-4 text-slate-900 shadow-lg">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                  <span>Recette du jour</span>
                  <span>320 kcal</span>
                </div>
                <p className="mt-2 text-lg font-semibold text-slate-900">
                  Salade méditerranéenne
                </p>
                <p className="text-sm text-slate-500">
                  Prête en 15 minutes · Parfaite pour le déjeuner
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="space-y-2 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand">
                Fonctionnalités clés
              </p>
              <h2 className="text-3xl font-semibold text-slate-900">
                Tout ce qu&apos;il faut pour transformer votre routine culinaire
              </h2>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              {FEATURES.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-3xl bg-white p-6 shadow-lg ring-1 ring-slate-100"
                >
                  <div
                    className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${feature.accent}`}
                  >
                    <feature.Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[32px] bg-gradient-to-r from-brand-soft via-white to-sky-50 p-8 shadow-xl ring-1 ring-brand-soft">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-brand">
                  Prêt à vous lancer ?
                </p>
                <h3 className="mt-3 text-3xl font-semibold text-slate-900">
                  Prêt à transformer votre alimentation ?
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  Rejoignez-nous aujourd&apos;hui et laissez l&apos;IA simplifier
                  votre cuisine quotidienne.
                </p>
              </div>
              <Link
                href="/inscription"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-brand-strong"
              >
                Créer mon compte gratuitement
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
          </section>
        </main>

        <footer className="mt-12 flex flex-col gap-4 border-t border-slate-200 pt-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} ChefIA. Tous droits réservés.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-slate-800">
              Confidentialité
            </Link>
            <Link href="#" className="hover:text-slate-800">
              Conditions
            </Link>
            <Link href="#" className="hover:text-slate-800">
              Contact
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}

function ArrowRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m13 6 6 6-6 6" />
      <path d="M5 12h14" />
    </svg>
  );
}

function PinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        strokeWidth={1.6}
        d="M12 2C8.5 2 6 4.627 6 8.1 6 12.86 12 22 12 22s6-9.14 6-13.9C18 4.626 15.5 2 12 2Z"
      />
      <circle cx="12" cy="8.5" r="2" strokeWidth={1.6} />
    </svg>
  );
}

function ProfileIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <circle cx="12" cy="7.5" r="3.5" strokeWidth={1.6} />
      <path
        strokeWidth={1.6}
        d="M5 20c1.5-3.5 4.2-5.5 7-5.5s5.5 2 7 5.5"
      />
    </svg>
  );
}

function SearchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <circle cx="11" cy="11" r="6" strokeWidth={1.6} />
      <path strokeWidth={1.6} strokeLinecap="round" d="m16 16 4 4" />
    </svg>
  );
}

function BasketIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        strokeWidth={1.6}
        d="M3 8h18l-1.5 11.5a2 2 0 0 1-2 1.5H6.5a2 2 0 0 1-2-1.5L3 8Z"
      />
      <path strokeWidth={1.6} strokeLinecap="round" d="M9 8V5a3 3 0 0 1 6 0v3" />
    </svg>
  );
}
