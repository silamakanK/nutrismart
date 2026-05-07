"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV_LINKS = [
  { href: "/recettes", label: "Mes Recettes" },
  { href: "/generation", label: "Créer une recette" },
  { href: "/profile", label: "Profil" },
  { href: "/courses", label: "Liste de courses" },
];

export function MainNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/recettes" && pathname.startsWith("/recettes")) {
      return true;
    }

    return pathname === href;
  };

  return (
    <header className="w-full border-b border-slate-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:gap-6">
        <Link
          href="/recettes"
          className="flex items-center gap-3 rounded-full px-3 py-2 transition hover:bg-brand-soft"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-soft text-lg font-semibold text-brand">
            N
          </span>
          <div className="leading-tight">
            <p className="text-base font-semibold text-slate-900">NutriSmart</p>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">IA & Nutrition</p>
          </div>
        </Link>

        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-brand-soft hover:text-brand lg:hidden"
          aria-label={open ? "Masquer la navigation" : "Afficher la navigation"}
          aria-expanded={open}
          onClick={() => setOpen((prev) => !prev)}
        >
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {open ? (
              <path d="M18 6 6 18M6 6l12 12" />
            ) : (
              <>
                <path d="M4 6h16" />
                <path d="M4 12h16" />
                <path d="M4 18h16" />
              </>
            )}
          </svg>
        </button>

        <nav
          className={`${
            open
              ? "absolute left-0 top-full z-20 flex w-full border-b border-slate-100 bg-white/95 px-4 pb-4 pt-4 shadow-lg"
              : "hidden"
          } flex-col gap-3 lg:static lg:z-auto lg:flex lg:w-auto lg:flex-row lg:items-center lg:gap-2 lg:border-none lg:bg-transparent lg:p-0 lg:shadow-none`}
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  isActive(link.href)
                    ? "bg-brand-soft text-brand"
                    : "text-slate-600 hover:bg-slate-100 hover:text-brand"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/connexion/"
              className="inline-flex items-center justify-center rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-strong"
              onClick={() => setOpen(false)}
            >
              Se déconnecter
            </Link>
        </nav>
      </div>
    </header>
  );
}
